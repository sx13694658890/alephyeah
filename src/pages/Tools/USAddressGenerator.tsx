import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Apple,
  Check,
  ChevronDown,
  ClipboardCopy,
  Copy,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
  Search,
  ShoppingBag,
  Trash2,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/cn';
import type { USAddress } from '../../data/tools/us-address-data';
import {
  generateAddress,
  formatAddressAsText,
  isTaxFreeState,
  TAX_FREE_STATES,
  STATE_OPTIONS,
} from '../../data/tools/us-address-data';

const STORAGE_KEY = 'alephyeah-us-addresses';

function loadSaved(): USAddress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as USAddress[];
    return parsed.map((item) => ({
      ...item,
      email: item.email || '',
      country: item.country || 'United States',
    }));
  } catch {
    return [];
  }
}

function saveAddresses(addrs: USAddress[]) {
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
}: {
  label: string;
  value: string;
  fieldId: string;
  copiedField: string | null;
  onCopy: (text: string, id: string) => void;
}) => {
  const done = copiedField === fieldId;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[11px] uppercase tracking-wide text-foreground/40">{label}</div>
        <div className="truncate text-sm font-medium text-foreground">{value || '—'}</div>
      </div>
      <button
        type="button"
        onClick={() => onCopy(value, fieldId)}
        disabled={!value}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border transition-colors',
          done
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700'
            : 'text-foreground/45 hover:border-accent/40 hover:bg-accent/8 hover:text-foreground',
        )}
        title="复制"
      >
        {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
};

