import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Apple,
  Check,
  ChevronDown,
  ClipboardCopy,
  Copy,
  Flag,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
  Search,
  ShoppingBag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/cn';
import type { USAddress } from '../../data/tools/us-address-data';
import {
  COUNTRIES,
  REGION_LABELS,
  REGION_ORDER,
  TAX_FREE_STATES,
  formatAddressAsText,
  isCountryCode,
  isTaxFreeState,
  type CountryCode,
  type WorldRegion,
} from '../../data/tools/address-generator-data';
import {
  generateWorldAddress,
  loadCountryRegions,
} from '../../lib/address-generate-api';

const STORAGE_KEY = 'alephyeah-world-addresses';

type SavedAddress = USAddress & { countryCode: CountryCode };

function loadSaved(): SavedAddress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedAddress[];
    return parsed.map((item) => ({
      ...item,
      email: item.email || '',
      occupation: item.occupation || '',
      gender: item.gender || '',
      birthDate: item.birthDate || '',
      country: item.country || 'United States',
      countryCode: isCountryCode(item.countryCode) ? item.countryCode : 'US',
    }));
  } catch {
    return [];
  }
}

function saveAddresses(addrs: SavedAddress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addrs));
}

function useCopy() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = useCallback(async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 1500);
  }, []);

  return { copiedField, copy };
}

const FieldRow = ({
  label,
  value,
  fieldId,
  copiedField,
  onCopy,
  last = false,
}: {
  label: string;
  value: string;
  fieldId: string;
  copiedField: string | null;
  onCopy: (text: string, id: string) => void;
  last?: boolean;
}) => {
  const done = copiedField === fieldId;
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 sm:px-5',
        !last && 'border-b border-border/60',
      )}
    >
      <div className="w-24 shrink-0 text-sm text-foreground/50 sm:w-28">{label}</div>
      <div className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{value || '—'}</div>
      <button
        type="button"
        onClick={() => onCopy(value, fieldId)}
        disabled={!value || value === '—'}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
          done
            ? 'bg-emerald-500/10 text-emerald-700'
            : 'text-foreground/35 hover:bg-accent/8 hover:text-foreground',
        )}
        title="复制"
      >
        {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
};

const FieldCard = ({
  title,
  onCopyAll,
  copyAllId,
  copiedField,
  copyAllLabel,
  copiedLabel,
  children,
}: {
  title: string;
  onCopyAll?: () => void;
  copyAllId?: string;
  copiedField: string | null;
  copyAllLabel: string;
  copiedLabel: string;
  children: ReactNode;
}) => (
  <div className="overflow-hidden rounded-2xl border border-border bg-background">
    <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
      <h2 className="text-base font-medium text-foreground">{title}</h2>
      {onCopyAll && copyAllId ? (
        <button
          type="button"
          onClick={onCopyAll}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium',
            copiedField === copyAllId
              ? 'bg-accent/15 text-accent'
              : 'text-foreground/45 hover:bg-accent/8 hover:text-foreground',
          )}
        >
          {copiedField === copyAllId ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
          {copiedField === copyAllId ? copiedLabel : copyAllLabel}
        </button>
      ) : null}
    </div>
    <div>{children}</div>
  </div>
);

