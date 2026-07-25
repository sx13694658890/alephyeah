import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Apple,
  Check,
  ChevronDown,
  ClipboardCopy,
  Eye,
  EyeOff,
  Globe2,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/cn';
import {
  fetchAppleIdAccounts,
  isAccountAvailable,
  type AppleIdAccount,
} from '../../lib/apple-id-shared';

const PAGE_SIZE = 6;

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

const CopyButton = ({
  label,
  value,
  fieldId,
  copiedField,
  onCopy,
  isZh,
}: {
  label: string;
  value: string;
  fieldId: string;
  copiedField: string | null;
  onCopy: (text: string, id: string) => void;
  isZh: boolean;
}) => {
  const done = copiedField === fieldId;
  return (
    <button
      type="button"
      onClick={() => onCopy(value, fieldId)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
        done
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-border bg-background text-foreground/70 hover:border-accent/40 hover:bg-accent/8 hover:text-foreground',
      )}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
      {done ? (isZh ? '已复制' : 'Copied') : label}
    </button>
  );
};

const RegionFilter = ({
  value,
  options,
  onChange,
  isZh,
}: {
  value: string;
  options: [string, string][];
  onChange: (next: string) => void;
  isZh: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const label =
    value === 'all'
      ? isZh
        ? '全部区服'
        : 'All regions'
      : (options.find(([key]) => key === value)?.[1] ?? value);

  return (
    <div ref={rootRef} className="relative w-full sm:w-56">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'group flex w-full min-h-11 items-center gap-2.5 rounded-2xl border border-border bg-background px-3.5 text-left text-sm',
          'shadow-[0_1px_2px_rgba(45,42,36,0.04)] transition-[border-color,box-shadow,transform]',
          'hover:border-accent/35 hover:shadow-[0_4px_16px_rgba(45,42,36,0.06)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25',
          open && 'border-accent/40 ring-2 ring-accent/15',
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
          <Globe2 className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate font-medium text-foreground">{label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-foreground/35 transition-transform duration-200',
            open && 'rotate-180 text-accent',
          )}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className={cn(
            'absolute left-0 right-0 top-[calc(100%+0.4rem)] z-40 max-h-64 overflow-y-auto rounded-2xl border border-border bg-background p-1.5',
            'shadow-[0_16px_40px_rgba(45,42,36,0.14)]',
            'animate-in fade-in slide-in-from-top-1 duration-150',
          )}
        >
          <button
            type="button"
            role="option"
            aria-selected={value === 'all'}
            onClick={() => {
              onChange('all');
              setOpen(false);
            }}
            className={cn(
              'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors',
              value === 'all'
                ? 'bg-accent/12 font-medium text-foreground'
                : 'text-foreground/70 hover:bg-accent/8 hover:text-foreground',
            )}
          >
            <span>{isZh ? '全部区服' : 'All regions'}</span>
            {value === 'all' ? <Check className="h-3.5 w-3.5 text-accent" /> : null}
          </button>
          {options.map(([key, name]) => {
            const selected = value === key;
            return (
              <button
                key={key}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors',
                  selected
                    ? 'bg-accent/12 font-medium text-foreground'
                    : 'text-foreground/70 hover:bg-accent/8 hover:text-foreground',
                )}
              >
                <span className="truncate">{name}</span>
                {selected ? <Check className="h-3.5 w-3.5 shrink-0 text-accent" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

const AccountCard = ({
  account,
  copiedField,
  onCopy,
  isZh,
}: {
  account: AppleIdAccount;
  copiedField: string | null;
  onCopy: (text: string, id: string) => void;
  isZh: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const ok = isAccountAvailable(account);

  return (
    <article
      className={cn(
        'rounded-2xl border border-border bg-background p-4 transition-colors',
        'shadow-[0_1px_2px_rgba(45,42,36,0.04)] hover:border-accent/30',
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
            ok
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
          )}
        >
          {account.status || (isZh ? '未知' : 'Unknown')}
        </span>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] text-foreground/65">
          {account.regionName || account.region || '—'}
        </span>
        {account.checkTime ? (
          <span className="text-[11px] text-foreground/40">
            {isZh ? '检测' : 'Checked'} {account.checkTime}
          </span>
        ) : null}
      </div>

      <div className="mb-1 text-[11px] uppercase tracking-wide text-foreground/40">
        {isZh ? '账号' : 'Account'}
      </div>
      <div className="mb-3 break-all font-mono text-sm text-foreground">{account.fullEmail}</div>

      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wide text-foreground/40">
          {isZh ? '密码' : 'Password'}
        </span>
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-foreground/45',
            'transition-colors hover:bg-accent/10 hover:text-foreground',
          )}
          aria-label={showPassword ? (isZh ? '隐藏密码' : 'Hide password') : isZh ? '显示密码' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPassword ? (isZh ? '隐藏' : 'Hide') : isZh ? '显示' : 'Show'}
        </button>
      </div>
      <div className="mb-4 font-mono text-sm tracking-wider text-foreground/80">
        {showPassword ? account.password : '••••••••••••'}
      </div>

      <div className="flex flex-wrap gap-2">
        <CopyButton
          label={isZh ? '复制账号' : 'Copy account'}
          value={account.fullEmail}
          fieldId={`${account.id}-email`}
          copiedField={copiedField}
          onCopy={onCopy}
          isZh={isZh}
        />
        <CopyButton
          label={isZh ? '复制密码' : 'Copy password'}
          value={account.password}
          fieldId={`${account.id}-pass`}
          copiedField={copiedField}
          onCopy={onCopy}
          isZh={isZh}
        />
      </div>
    </article>
  );
};

const FAQ_ITEMS = [
  {
    qZh: '登录时显示账号「已锁定」或「已停用」该如何解决？',
    qEn: 'What if the account is locked or disabled?',
    aZh: '共享账号被多人使用时容易触发风控。请直接换下一个状态为「正常」的账号；也可点击「换一批」或「刷新」获取更新列表。',
    aEn: 'Shared accounts often hit rate limits. Switch to another account marked available, or tap “Next batch” / “Refresh”.',
  },
  {
    qZh: '我可以像使用自己的 ID 一样直接登录系统的 iCloud 吗？',
    qEn: 'Can I sign into iCloud with a shared Apple ID?',
    aZh: '绝对不可以。请仅在 App Store 内登录。在系统「设置」登录 iCloud 可能导致锁机、数据风险，并拖垮共享账号池。',
    aEn: 'Never. Use App Store only. Signing into iCloud in Settings can lock the device and burn the shared pool.',
  },
  {
    qZh: '如何更新使用共享账号下载的海外 App？',
    qEn: 'How do I update apps downloaded with a shared ID?',
    aZh: '用当初下载该 App 的同一美区账号重新登录 App Store，再在「更新」页操作。若账号失效，需换号后重新下载。',
    aEn: 'Sign back into App Store with the same US account used to download, then update. If that account dies, re-download with a fresh one.',
  },
  {
    qZh: '我能通过共享账号购买付费 App 或内购吗？',
    qEn: 'Can I purchase paid apps or IAP with shared accounts?',
    aZh: '不建议。共享账号通常未绑定可靠支付方式，且存在资金与账号安全风险。付费需求请注册个人美区 Apple ID。',
    aEn: 'Not recommended. Shared IDs rarely have reliable payment methods and create security risks. Register your own US Apple ID for purchases.',
  },
  {
    qZh: '为什么登录成功后，搜索出来的还是国内的 App？',
    qEn: 'Why do I still see the China store after signing in?',
    aZh: '退出 App Store 后完全划掉后台再打开；确认右上角账户已切换。必要时切换网络或等待商店缓存刷新。',
    aEn: 'Force-quit App Store after sign-out/in. Confirm the account avatar switched. Retry network or wait for store cache to refresh.',
  },
] as const;

const STEPS = [
  {
    titleZh: '第一步：仅在 App Store 退出原账号',
    titleEn: 'Step 1: Sign out in App Store only',
    bodyZh:
      '打开蓝色 App Store → 右上角头像 → 滑到最底「退出登录」。切勿在系统「设置 / iCloud」退出或登录共享账号。',
    bodyEn:
      'Open App Store → profile → Sign Out at the bottom. Never sign out/in via Settings / iCloud with a shared ID.',
  },
  {
    titleZh: '第二步：复制状态正常的美区账号',
    titleEn: 'Step 2: Copy a healthy US account',
    bodyZh:
      '在下方列表挑选状态为「正常」的账号，分别复制邮箱与密码粘贴登录，避免手输触发风控。密码默认隐藏，可点「显示」查看。',
    bodyEn:
      'Pick an available account below. Copy email and password separately. Passwords stay masked until you reveal them.',
  },
  {
    titleZh: '第三步：绕过双重认证',
    titleEn: 'Step 3: Bypass two-factor upgrade',
    bodyZh:
      '若弹出 Apple ID 安全 / 双重认证，点「其他选项」→「不升级」。然后划掉 App Store 重开，即可进入美区商店。',
    bodyEn:
      'If asked to upgrade security / 2FA, choose Other Options → Don’t Upgrade. Force-quit App Store and reopen for the US store.',
  },
] as const;

export const AppleIdShared = () => {
  const titleRef = useScrollAnimation<HTMLDivElement>({ staggerDelay: 80 });
  const { locale } = usePreferences();
  const isZh = locale === 'zh';
  const { copiedField, copy } = useCopy();

  const [accounts, setAccounts] = useState<AppleIdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [regionFilter, setRegionFilter] = useState('all');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { accounts: next } = await fetchAppleIdAccounts();
      setAccounts(next);
      setPage(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const regions = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of accounts) {
      if (!isAccountAvailable(a)) continue;
      const key = a.region || a.regionName || 'UNK';
      if (!map.has(key)) map.set(key, a.regionName || a.region || key);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], 'zh'));
  }, [accounts]);

  const filtered = useMemo(() => {
    return accounts.filter((a) => {
      if (!isAccountAvailable(a)) return false;
      if (regionFilter !== 'all') {
        const key = a.region || a.regionName || 'UNK';
        if (key !== regionFilter) return false;
      }
      return true;
    });
  }, [accounts, regionFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const nextBatch = () => {
    if (filtered.length === 0) return;
    setPage((p) => (p + 1) % pageCount);
  };

  return (
    <>
      <div ref={titleRef} className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-accent" data-animate style={{ opacity: 0 }}>
          <Apple className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-[0.16em]">
            {isZh ? '工具' : 'Tool'}
          </span>
        </div>
        <h1 className="mb-3 text-3xl font-light text-foreground" data-animate style={{ opacity: 0 }}>
          {isZh ? '美区 Apple ID 共享' : 'Shared US Apple ID'}
        </h1>
        <p className="max-w-2xl text-foreground/60" data-animate style={{ opacity: 0 }}>
          {isZh
            ? '仅展示可用账号；密码默认隐藏。配合保姆级 App Store 切换教程，仅用于临时下载海外应用。'
            : 'Available accounts only; passwords masked by default. Temporary App Store downloads — never iCloud.'}
        </p>
      </div>

      <div className="mb-8 flex gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/8 px-4 py-3.5 text-sm text-rose-900 dark:text-rose-100">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-300" />
        <div>
          <div className="mb-1 font-medium">
            {isZh ? '高危警告' : 'Critical warning'}
          </div>
          <p className="text-rose-900/80 dark:text-rose-100/80">
            {isZh
              ? '请勿使用共享 Apple ID 登录 iCloud 或系统「设置」。错误操作可能导致锁机，并连累整个账号池。只在 App Store 内登录。'
              : 'Do not sign into iCloud or system Settings with a shared Apple ID. That can lock the device and burn the pool. App Store only.'}
          </p>
        </div>
      </div>

      <section className="mb-12">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              {isZh ? '实时共享账号' : 'Live shared accounts'}
            </h2>
            <p className="text-sm text-foreground/50">
              {isZh
                ? `可用 ${filtered.length} 个 · 第 ${safePage + 1}/${pageCount} 批`
                : `${filtered.length} available · batch ${safePage + 1}/${pageCount}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RegionFilter
              value={regionFilter}
              options={regions}
              isZh={isZh}
              onChange={(next) => {
                setRegionFilter(next);
                setPage(0);
              }}
            />
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-2xl border border-border bg-background px-3.5 text-sm',
                'hover:border-accent/40 hover:bg-accent/5 disabled:opacity-50',
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {isZh ? '刷新' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={nextBatch}
              disabled={filtered.length <= PAGE_SIZE}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-2xl bg-accent px-3.5 text-sm font-medium text-white',
                'hover:brightness-95 disabled:opacity-40',
              )}
            >
              {isZh ? '换一批' : 'Next batch'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/8 px-4 py-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <div>
              <div className="font-medium text-foreground">{isZh ? '加载失败' : 'Failed to load'}</div>
              <p className="text-foreground/60">{error}</p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-2 text-accent underline-offset-2 hover:underline"
              >
                {isZh ? '重试' : 'Retry'}
              </button>
            </div>
          </div>
        ) : loading && accounts.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border text-foreground/45">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isZh ? '正在拉取账号…' : 'Fetching accounts…'}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-foreground/50">
            {isZh ? '当前区服没有可用账号，试试切换区服或刷新。' : 'No available accounts for this region. Switch region or refresh.'}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                copiedField={copiedField}
                onCopy={copy}
                isZh={isZh}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="mb-2 text-lg font-medium text-foreground">
          {isZh ? '三步切换美区 App Store' : 'Switch to US App Store in 3 steps'}
        </h2>
        <p className="mb-5 text-sm text-foreground/50">
          {isZh ? '小白避坑指南 · 只操作 App Store' : 'Beginner-safe · App Store only'}
        </p>
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li
              key={step.titleEn}
              className="rounded-2xl border border-border bg-background px-4 py-4"
            >
              <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-xs text-accent">
                  {i + 1}
                </span>
                {isZh ? step.titleZh : step.titleEn}
              </div>
              <p className="pl-8 text-sm leading-relaxed text-foreground/65">
                {isZh ? step.bodyZh : step.bodyEn}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-medium text-foreground">
          {isZh ? '常见问题' : 'FAQ'}
        </h2>
        <p className="mb-4 text-sm text-foreground/50">
          {isZh ? '覆盖绝大多数登录踩坑场景' : 'Covers the most common sign-in pitfalls'}
        </p>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => {
            const open = faqOpen === i;
            return (
              <div
                key={item.qEn}
                className="overflow-hidden rounded-2xl border border-border bg-background"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(open ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-foreground"
                >
                  <span>{isZh ? item.qZh : item.qEn}</span>
                  <ChevronDown
                    className={cn('h-4 w-4 shrink-0 text-foreground/40 transition-transform', open && 'rotate-180')}
                  />
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
    </>
  );
};
