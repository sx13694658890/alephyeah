import {
  STATES as US_STATES,
  generateBirthDate,
  generateEmail,
  generateGender,
  generateOccupation,
  generateRandomNumber,
  pickRandom,
  type USAddress,
} from '../data/tools/us-address-data';
import {
  generateWorldAddress as generateLocalWorldAddress,
  getCountry,
  getSubdivisions,
  type CountryCode,
} from '../data/tools/address-generator-data';
export type GeoEntry = {
  p?: string;
  z?: string;
  c: string;
  cn?: string;
  tz?: string;
};

export type AddressPool = Record<string, GeoEntry[]>;

/** Appark slug 与站内 CountryCode 的差异映射 */
const API_SLUG: Partial<Record<CountryCode, string>> = {
  GB: 'uk',
};

const poolCache = new Map<string, AddressPool>();
const inflight = new Map<string, Promise<AddressPool>>();

export function countryToApiSlug(code: CountryCode): string {
  return API_SLUG[code] ?? code.toLowerCase();
}

function isAddressPool(value: unknown): value is AddressPool {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every(
    (entries) =>
      Array.isArray(entries) &&
      entries.every(
        (item) => item && typeof item === 'object' && typeof (item as GeoEntry).c === 'string',
      ),
  );
}

export async function fetchAddressPool(countryCode: CountryCode): Promise<AddressPool> {
  const slug = countryToApiSlug(countryCode);
  const cached = poolCache.get(slug);
  if (cached) return cached;

  const pending = inflight.get(slug);
  if (pending) return pending;

  const request = (async () => {
    const res = await fetch(`/api/address-generate/${slug}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Address pool HTTP ${res.status}`);
    const payload = await res.json();
    if (!isAddressPool(payload)) throw new Error('Invalid address pool payload');
    poolCache.set(slug, payload);
    inflight.delete(slug);
    return payload;
  })().catch((error) => {
    inflight.delete(slug);
    throw error;
  });

  inflight.set(slug, request);
  return request;
}

export function listPoolRegions(pool: AddressPool): Array<{ code: string; name: string }> {
  return Object.keys(pool)
    .sort((a, b) => a.localeCompare(b))
    .map((code) => {
      const sample = pool[code]?.[0];
      const name =
        sample?.cn ||
        US_STATES.find((s) => s.code === code)?.name ||
        code;
      return { code, name };
    });
}

function resolveRegionKey(pool: AddressPool, state?: string): string {
  const keys = Object.keys(pool);
  if (!state) return pickRandom(keys);

  if (pool[state]) return state;

  const byCode = keys.find((k) => k.toLowerCase() === state.toLowerCase());
  if (byCode) return byCode;

  const byName = keys.find((k) =>
    pool[k].some((entry) => entry.cn?.toLowerCase() === state.toLowerCase()),
  );
  if (byName) return byName;

  return pickRandom(keys);
}

function pickGeo(pool: AddressPool, options?: { state?: string; city?: string }): {
  regionKey: string;
  geo: GeoEntry;
} {
  const regionKey = resolveRegionKey(pool, options?.state);
  let entries = pool[regionKey] ?? [];
  if (!entries.length) {
    const fallbackKey = pickRandom(Object.keys(pool));
    entries = pool[fallbackKey];
    return { regionKey: fallbackKey, geo: pickRandom(entries) };
  }

  if (options?.city) {
    const q = options.city.toLowerCase();
    const matched = entries.filter(
      (entry) => entry.c.toLowerCase().includes(q) || entry.cn?.toLowerCase().includes(q),
    );
    if (matched.length) return { regionKey, geo: pickRandom(matched) };
  }

  return { regionKey, geo: pickRandom(entries) };
}