const SubdivisionFilter = ({
  countryCode,
  value,
  onChange,
  isZh,
  options,
  loading,
}: {
  countryCode: CountryCode;
  value: string;
  onChange: (next: string) => void;
  isZh: boolean;
  options: Array<{ code: string; name: string }>;
  loading?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const label =
    value === ''
      ? isZh
        ? '全部州/省'
        : 'All regions'
      : options.find((s) => s.code === value)?.name ?? value;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full sm:w-48">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={cn(
          'flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl border border-border bg-background px-3.5 text-sm',
          'hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20',
          open && 'border-accent/40 ring-2 ring-accent/15',
          loading && 'opacity-60',
        )}
      >
        <span className="truncate font-medium">
          {loading ? (isZh ? '加载区划…' : 'Loading…') : label}
        </span>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-foreground/35" />
        ) : (
          <ChevronDown className={cn('h-4 w-4 text-foreground/35 transition-transform', open && 'rotate-180')} />
        )}
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-64 overflow-y-auto rounded-2xl border border-border bg-background p-1.5 shadow-[0_16px_40px_rgba(45,42,36,0.14)]">
          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className={cn(
              'flex w-full rounded-xl px-3 py-2 text-left text-sm',
              value === '' ? 'bg-accent/12 font-medium' : 'hover:bg-accent/8',
            )}
          >
            {isZh ? '全部州/省' : 'All regions'}
          </button>
          {options.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => {
                onChange(s.code);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm',
                value === s.code ? 'bg-accent/12 font-medium' : 'hover:bg-accent/8',
              )}
            >
              <span>
                {s.code} · {s.name}
              </span>
              {countryCode === 'US' && isTaxFreeState(s.code) ? (
                <span className="text-[10px] text-emerald-600">{isZh ? '免税' : 'Tax-free'}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const CountrySidebar = ({
  countryCode,
  taxFreeMode,
  isZh,
  countriesByRegion,
  onSelectCountry,
  onSelectTaxFree,
  className,
}: {
  countryCode: CountryCode;
  taxFreeMode: boolean;
  isZh: boolean;
  countriesByRegion: Record<WorldRegion, typeof COUNTRIES>;
  onSelectCountry: (code: CountryCode) => void;
  onSelectTaxFree: () => void;
  className?: string;
}) => (
  <div
    className={cn(
      'flex flex-col overflow-hidden rounded-2xl border border-border bg-background',
      className,
    )}
  >
    <div className="border-b border-border/60 px-3.5 py-3">
      <div className="text-xs font-medium text-foreground/50">
        {isZh ? '选择国家 / 地区' : 'Country / Region'}
      </div>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:thin]">
      {REGION_ORDER.map((region) => (
        <div key={region} className="mb-3 last:mb-1">
          <div className="px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-foreground/40">
            {isZh ? REGION_LABELS[region].zh : REGION_LABELS[region].en}
          </div>
          <div className="space-y-0.5">
            {countriesByRegion[region].map((c) => {
              const active = !taxFreeMode && c.code === countryCode;
              return (
                <div key={c.code}>
                  <button
                    type="button"
                    onClick={() => onSelectCountry(c.code)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors',
                      active
                        ? 'bg-muted font-medium text-foreground'
                        : 'text-foreground/75 hover:bg-muted/60',
                    )}
                  >
                    <span className="w-7 shrink-0 text-[11px] font-medium uppercase tracking-wide text-foreground/40">
                      {c.code}
                    </span>
                    <span className="min-w-0 truncate">{isZh ? c.nameZh : c.nameEn}</span>
                  </button>
                  {c.code === 'US' ? (
                    <button
                      type="button"
                      onClick={onSelectTaxFree}
                      className={cn(
                        'mt-0.5 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors',
                        taxFreeMode
                          ? 'bg-muted font-medium text-foreground'
                          : 'text-foreground/75 hover:bg-muted/60',
                      )}
                    >
                      <span className="w-7 shrink-0 text-center text-sm" aria-hidden>
                        💰
                      </span>
                      <span>{isZh ? '免税州' : 'Tax-free'}</span>
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const USAddressGenerator = () => {
  const { locale } = usePreferences();
  const isZh = locale === 'zh';
  const { copiedField, copy } = useCopy();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCountry = (() => {
    const q = searchParams.get('country')?.toUpperCase() ?? '';
    return isCountryCode(q) ? q : 'US';
  })();

  const [countryCode, setCountryCode] = useState<CountryCode>(initialCountry);
  const [taxFreeMode, setTaxFreeMode] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [address, setAddress] = useState<(USAddress & { countryCode: CountryCode }) | null>(null);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [saved, setSaved] = useState<SavedAddress[]>(loadSaved);
  const [showSaved, setShowSaved] = useState(true);
  const [savedToast, setSavedToast] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const [regions, setRegions] = useState<Array<{ code: string; name: string }>>([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const generateSeq = useRef(0);

  const countryMeta = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode)!,
    [countryCode],
  );

  const countriesByRegion = useMemo(() => {
    const map = {} as Record<WorldRegion, typeof COUNTRIES>;
    for (const region of REGION_ORDER) {
      map[region] = COUNTRIES.filter((c) => c.region === region);
    }
    return map;
  }, []);

  useEffect(() => {
    saveAddresses(saved);
  }, [saved]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('country', countryCode.toLowerCase());
        return next;
      },
      { replace: true },
    );
  }, [countryCode, setSearchParams]);

  const generate = useCallback(
    async (overrideState?: string | null, overrideCountry?: CountryCode) => {
      const code = overrideCountry ?? countryCode;
      const seq = ++generateSeq.current;
      setGenerating(true);
      try {
        const options: { state?: string; city?: string } = {};
        const stateCode = overrideState === null ? '' : (overrideState ?? selectedState);
        if (stateCode) options.state = stateCode;

        const q = searchQuery.trim();
        if (q && overrideState == null) {
          const stateMatch = regions.find(
            (s) => s.code === q.toUpperCase() || s.name.toLowerCase() === q.toLowerCase(),
          );
          if (stateMatch) options.state = stateMatch.code;
          else options.city = q;
        }

        const next = await generateWorldAddress(code, options);
        if (generateSeq.current === seq) setAddress(next);
      } finally {
        if (generateSeq.current === seq) setGenerating(false);
      }
    },
    [countryCode, searchQuery, selectedState, regions],
  );

  const skipCountryEffect = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setRegionsLoading(true);
      try {
        const nextRegions = await loadCountryRegions(countryCode);
        if (!cancelled) setRegions(nextRegions);
      } finally {
        if (!cancelled) setRegionsLoading(false);
      }

      if (skipCountryEffect.current) {
        skipCountryEffect.current = false;
        return;
      }
      if (cancelled) return;
      setTaxFreeMode(false);
      setSelectedState('');
      await generate(null, countryCode);
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  const selectCountry = (code: CountryCode) => {
    setTaxFreeMode(false);
    setMobileSidebarOpen(false);
    if (code === countryCode) {
      void generate(null, code);
      return;
    }
    setCountryCode(code);
  };

  const selectTaxFree = () => {
    setMobileSidebarOpen(false);
    setTaxFreeMode(true);
    const st = TAX_FREE_STATES[Math.floor(Math.random() * TAX_FREE_STATES.length)];
    setSelectedState(st.code);
    if (countryCode !== 'US') {
      skipCountryEffect.current = true;
      setCountryCode('US');
    }
    void generate(st.code, 'US');
  };

  const saveCurrent = useCallback(() => {
    if (!address) return;
    setSaved((prev) => [address, ...prev]);
    setShowSaved(true);
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 2000);
  }, [address]);

  const fullName = useMemo(
    () => (address ? `${address.firstName} ${address.lastName}` : ''),
    [address],
  );
  const isTaxFree =
    Boolean(address) &&
    countryCode === 'US' &&
    (taxFreeMode || isTaxFreeState(address!.stateCode));
  const countryName = isZh ? countryMeta.nameZh : countryMeta.nameEn;

  const faqItems = useMemo(
    () => [
      {
        q: isZh ? `生成的${countryName}地址是真实可用的吗？` : `Are generated ${countryName} addresses real?`,
        a: isZh
          ? '均为虚构测试数据，仅用于表单校验与开发联调，不对应真实住址。'
          : 'All data is fictional for testing and form validation — not real addresses.',
      },
      {
        q: isZh
          ? `可以把生成的${countryName}数据用于真实注册或购物吗？`
          : `Can I use ${countryName} data for real shopping?`,
        a: isZh
          ? '不建议用于真实商业用途。如需真实邮寄地址，请使用本人真实信息。'
          : 'Not recommended for real commerce. Use your own address for deliveries.',
      },
      {
        q: isZh ? `你们会存储我生成的${countryName}数据吗？` : `Do you store generated ${countryName} data?`,
        a: isZh
          ? '不会上传服务器。仅可选保存在本机浏览器 localStorage，可随时清空。'
          : 'No server storage. Optional saves stay in your browser localStorage only.',
      },
      {
        q: isZh ? `测试${countryName}时如何选择地区更高效？` : `How do I pick regions for ${countryName}?`,
        a: isZh
          ? '先在右侧国家列表点选目标国家，再用州/省筛选或搜索城市；也可点「免税州」快速生成。'
          : 'Pick a country from the right sidebar, then filter by subdivision or search a city. Use Tax-free for US sales-tax-free states.',
      },
      {
        q: isZh ? `${countryName}地址生成器主要用于什么场景？` : `What is the ${countryName} generator for?`,
        a: isZh
          ? '软件测试、表单校验、账号资料填写演练、开发环境假数据填充等。支持 20+ 国家切换。'
          : 'QA, form validation, signup dry-runs, and mock data — with 20+ countries.',
      },
    ],
    [countryName, isZh],
  );

  return (
    <>
      <div className="mb-6 lg:mb-8">
        <div className="mb-3 flex items-center gap-2 text-accent">
          <MapPin className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-[0.16em]">
            {isZh ? '工具' : 'Tool'}
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-light text-foreground">
          {isZh ? `${countryName}地址生成器` : `${countryName} Address Generator`}
        </h1>
        <p className="max-w-2xl text-foreground/60">
          {isZh
            ? '专业的地址生成器，无需注册。随机生成格式有效的地址、邮政编码与身份信息示例，支持全球 20+ 国家切换，用于账号注册测试、软件测试与表单校验。'
            : 'Free multi-country address generator. Create valid-format street, postal, and identity samples across 20+ countries for testing.'}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void generate();
                }}
                placeholder={isZh ? '搜索城市或州/省' : 'Search city or region'}
                className={cn(
                  'w-full rounded-2xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm',
                  'focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10',
                )}
              />
            </div>
            <SubdivisionFilter
              countryCode={countryCode}
              value={selectedState}
              options={regions}
              loading={regionsLoading}
              onChange={(next) => {
                setTaxFreeMode(false);
                setSelectedState(next);
              }}
              isZh={isZh}
            />
            <button
              type="button"
              onClick={() => void generate()}
              disabled={generating || regionsLoading}
              className={cn(
                'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-medium text-white',
                'hover:brightness-95 disabled:opacity-50',
              )}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {isZh ? '生成地址' : 'Generate'}
            </button>
          </div>

          <section className="mb-6">
            {address ? (
              <FieldCard
                title={isZh ? '地址示例' : 'Address sample'}
                copiedField={copiedField}
                copyAllId="all-address"
                copyAllLabel={isZh ? '复制' : 'Copy'}
                copiedLabel={isZh ? '已复制' : 'Copied'}
                onCopyAll={() =>
                  copy(
                    [
                      address.country,
                      address.street,
                      address.city,
                      address.state,
                      address.stateCode,
                      address.zipCode,
                    ].join('\n'),
                    'all-address',
                  )
                }
              >
                <FieldRow label={isZh ? '国家' : 'Country'} value={address.country} fieldId="country" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '街道地址' : 'Street'} value={address.street} fieldId="street" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '城市' : 'City'} value={address.city} fieldId="city" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '州/省' : 'State / Province'} value={address.state} fieldId="state" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '州编码' : 'State code'} value={address.stateCode} fieldId="stateCode" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '邮政编码' : 'Postal code'} value={address.zipCode} fieldId="zip" copiedField={copiedField} onCopy={copy} last />
              </FieldCard>
            ) : (
              <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-foreground/40">
                {isZh ? '点击「生成地址」开始' : 'Tap Generate to start'}
              </div>
            )}
            {isTaxFree && address ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span>
                  {isZh
                    ? `该地址位于 ${address.state}（免税州），购物可能免收消费税。`
                    : `${address.state} is a tax-free state — purchases may skip sales tax.`}
                </span>
              </div>
            ) : null}
          </section>

          <section className="mb-6">
            {address ? (
              <FieldCard
                title={isZh ? '身份信息示例' : 'Identity sample'}
                copiedField={copiedField}
                copyAllId="all-identity"
                copyAllLabel={isZh ? '复制' : 'Copy'}
                copiedLabel={isZh ? '已复制' : 'Copied'}
                onCopyAll={() =>
                  copy(
                    [
                      fullName,
                      address.phone,
                      address.email,
                      address.occupation,
                      address.gender,
                      address.birthDate,
                    ].join('\n'),
                    'all-identity',
                  )
                }
              >
                <FieldRow label={isZh ? '示例姓名' : 'Full name'} value={fullName} fieldId="name" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '示例电话' : 'Phone'} value={address.phone} fieldId="phone" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '邮箱' : 'Email'} value={address.email} fieldId="email" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '职业' : 'Occupation'} value={address.occupation} fieldId="occupation" copiedField={copiedField} onCopy={copy} />
                <FieldRow
                  label={isZh ? '性别' : 'Gender'}
                  value={
                    isZh
                      ? address.gender === 'Male'
                        ? '男'
                        : address.gender === 'Female'
                          ? '女'
                          : address.gender
                      : address.gender
                  }
                  fieldId="gender"
                  copiedField={copiedField}
                  onCopy={copy}
                />
                <FieldRow label={isZh ? '出生日期' : 'Date of birth'} value={address.birthDate} fieldId="birthDate" copiedField={copiedField} onCopy={copy} last />
              </FieldCard>
            ) : null}

            <div className="mt-4 rounded-2xl border border-border bg-background p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={saveCurrent}
                  disabled={!address}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent/90 px-3.5 py-2 text-xs font-medium text-white hover:bg-accent disabled:opacity-40"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isZh ? '保存信息' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaved((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-foreground/60 hover:bg-accent/5"
                >
                  <User className="h-3.5 w-3.5" />
                  {isZh ? `已保存信息 ${saved.length}` : `Saved ${saved.length}`}
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showSaved && 'rotate-180')} />
                </button>
                <button
                  type="button"
                  onClick={() => address && copy(formatAddressAsText(address), 'all')}
                  disabled={!address}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-medium',
                    copiedField === 'all'
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'text-foreground/60 hover:bg-accent/5',
                  )}
                >
                  {copiedField === 'all' ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                  {copiedField === 'all' ? (isZh ? '已复制全部' : 'Copied all') : isZh ? '复制全部' : 'Copy all'}
                </button>
                <p className="w-full text-xs text-foreground/40 sm:ml-auto sm:w-auto">
                  {isZh
                    ? '该示例信息将保存为你的私有测试数据，便于固定使用'
                    : 'Saved privately in this browser for reuse'}
                </p>
              </div>

              {showSaved ? (
                <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground/60">
                      {isZh ? '已保存信息' : 'Saved entries'}
                    </span>
                    {saved.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSaved([])}
                        className="inline-flex items-center gap-1 text-xs text-foreground/40 hover:text-rose-500"
                      >
                        <Trash2 className="h-3 w-3" />
                        {isZh ? '清空' : 'Clear'}
                      </button>
                    ) : null}
                  </div>
                  {saved.length === 0 ? (
                    <p className="py-6 text-center text-sm text-foreground/35">
                      {isZh
                        ? '暂无数据，点击「保存信息」可将生成的地址保存到此处。'
                        : 'No saved data yet. Tap Save to keep an address here.'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {saved.map((addr, i) => {
                        const meta = COUNTRIES.find((c) => c.code === addr.countryCode);
                        return (
                          <div
                            key={`${addr.countryCode}-${addr.zipCode}-${i}`}
                            className="group flex items-start justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                          >
                            <div className="min-w-0 flex-1 text-sm text-foreground/70">
                              <span className="mr-1.5">{meta?.flag}</span>
                              <span className="font-medium text-foreground">
                                {addr.firstName} {addr.lastName}
                              </span>
                              <span className="mx-1.5 text-foreground/25">·</span>
                              {addr.occupation || '—'}
                              <span className="mx-1.5 text-foreground/25">·</span>
                              {addr.city}, {addr.stateCode} {addr.zipCode}
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setTaxFreeMode(false);
                                  setCountryCode(addr.countryCode);
                                  setAddress(addr);
                                }}
                                className="rounded-md p-1.5 text-foreground/35 hover:bg-accent/10 hover:text-accent"
                                title={isZh ? '应用' : 'Apply'}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => copy(formatAddressAsText(addr), `saved-${i}`)}
                                className="rounded-md p-1.5 text-foreground/35 hover:bg-accent/10 hover:text-accent"
                                title={isZh ? '复制' : 'Copy'}
                              >
                                {copiedField === `saved-${i}` ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSaved((prev) => prev.filter((_, idx) => idx !== i))}
                                className="rounded-md p-1.5 text-foreground/35 hover:bg-rose-500/10 hover:text-rose-500"
                                title={isZh ? '删除' : 'Delete'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </section>

          <p className="mb-8 rounded-xl bg-muted/40 px-4 py-3 text-xs text-foreground/45">
            {isZh
              ? '关于地址生成：所有生成的数据均为虚构，仅供测试和验证表单。右侧可切换全球其它国家。'
              : 'All generated data is fictional for testing only. Switch countries in the right sidebar.'}
          </p>

          {countryCode === 'US' ? (
            <section className="mb-8">
              <h2 className="mb-2 text-base font-medium text-foreground">
                {isZh ? '🏷️ 免税州（一键生成）' : '🏷️ Tax-free states'}
              </h2>
              <p className="mb-4 text-sm text-foreground/55">
                {isZh
                  ? '美国五大免征销售税的州。点击即可按该州生成地址。'
                  : 'Five US states without sales tax. Tap a chip to generate there.'}
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {TAX_FREE_STATES.map((st) => (
                  <button
                    key={st.code}
                    type="button"
                    onClick={() => {
                      setTaxFreeMode(true);
                      setSelectedState(st.code);
                      void generate(st.code, 'US');
                    }}
                    className={cn(
                      'rounded-xl border px-3 py-3 text-center transition-colors',
                      selectedState === st.code
                        ? 'border-emerald-500/40 bg-emerald-500/12'
                        : 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/35 hover:bg-emerald-500/10',
                    )}
                  >
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{st.code}</div>
                    <div className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70">{st.name}</div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mb-8">
            <h2 className="mb-2 text-base font-medium text-foreground">
              {isZh ? '随机地址常见问题' : 'FAQ'}
            </h2>
            <p className="mb-4 text-sm text-foreground/50">
              {isZh ? '以下是该地址生成功能的常见问题说明。' : 'Common questions about this generator.'}
            </p>
            <div className="space-y-2">
              {faqItems.map((item, i) => {
                const open = faqOpen === i;
                return (
                  <div key={item.q} className="overflow-hidden rounded-2xl border border-border bg-background">
                    <button
                      type="button"
                      onClick={() => setFaqOpen(open ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={cn('h-4 w-4 shrink-0 text-foreground/40 transition-transform', open && 'rotate-180')} />
                    </button>
                    {open ? (
                      <div className="border-t border-border/50 px-4 py-3 text-sm leading-relaxed text-foreground/65">
                        {item.a}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mb-4 rounded-2xl border border-border bg-background p-5">
            <div className="mb-2 flex items-center gap-2 text-accent">
              <Apple className="h-4 w-4" />
              <span className="text-sm font-medium text-foreground">
                {isZh ? '要注册美区 Apple ID？' : 'Need a US Apple ID?'}
              </span>
            </div>
            <p className="mb-3 text-sm text-foreground/60">
              {isZh
                ? '可搭配本工具生成的美国地址样例，再使用站内「美区 Apple ID 共享」快速完成 App Store 切换。'
                : 'Pair US address samples with the Shared US Apple ID tool to switch App Store regions.'}
            </p>
            <Link
              to="/tools/apple-id-shared"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              {isZh ? '打开美区 Apple ID 共享 →' : 'Open Shared US Apple ID →'}
            </Link>
          </section>
        </div>

        {/* 桌面右侧国家列表 */}
        <aside className="relative hidden w-[13.5rem] shrink-0 lg:block xl:w-56">
          <div className="sticky top-28">
            <CountrySidebar
              countryCode={countryCode}
              taxFreeMode={taxFreeMode}
              isZh={isZh}
              countriesByRegion={countriesByRegion}
              onSelectCountry={selectCountry}
              onSelectTaxFree={selectTaxFree}
              className="h-[min(70vh,36rem)] shadow-[0_8px_28px_rgba(45,42,36,0.06)]"
            />
          </div>
        </aside>
      </div>

      {/* 移动端：悬浮按钮打开国家面板 */}
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className={cn(
          'fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-40',
          'flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg',
          'lg:hidden',
        )}
        aria-label={isZh ? '选择国家' : 'Choose country'}
      >
        <Flag className="h-5 w-5" />
      </button>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
            aria-label={isZh ? '关闭' : 'Close'}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(18rem,88vw)] flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-3 py-3">
              <span className="text-sm font-medium">{isZh ? '选择国家' : 'Countries'}</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CountrySidebar
              countryCode={countryCode}
              taxFreeMode={taxFreeMode}
              isZh={isZh}
              countriesByRegion={countriesByRegion}
              onSelectCountry={selectCountry}
              onSelectTaxFree={selectTaxFree}
              className="min-h-0 flex-1 rounded-none border-0"
            />
          </div>
        </div>
      ) : null}

      {savedToast ? (
        <div className="fixed bottom-6 left-6 z-50 rounded-xl border border-border bg-background px-4 py-3 shadow-lg sm:left-auto sm:right-24 lg:right-6">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-accent" />
            {isZh ? '地址已保存' : 'Address saved'}
          </div>
        </div>
      ) : null}
    </>
  );
};
