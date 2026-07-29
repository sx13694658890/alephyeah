/** RFC 6238 TOTP — Web Crypto HMAC-SHA1，纯本地 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function normalizeSecret(secret: string): string {
  return secret.replace(/[\s\-]/g, '').toUpperCase();
}

export function decodeBase32(input: string): Uint8Array {
  const cleaned = normalizeSecret(input);
  if (!cleaned) throw new Error('Empty secret');

  let bits = 0;
  let value = 0;
  const out: number[] = [];

  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error('Invalid Base32 secret');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return new Uint8Array(out);
}

function counterToBytes(counter: number): Uint8Array {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  // JS number safe for TOTP counters; write as big-endian uint64
  const high = Math.floor(counter / 0x100000000);
  const low = counter >>> 0;
  view.setUint32(0, high);
  view.setUint32(4, low);
  return new Uint8Array(buf);
}

async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return new Uint8Array(sig);
}

export async function generateHotp(
  secretBytes: Uint8Array,
  counter: number,
  digits = 6,
): Promise<string> {
  const hash = await hmacSha1(secretBytes, counterToBytes(counter));
  const offset = hash[hash.length - 1]! & 0x0f;
  const binary =
    ((hash[offset]! & 0x7f) << 24) |
    ((hash[offset + 1]! & 0xff) << 16) |
    ((hash[offset + 2]! & 0xff) << 8) |
    (hash[offset + 3]! & 0xff);
  const otp = binary % 10 ** digits;
  return otp.toString().padStart(digits, '0');
}

export async function generateTotp(
  secret: string,
  options?: { period?: number; digits?: number; now?: number },
): Promise<{ code: string; remaining: number; period: number }> {
  const period = options?.period ?? 30;
  const digits = options?.digits ?? 6;
  const now = options?.now ?? Date.now();
  const epoch = Math.floor(now / 1000);
  const counter = Math.floor(epoch / period);
  const remaining = period - (epoch % period);
  const code = await generateHotp(decodeBase32(secret), counter, digits);
  return { code, remaining, period };
}

export type OtpAccount = {
  id: string;
  name: string;
  issuer?: string;
  secret: string;
  period: number;
  digits: number;
  createdAt: number;
};

export function parseOtpAuthUri(uri: string): Partial<OtpAccount> | null {
  const trimmed = uri.trim();
  if (!/^otpauth:\/\//i.test(trimmed)) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'otpauth:') return null;
    const type = url.hostname; // totp / hotp
    if (type.toLowerCase() !== 'totp') {
      throw new Error('Only TOTP is supported');
    }

    const label = decodeURIComponent(url.pathname.replace(/^\//, ''));
    const [maybeIssuer, maybeName] = label.includes(':')
      ? label.split(/:(.+)/).filter(Boolean)
      : [undefined, label];

    const secret = url.searchParams.get('secret') ?? '';
    const issuerParam = url.searchParams.get('issuer') ?? undefined;
    const period = Number(url.searchParams.get('period') ?? 30);
    const digits = Number(url.searchParams.get('digits') ?? 6);

    return {
      name: (maybeName || label || 'Account').trim(),
      issuer: issuerParam || maybeIssuer,
      secret: normalizeSecret(secret),
      period: Number.isFinite(period) && period > 0 ? period : 30,
      digits: Number.isFinite(digits) && digits > 0 ? digits : 6,
    };
  } catch {
    return null;
  }
}

const STORAGE_KEY = 'alephyeah.authenticator.accounts.v1';

export function loadAccounts(): OtpAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OtpAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: OtpAccount[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function createAccountId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