const STREET_BY_COUNTRY: Partial<Record<CountryCode, string[]>> = {
  US: ['Main St', 'Oak Ave', 'Hill Ln', 'Park Ave', 'Lake Dr', 'Cedar St', 'Maple Ave'],
  JP: ['Chuo-dori', 'Sakura-dori', 'Meiji-dori', 'Omotesando', 'Takeshita-dori'],
  KR: ['Teheran-ro', 'Gangnam-daero', 'Sejong-daero', 'Olympic-ro'],
  CN: ['中山路', '人民路', '解放路', '建国路', '南京路'],
  AE: ['Sheikh Zayed Road', 'Al Wasl Road', 'Jumeirah Beach Road', 'Corniche Road'],
  GB: ['High Street', 'Church Road', 'Station Road', 'Victoria Street'],
  DE: ['Hauptstraße', 'Bahnhofstraße', 'Berliner Straße', 'Goethestraße'],
};

function buildStreet(countryCode: CountryCode, geo: GeoEntry): string {
  // Singapore dataset often stores street-like values in `c`
  if (countryCode === 'SG' && geo.cn) {
    const no = generateRandomNumber(1, 99);
    return `${no} ${geo.c}`;
  }
  const streets = STREET_BY_COUNTRY[countryCode] ?? STREET_BY_COUNTRY.US!;
  return `${generateRandomNumber(1, 9999)} ${pickRandom(streets)}`;
}

function resolveStateName(countryCode: CountryCode, regionKey: string, geo: GeoEntry): string {
  if (countryCode === 'US') {
    return US_STATES.find((s) => s.code === regionKey)?.name || geo.cn || regionKey;
  }
  if (countryCode === 'SG' && geo.cn) return geo.cn;
  return geo.cn || regionKey;
}

function resolveCity(countryCode: CountryCode, geo: GeoEntry): string {
  if (countryCode === 'SG' && geo.cn) {
    // Prefer district/area as city for SG
    return geo.cn.split(',')[0]?.trim() || geo.c;
  }
  return geo.c;
}

function resolvePostal(geo: GeoEntry): string {
  const raw = geo.p ?? geo.z ?? '—';
  return raw === '-' ? '—' : raw;
}

export async function generateWorldAddressFromApi(
  countryCode: CountryCode,
  options?: { state?: string; city?: string },
): Promise<USAddress & { countryCode: CountryCode }> {
  const pool = await fetchAddressPool(countryCode);
  const { regionKey, geo } = pickGeo(pool, options);
  const meta = getCountry(countryCode);

  const firstName = pickRandom([
    'James', 'Mary', 'David', 'Emily', 'Michael', 'Sarah', 'Daniel', 'Olivia',
    'Haruto', 'Yui', 'Wei', 'Fang', 'Omar', 'Fatima', 'Lucas', 'Emma',
  ]);
  const lastName = pickRandom([
    'Smith', 'Johnson', 'Brown', 'Garcia', 'Lee', 'Kim', 'Sato', 'Wang',
    'Ahmed', 'Martin', 'Müller', 'Silva',
  ]);

  return {
    firstName,
    lastName,
    street: buildStreet(countryCode, geo),
    city: resolveCity(countryCode, geo),
    state: resolveStateName(countryCode, regionKey, geo),
    stateCode: regionKey,
    zipCode: resolvePostal(geo),
    phone: `+${generateRandomNumber(1, 99)} ${generateRandomNumber(100, 999)}-${generateRandomNumber(100, 999)}-${generateRandomNumber(1000, 9999)}`,
    email: generateEmail(firstName, lastName),
    occupation: generateOccupation(),
    gender: generateGender(),
    birthDate: generateBirthDate(),
    country: meta.countryLabel,
    countryCode,
  };
}

/** Prefer Appark geo pool; fall back to local generator */
export async function generateWorldAddress(
  countryCode: CountryCode,
  options?: { state?: string; city?: string },
): Promise<USAddress & { countryCode: CountryCode }> {
  try {
    return await generateWorldAddressFromApi(countryCode, options);
  } catch {
    return generateLocalWorldAddress(countryCode, options);
  }
}

export async function loadCountryRegions(
  countryCode: CountryCode,
): Promise<Array<{ code: string; name: string }>> {
  try {
    const pool = await fetchAddressPool(countryCode);
    return listPoolRegions(pool);
  } catch {
    return getSubdivisions(countryCode).map((s) => ({ code: s.code, name: s.name }));
  }
}
