const SESSION_KEY = 'alephyeah.knowledge-gate.unlocked';

/**
 * 知识库访问口令（前端软门锁，防随手翻阅）。
 * 优先读 PUBLIC_KNOWLEDGE_PASSWORD；未配置时用下方默认值，部署前请修改。
 */
const DEFAULT_PASSWORD = 'alephyeah';

export function getKnowledgeGatePassword(): string {
  try {
    // Rsbuild loadEnv 会把 PUBLIC_* 注入为 process.env.PUBLIC_*
    const fromEnv = process.env.PUBLIC_KNOWLEDGE_PASSWORD;
    if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  } catch {
    // ignore
  }
  return DEFAULT_PASSWORD;
}

export function isKnowledgeUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function setKnowledgeUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) sessionStorage.setItem(SESSION_KEY, '1');
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function verifyKnowledgePassword(input: string): boolean {
  return input.trim() === getKnowledgeGatePassword();
}
