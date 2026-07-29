import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ClipboardCopy,
  KeyRound,
  Plus,
  Shield,
  Trash2,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/cn';
import {
  createAccountId,
  generateTotp,
  loadAccounts,
  normalizeSecret,
  parseOtpAuthUri,
  saveAccounts,
  type OtpAccount,
} from '../../lib/totp';

type LiveCode = {
  code: string;
  remaining: number;
  period: number;
};

export const Authenticator = () => {
  const { locale } = usePreferences();
  const isZh = locale === 'zh';

  const [accounts, setAccounts] = useState<OtpAccount[]>(() => loadAccounts());
  const [codes, setCodes] = useState<Record<string, LiveCode>>({});
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [secretOrUri, setSecretOrUri] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const persist = useCallback((next: OtpAccount[]) => {
    setAccounts(next);
    saveAccounts(next);
  }, []);

  const refreshCodes = useCallback(async () => {
    const entries = await Promise.all(
      accounts.map(async (account) => {
        try {
          const live = await generateTotp(account.secret, {
            period: account.period,
            digits: account.digits,
          });
          return [account.id, live] as const;
        } catch {
          return [
            account.id,
            { code: '------', remaining: account.period, period: account.period },
          ] as const;
        }
      }),
    );
    setCodes(Object.fromEntries(entries));
  }, [accounts]);

  useEffect(() => {
    void refreshCodes();
    const timer = window.setInterval(() => {
      void refreshCodes();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [refreshCodes]);

  const addAccount = async () => {
    setFormError(null);
    const raw = secretOrUri.trim();
    if (!raw) {
      setFormError(isZh ? '请填写密钥或 otpauth 链接' : 'Enter a secret or otpauth URI');
      return;
    }

    let draft: Partial<OtpAccount> = {};
    if (/^otpauth:\/\//i.test(raw)) {
      const parsed = parseOtpAuthUri(raw);
      if (!parsed?.secret) {
        setFormError(isZh ? '无法解析该链接，请确认是 TOTP 格式' : 'Could not parse TOTP URI');
        return;
      }
      draft = parsed;
    } else {
      draft = {
        name: name.trim() || (isZh ? '未命名' : 'Untitled'),
        secret: normalizeSecret(raw),
        period: 30,
        digits: 6,
      };
    }

    if (!draft.secret) {
      setFormError(isZh ? '密钥无效' : 'Invalid secret');
      return;
    }

    try {
      await generateTotp(draft.secret, {
        period: draft.period ?? 30,
        digits: draft.digits ?? 6,
      });
    } catch {
      setFormError(isZh ? '密钥格式不正确（需 Base32）' : 'Secret must be valid Base32');
      return;
    }

    const account: OtpAccount = {
      id: createAccountId(),
      name: (draft.name || name.trim() || (isZh ? '未命名' : 'Untitled')).trim(),
      issuer: draft.issuer,
      secret: draft.secret,
      period: draft.period ?? 30,
      digits: draft.digits ?? 6,
      createdAt: Date.now(),
    };

    persist([account, ...accounts]);
    setName('');
    setSecretOrUri('');
    setShowForm(false);
  };

  const removeAccount = (id: string) => {
    persist(accounts.filter((a) => a.id !== id));
  };

  const copyCode = async (id: string, code: string) => {
    if (!code || code.includes('-')) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1200);
  };

  const sorted = useMemo(
    () => [...accounts].sort((a, b) => a.name.localeCompare(b.name)),
    [accounts],
  );

  return (
    <>
      <div className="mb-8">
        <Link
          to="/knowledge-base"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground/50 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {isZh ? '返回知识库' : 'Back to Knowledge Base'}
        </Link>
        <div className="mb-3 flex items-center gap-2 text-accent">
          <Shield className="h-5 w-5" />
          <span className="text-xs font-medium uppercase tracking-[0.16em]">
            {isZh ? '知识库' : 'Knowledge'}
          </span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="mb-2 text-3xl font-light text-foreground">
              {isZh ? '身份验证器' : 'Authenticator'}
            </h1>
            <p className="max-w-xl text-foreground/60">
              {isZh
                ? '本地双因素验证码，账号仅保存在本机浏览器。'
                : 'Local two-factor codes. Accounts stay in this browser only.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm((v) => !v);
              setFormError(null);
            }}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-foreground px-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {isZh ? '添加账号' : 'Add account'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 space-y-3 rounded-2xl border border-border bg-background p-4 sm:p-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-foreground/55">
              {isZh ? '名称（可选，粘贴链接时可自动识别）' : 'Name (optional if using otpauth URI)'}
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isZh ? '例如 GitHub' : 'e.g. GitHub'}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent/50"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-foreground/55">
              {isZh ? '密钥或 otpauth 链接' : 'Secret or otpauth URI'}
            </span>
            <textarea
              value={secretOrUri}
              onChange={(e) => setSecretOrUri(e.target.value)}
              rows={3}
              placeholder={isZh ? 'Base32 密钥，或 otpauth://totp/...' : 'Base32 secret or otpauth://totp/...'}
              className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm outline-none focus:border-accent/50"
            />
          </label>
          {formError && (
            <p className="text-sm text-red-600 dark:text-red-300">{formError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void addAccount()}
              className="inline-flex min-h-10 items-center rounded-xl bg-foreground px-4 text-sm font-medium text-background"
            >
              {isZh ? '保存' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormError(null);
              }}
              className="inline-flex min-h-10 items-center rounded-xl border border-border px-4 text-sm text-foreground/70"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <KeyRound className="h-8 w-8 text-foreground/30" />
          <p className="text-sm text-foreground/50">
            {isZh
              ? '还没有账号。添加密钥后即可显示验证码。'
              : 'No accounts yet. Add a secret to show codes.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((account) => {
            const live = codes[account.id];
            const code = live?.code ?? '------';
            const remaining = live?.remaining ?? account.period;
            const period = live?.period ?? account.period;
            const progress = remaining / period;
            const urgent = remaining <= 5;
            const copied = copiedId === account.id;
            const title = account.issuer
              ? `${account.issuer} · ${account.name}`
              : account.name;

            return (
              <div
                key={account.id}
                className="rounded-2xl border border-border bg-background p-4 transition-colors hover:border-accent/30"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{title}</p>
                    <p className="mt-0.5 text-[11px] text-foreground/40">
                      {isZh ? `${remaining}s 后刷新` : `Refreshes in ${remaining}s`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAccount(account.id)}
                    className="rounded-lg p-1.5 text-foreground/35 transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={isZh ? '删除' : 'Delete'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => void copyCode(account.id, code)}
                    className={cn(
                      'font-mono text-3xl tracking-[0.2em] tabular-nums transition-colors',
                      urgent ? 'text-amber-600 dark:text-amber-400' : 'text-foreground',
                    )}
                  >
                    {code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code}
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyCode(account.id, code)}
                    className={cn(
                      'inline-flex min-h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium',
                      copied
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-border text-foreground/60 hover:border-accent/40',
                    )}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                    {copied ? (isZh ? '已复制' : 'Copied') : isZh ? '复制' : 'Copy'}
                  </button>
                </div>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-[width] duration-1000 linear',
                      urgent ? 'bg-amber-500' : 'bg-accent',
                    )}
                    style={{ width: `${Math.max(0, progress) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
