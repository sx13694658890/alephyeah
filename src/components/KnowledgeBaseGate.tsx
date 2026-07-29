import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Shield } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import {
  isKnowledgeUnlocked,
  setKnowledgeUnlocked,
  verifyKnowledgePassword,
} from '../lib/knowledge-gate';
import { cn } from '../lib/cn';

type KnowledgeGateContextValue = {
  unlocked: boolean;
  requestUnlock: (onSuccess?: () => void) => void;
  lock: () => void;
};

const KnowledgeGateContext = createContext<KnowledgeGateContextValue | null>(null);

export function useKnowledgeGate() {
  const ctx = useContext(KnowledgeGateContext);
  if (!ctx) throw new Error('useKnowledgeGate must be used within KnowledgeGateProvider');
  return ctx;
}

export function KnowledgeGateProvider({ children }: { children: ReactNode }) {
  const { locale } = usePreferences();
  const isZh = locale === 'zh';

  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingSuccess, setPendingSuccess] = useState<(() => void) | null>(null);

  useEffect(() => {
    setUnlocked(isKnowledgeUnlocked());
  }, []);

  const requestUnlock = useCallback((onSuccess?: () => void) => {
    if (isKnowledgeUnlocked()) {
      setUnlocked(true);
      onSuccess?.();
      return;
    }
    setPassword('');
    setError(null);
    setPendingSuccess(() => onSuccess ?? null);
    setOpen(true);
  }, []);

  const lock = useCallback(() => {
    setKnowledgeUnlocked(false);
    setUnlocked(false);
  }, []);

  const submit = useCallback(() => {
    if (!verifyKnowledgePassword(password)) {
      setError(isZh ? '口令不正确' : 'Incorrect password');
      return;
    }
    setKnowledgeUnlocked(true);
    setUnlocked(true);
    setOpen(false);
    setPassword('');
    setError(null);
    const cb = pendingSuccess;
    setPendingSuccess(null);
    cb?.();
  }, [password, pendingSuccess, isZh]);

  const value = useMemo(
    () => ({ unlocked, requestUnlock, lock }),
    [unlocked, requestUnlock, lock],
  );

  return (
    <KnowledgeGateContext.Provider value={value}>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="knowledge-gate-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              setPendingSuccess(null);
              setError(null);
            }
          }}
        >
          <div
            className={cn(
              'w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-xl',
              'dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)]',
            )}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 id="knowledge-gate-title" className="text-base font-medium text-foreground">
                  {isZh ? '身份验证' : 'Identity verification'}
                </h2>
                <p className="text-xs text-foreground/50">
                  {isZh ? '验证通过后可访问知识库' : 'Unlock to access the knowledge base'}
                </p>
              </div>
            </div>

            <label className="mb-3 block space-y-1.5">
              <span className="text-xs font-medium text-foreground/55">
                {isZh ? '访问口令' : 'Access password'}
              </span>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                  if (e.key === 'Escape') {
                    setOpen(false);
                    setPendingSuccess(null);
                  }
                }}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-accent/50"
                placeholder={isZh ? '请输入口令' : 'Enter password'}
              />
            </label>

            {error && <p className="mb-3 text-sm text-red-600 dark:text-red-300">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={submit}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-foreground text-sm font-medium text-background"
              >
                {isZh ? '验证' : 'Verify'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPendingSuccess(null);
                  setError(null);
                }}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-4 text-sm text-foreground/70"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </KnowledgeGateContext.Provider>
  );
}

/** 路由守卫：未解锁时拦截并弹出验证 */
export function KnowledgeGateGuard({ children }: { children: ReactNode }) {
  const { unlocked, requestUnlock } = useKnowledgeGate();
  const { locale } = usePreferences();
  const isZh = locale === 'zh';
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (unlocked) {
      setChecked(true);
      return;
    }
    requestUnlock();
    setChecked(true);
  }, [unlocked, requestUnlock]);

  if (!checked) return null;

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Shield className="h-8 w-8 text-foreground/30" />
        <p className="text-sm text-foreground/50">
          {isZh ? '请先完成身份验证以查看知识库' : 'Verify your identity to view the knowledge base'}
        </p>
        <button
          type="button"
          onClick={() => requestUnlock()}
          className="inline-flex min-h-10 items-center rounded-xl bg-foreground px-4 text-sm font-medium text-background"
        >
          {isZh ? '去验证' : 'Verify'}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
