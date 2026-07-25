export interface AppleIdAccount {
  id: string;
  fullEmail: string;
  password: string;
  status: string;
  checkTime: string;
  region: string;
  regionName: string;
}

export interface AppleIdSharedResponse {
  success: boolean;
  timestamp?: number;
  error?: string;
  data?: {
    accounts?: {
      group1?: AppleIdAccount[];
      group2?: AppleIdAccount[];
    };
  };
}

export function normalizeAccounts(payload: AppleIdSharedResponse): AppleIdAccount[] {
  const groups = payload.data?.accounts;
  if (!groups) return [];
  return [...(groups.group1 ?? []), ...(groups.group2 ?? [])];
}

export function isAccountAvailable(account: AppleIdAccount): boolean {
  const s = account.status.trim().toLowerCase();
  return s === '正常' || s === '可用' || s === 'ok' || s === 'normal' || s === 'available';
}

export async function fetchAppleIdAccounts(signal?: AbortSignal): Promise<{
  accounts: AppleIdAccount[];
  timestamp?: number;
}> {
  const res = await fetch('/api/apple-id-shared', {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const payload = (await res.json()) as AppleIdSharedResponse;
  if (!payload.success) {
    throw new Error(payload.error || 'Failed to load accounts');
  }

  return {
    accounts: normalizeAccounts(payload),
    timestamp: payload.timestamp,
  };
}