const StateFilter = ({
  value,
  onChange,
  isZh,
}: {
  value: string;
  onChange: (next: string) => void;
  isZh: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const label =
    value === ''
      ? isZh
        ? '全部州'
        : 'All states'
      : STATE_OPTIONS.find((s) => s.code === value)?.name ?? value;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full sm:w-44">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl border border-border bg-background px-3.5 text-sm',
          'hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20',
          open && 'border-accent/40 ring-2 ring-accent/15',
        )}
      >
        <span className="truncate font-medium">{label}</span>
        <ChevronDown className={cn('h-4 w-4 text-foreground/35 transition-transform', open && 'rotate-180')} />
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
            {isZh ? '全部州' : 'All states'}
          </button>
          {STATE_OPTIONS.map((s) => (
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
              {isTaxFreeState(s.code) ? (
                <span className="text-[10px] text-emerald-600">{isZh ? '免税' : 'Tax-free'}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const FAQ_ITEMS = [
  {
    qZh: '生成的美国地址是真实可用的吗？',
    qEn: 'Are generated US addresses real?',
    aZh: '均为虚构测试数据，仅用于表单校验与开发联调，不对应真实住址。',
    aEn: 'All data is fictional for testing and form validation — not real addresses.',
  },
  {
    qZh: '可以把生成的美国数据用于真实注册或购物吗？',
    qEn: 'Can I use this for real shopping or registration?',
    aZh: '不建议用于真实商业用途。如需真实邮寄地址，请使用本人真实信息。',
    aEn: 'Not recommended for real commerce. Use your own address for deliveries.',
  },
  {
    qZh: '你们会存储我生成的美国数据吗？',
    qEn: 'Do you store the generated data?',
    aZh: '不会上传服务器。仅可选保存在本机浏览器 localStorage，可随时清空。',
    aEn: 'No server storage. Optional saves stay in your browser localStorage only.',
  },
  {
    qZh: '测试美国时如何选择地区更高效？',
    qEn: 'How should I pick a region efficiently?',
    aZh: '需要免税场景时，直接点下方五大免税州芯片；否则用搜索或州筛选后点「生成地址」。',
    aEn: 'For tax-free tests, tap the five tax-free chips below; otherwise filter by state and generate.',
  },
  {
    qZh: '美国地址生成器主要用于什么场景？',
    qEn: 'What is this tool for?',
    aZh: '软件测试、表单校验、账号资料填写演练、开发环境假数据填充等。可搭配美区 Apple ID 共享工具使用。',
    aEn: 'QA, form validation, account signup dry-runs, and mock data. Pairs well with the shared US Apple ID tool.',
  },
] as const;

export const USAddressGenerator = () => {
  const { locale } = usePreferences();
  const isZh = locale === 'zh';
  const { copiedField, copy } = useCopy();

  const [address, setAddress] = useState<USAddress | null>(null);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [saved, setSaved] = useState<USAddress[]>(loadSaved);
  const [showSaved, setShowSaved] = useState(true);
  const [savedToast, setSavedToast] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  useEffect(() => {
    saveAddresses(saved);
  }, [saved]);

  const generate = useCallback(
    (overrideState?: string) => {
      setGenerating(true);
      window.setTimeout(() => {
        const options: { state?: string; city?: string } = {};
        const stateCode = overrideState ?? selectedState;
        if (stateCode) options.state = stateCode;

        const q = searchQuery.trim();
        if (q && !overrideState) {
          const stateMatch = STATE_OPTIONS.find(
            (s) => s.code === q.toUpperCase() || s.name.toLowerCase() === q.toLowerCase(),
          );
          if (stateMatch) options.state = stateMatch.code;
          else options.city = q;
        }

        setAddress(generateAddress(options));
        setGenerating(false);
      }, 180);
    },
    [searchQuery, selectedState],
  );

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const isTaxFree = address ? isTaxFreeState(address.stateCode) : false;

  return (
    <>
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-accent">
          <MapPin className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-[0.16em]">
            {isZh ? '工具' : 'Tool'}
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-light text-foreground">
          {isZh ? '美国地址生成器' : 'US Address Generator'}
        </h1>
        <p className="max-w-2xl text-foreground/60">
          {isZh
            ? '专业的地址生成器，无需注册。随机生成格式有效的美国地址、邮政编码与身份信息示例，用于账号注册测试、软件测试与表单校验。支持一键复制与本地保存。'
            : 'Free US address generator for testing. Create valid-format street, ZIP, and identity samples with one-click copy and local saves.'}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') generate();
            }}
            placeholder={isZh ? '搜索城市或州（如 New York / NY）' : 'Search city or state (e.g. New York / NY)'}
            className={cn(
              'w-full rounded-2xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm',
              'focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10',
            )}
          />
        </div>
        <StateFilter value={selectedState} onChange={setSelectedState} isZh={isZh} />
        <button
          type="button"
          onClick={() => generate()}
          disabled={generating}
          className={cn(
            'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-medium text-white',
            'hover:brightness-95 disabled:opacity-50',
          )}
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {isZh ? '生成地址' : 'Generate'}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
          🇺🇸 {isZh ? '美国' : 'United States'}
        </span>
        <span className="text-xs text-foreground/40">
          {isZh ? '当前支持美区地址 · 可一键切免税州' : 'US addresses · tax-free states available'}
        </span>
      </div>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-medium text-foreground">
            {isZh ? '地址示例' : 'Address sample'}
          </h2>
          <button
            type="button"
            onClick={() => address && copy(formatAddressAsText(address), 'all')}
            disabled={!address}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium',
              copiedField === 'all'
                ? 'bg-accent/15 text-accent'
                : 'text-foreground/50 hover:bg-accent/8 hover:text-foreground',
            )}
          >
            {copiedField === 'all' ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
            {copiedField === 'all' ? (isZh ? '已复制' : 'Copied') : isZh ? '复制全部' : 'Copy all'}
          </button>
        </div>
        <div className="space-y-2.5 rounded-2xl border border-border bg-background p-4 sm:p-5">
          {address ? (
            <>
              <FieldRow label={isZh ? '国家' : 'Country'} value={address.country} fieldId="country" copiedField={copiedField} onCopy={copy} />
              <FieldRow label={isZh ? '街道地址' : 'Street'} value={address.street} fieldId="street" copiedField={copiedField} onCopy={copy} />
              <div className="grid gap-2.5 sm:grid-cols-2">
                <FieldRow label={isZh ? '城市' : 'City'} value={address.city} fieldId="city" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '州/省' : 'State'} value={address.state} fieldId="state" copiedField={copiedField} onCopy={copy} />
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <FieldRow label={isZh ? '州编码' : 'State code'} value={address.stateCode} fieldId="stateCode" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '邮政编码' : 'ZIP'} value={address.zipCode} fieldId="zip" copiedField={copiedField} onCopy={copy} />
              </div>
            </>
          ) : (
            <div className="py-10 text-center text-sm text-foreground/40">
              {isZh ? '点击「生成地址」开始' : 'Tap Generate to start'}
            </div>
          )}
        </div>
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
        <h2 className="mb-3 text-base font-medium text-foreground">
          {isZh ? '身份信息示例' : 'Identity sample'}
        </h2>
        <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
          {address ? (
            <div className="space-y-2.5">
              <FieldRow label={isZh ? '全名' : 'Full name'} value={fullName} fieldId="name" copiedField={copiedField} onCopy={copy} />
              <div className="grid gap-2.5 sm:grid-cols-2">
                <FieldRow label={isZh ? '电话' : 'Phone'} value={address.phone} fieldId="phone" copiedField={copiedField} onCopy={copy} />
                <FieldRow label={isZh ? '邮箱' : 'Email'} value={address.email} fieldId="email" copiedField={copiedField} onCopy={copy} />
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
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
            <p className="w-full text-xs text-foreground/40 sm:ml-auto sm:w-auto">
              {isZh
                ? '示例将保存在本机，便于固定测试数据'
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
                  {saved.map((addr, i) => (
                    <div
                      key={`${addr.firstName}-${addr.zipCode}-${i}`}
                      className="group flex items-start justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1 text-sm text-foreground/70">
                        <span className="font-medium text-foreground">
                          {addr.firstName} {addr.lastName}
                        </span>
                        <span className="mx-1.5 text-foreground/25">·</span>
                        {addr.street}
                        <span className="mx-1.5 text-foreground/25">·</span>
                        {addr.city}, {addr.stateCode} {addr.zipCode}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setAddress(addr)}
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
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <p className="mb-8 rounded-xl bg-muted/40 px-4 py-3 text-xs text-foreground/45">
        {isZh
          ? '关于地址生成：所有生成的数据均为虚构，仅供测试和验证表单。'
          : 'All generated data is fictional and intended for testing / form validation only.'}
      </p>

      <section className="mb-8">
        <h2 className="mb-2 text-base font-medium text-foreground">
          {isZh ? '🏷️ 免税州（一键生成）' : '🏷️ Tax-free states'}
        </h2>
        <p className="mb-4 text-sm text-foreground/55">
          {isZh
            ? '美国五大免征销售税的州。点击即可按该州生成地址，适合美区账号资料与购物测试。'
            : 'Five US states without sales tax. Tap a chip to generate an address there.'}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {TAX_FREE_STATES.map((st) => (
            <button
              key={st.code}
              type="button"
              onClick={() => {
                setSelectedState(st.code);
                generate(st.code);
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

      <section className="mb-8">
        <h2 className="mb-2 text-base font-medium text-foreground">
          {isZh ? '随机地址常见问题' : 'FAQ'}
        </h2>
        <p className="mb-4 text-sm text-foreground/50">
          {isZh ? '以下是该地址生成功能的常见问题说明。' : 'Common questions about this generator.'}
        </p>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => {
            const open = faqOpen === i;
            return (
              <div key={item.qEn} className="overflow-hidden rounded-2xl border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setFaqOpen(open ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium"
                >
                  <span>{isZh ? item.qZh : item.qEn}</span>
                  <ChevronDown className={cn('h-4 w-4 shrink-0 text-foreground/40 transition-transform', open && 'rotate-180')} />
                </button>
                {open ? (
                  <div className="border-t border-border/50 px-4 py-3 text-sm leading-relaxed text-foreground/65">
                    {isZh ? item.aZh : item.aEn}
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
            : 'Pair these address samples with the in-site Shared US Apple ID tool to switch App Store regions.'}
        </p>
        <Link
          to="/tools/apple-id-shared"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          {isZh ? '打开美区 Apple ID 共享 →' : 'Open Shared US Apple ID →'}
        </Link>
      </section>

      {savedToast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-border bg-background px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-accent" />
            {isZh ? '地址已保存' : 'Address saved'}
          </div>
        </div>
      ) : null}
    </>
  );
};
