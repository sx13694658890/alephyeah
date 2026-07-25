import {
  FIRST_NAMES as US_FIRST,
  LAST_NAMES as US_LAST,
  STREET_NAMES as US_STREETS,
  STATES as US_STATES,
  TAX_FREE_STATES,
  generateAddress as generateUSAddress,
  generateEmail,
  generateOccupation,
  generateGender,
  generateBirthDate,
  generateRandomNumber,
  isTaxFreeState,
  pickRandom,
  type USAddress,
} from './us-address-data';

export type { USAddress as GeneratedAddress };
export {
  TAX_FREE_STATES,
  isTaxFreeState,
  generateEmail,
  generateOccupation,
  generateGender,
  generateBirthDate,
  pickRandom,
  generateRandomNumber,
};

export type CountryCode =
  | 'US'
  | 'CA'
  | 'MX'
  | 'JP'
  | 'KR'
  | 'HK'
  | 'CN'
  | 'SG'
  | 'PH'
  | 'IN'
  | 'PK'
  | 'KZ'
  | 'AE'
  | 'TR'
  | 'GB'
  | 'DE'
  | 'FR'
  | 'NL'
  | 'IT'
  | 'ES'
  | 'PL'
  | 'RU'
  | 'BR'
  | 'AR'
  | 'AU'
  | 'NG';

export type WorldRegion = 'na' | 'asia' | 'eu' | 'sa' | 'oceania' | 'africa';

export interface CountryMeta {
  code: CountryCode;
  flag: string;
  nameEn: string;
  nameZh: string;
  countryLabel: string;
  region: WorldRegion;
  taxFreeBadge?: boolean;
}

export interface Subdivision {
  name: string;
  code: string;
  cities: string[];
}

interface CountryPack {
  meta: CountryMeta;
  subdivisions: Subdivision[];
  streets: string[];
  firstNames: string[];
  lastNames: string[];
  postal: (sub: Subdivision) => string;
  phone: () => string;
}

export const REGION_LABELS: Record<WorldRegion, { en: string; zh: string }> = {
  na: { en: 'North America', zh: '北美' },
  asia: { en: 'Asia', zh: '亚洲' },
  eu: { en: 'Europe', zh: '欧洲' },
  sa: { en: 'South America', zh: '南美' },
  oceania: { en: 'Oceania', zh: '大洋洲' },
  africa: { en: 'Africa', zh: '非洲' },
};

export const REGION_ORDER: WorldRegion[] = ['na', 'asia', 'eu', 'sa', 'oceania', 'africa'];

const WEST_FIRST = US_FIRST.slice(0, 80);
const WEST_LAST = US_LAST.slice(0, 60);
const WEST_STREETS = US_STREETS.slice(0, 40);

const pad = (n: number, len: number) => String(n).padStart(len, '0');

function digitsPhone(prefix: string, groups: number[]): string {
  return `${prefix} ${groups.map((len) => pad(generateRandomNumber(0, 10 ** len - 1), len)).join(' ')}`;
}

function zipRange(min: number, max: number, len = 5): string {
  return pad(generateRandomNumber(min, max), len);
}

const PACKS: Record<CountryCode, CountryPack> = {
  US: {
    meta: {
      code: 'US',
      flag: '🇺🇸',
      nameEn: 'United States',
      nameZh: '美国',
      countryLabel: 'United States',
      region: 'na',
      taxFreeBadge: true,
    },
    subdivisions: US_STATES.map((s) => ({ name: s.name, code: s.code, cities: s.cities })),
    streets: US_STREETS,
    firstNames: US_FIRST,
    lastNames: US_LAST,
    postal: () => '00000',
    phone: () => '',
  },
  CA: {
    meta: {
      code: 'CA',
      flag: '🇨🇦',
      nameEn: 'Canada',
      nameZh: '加拿大',
      countryLabel: 'Canada',
      region: 'na',
    },
    subdivisions: [
      { name: 'Ontario', code: 'ON', cities: ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton'] },
      { name: 'British Columbia', code: 'BC', cities: ['Vancouver', 'Victoria', 'Burnaby', 'Surrey'] },
      { name: 'Quebec', code: 'QC', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau'] },
      { name: 'Alberta', code: 'AB', cities: ['Calgary', 'Edmonton', 'Red Deer'] },
    ],
    streets: ['Maple Ave', 'King St', 'Queen St', 'Bay St', 'Yonge St', 'Robson St', 'Granville St'],
    firstNames: WEST_FIRST,
    lastNames: WEST_LAST,
    postal: () => {
      const letters = 'ABCEGHJKLMNPRSTVXY';
      const a = () => letters[generateRandomNumber(0, letters.length - 1)];
      const d = () => String(generateRandomNumber(0, 9));
      return `${a()}${d()}${a()} ${d()}${a()}${d()}`;
    },
    phone: () => digitsPhone('+1', [3, 3, 4]),
  },
  MX: {
    meta: {
      code: 'MX',
      flag: '🇲🇽',
      nameEn: 'Mexico',
      nameZh: '墨西哥',
      countryLabel: 'Mexico',
      region: 'na',
    },
    subdivisions: [
      { name: 'Ciudad de México', code: 'CDMX', cities: ['Mexico City', 'Coyoacán', 'Polanco'] },
      { name: 'Jalisco', code: 'JAL', cities: ['Guadalajara', 'Zapopan', 'Tlaquepaque'] },
      { name: 'Nuevo León', code: 'NL', cities: ['Monterrey', 'San Pedro', 'Apodaca'] },
    ],
    streets: ['Av. Reforma', 'Calle Juárez', 'Av. Insurgentes', 'Calle Hidalgo', 'Av. Universidad'],
    firstNames: ['Carlos', 'Maria', 'Jose', 'Ana', 'Luis', 'Sofia', 'Diego', 'Valentina'],
    lastNames: ['Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez'],
    postal: () => zipRange(1000, 99999),
    phone: () => digitsPhone('+52', [2, 4, 4]),
  },
  JP: {
    meta: {
      code: 'JP',
      flag: '🇯🇵',
      nameEn: 'Japan',
      nameZh: '日本',
      countryLabel: 'Japan',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Tokyo', code: '13', cities: ['Shibuya', 'Shinjuku', 'Minato', 'Chiyoda'] },
      { name: 'Osaka', code: '27', cities: ['Osaka', 'Sakai', 'Higashiosaka'] },
      { name: 'Kanagawa', code: '14', cities: ['Yokohama', 'Kawasaki', 'Sagamihara'] },
    ],
    streets: ['Chuo-dori', 'Sakura-dori', 'Meiji-dori', 'Omotesando', 'Takeshita-dori'],
    firstNames: ['Haruto', 'Yui', 'Sota', 'Hina', 'Ren', 'Aoi', 'Yuto', 'Sakura'],
    lastNames: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto'],
    postal: () => `${zipRange(100, 999, 3)}-${zipRange(0, 9999, 4)}`,
    phone: () => digitsPhone('+81', [2, 4, 4]),
  },
  KR: {
    meta: {
      code: 'KR',
      flag: '🇰🇷',
      nameEn: 'South Korea',
      nameZh: '韩国',
      countryLabel: 'South Korea',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Seoul', code: 'SEO', cities: ['Gangnam', 'Jongno', 'Mapo', 'Songpa'] },
      { name: 'Busan', code: 'BUS', cities: ['Haeundae', 'Busanjin', 'Dongnae'] },
      { name: 'Incheon', code: 'INC', cities: ['Yeonsu', 'Namdong', 'Bupyeong'] },
    ],
    streets: ['Teheran-ro', 'Gangnam-daero', 'Sejong-daero', 'Olympic-ro', 'Dongho-ro'],
    firstNames: ['Minjun', 'Seoyeon', 'Jisoo', 'Hyunwoo', 'Yuna', 'Donghyun'],
    lastNames: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho'],
    postal: () => zipRange(10000, 63000),
    phone: () => digitsPhone('+82', [2, 4, 4]),
  },
  HK: {
    meta: {
      code: 'HK',
      flag: '🇭🇰',
      nameEn: 'Hong Kong',
      nameZh: '中国香港',
      countryLabel: 'Hong Kong',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Hong Kong Island', code: 'HKI', cities: ['Central', 'Wan Chai', 'Causeway Bay'] },
      { name: 'Kowloon', code: 'KLN', cities: ['Tsim Sha Tsui', 'Mong Kok', 'Kwun Tong'] },
      { name: 'New Territories', code: 'NT', cities: ['Sha Tin', 'Tuen Mun', 'Tai Po'] },
    ],
    streets: ["Queen's Road", 'Nathan Road', "Des Voeux Road", 'Canton Road', 'Hennessy Road'],
    firstNames: ['Ka Ming', 'Wing Yan', 'Chun Hei', 'Mei Ling', 'Wai Kit', 'Ho Yin'],
    lastNames: ['Chan', 'Wong', 'Lee', 'Cheung', 'Lau', 'Ng', 'Cheng'],
    postal: () => '—',
    phone: () => digitsPhone('+852', [4, 4]),
  },
  CN: {
    meta: {
      code: 'CN',
      flag: '🇨🇳',
      nameEn: 'China',
      nameZh: '中国',
      countryLabel: 'China',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Beijing', code: 'BJ', cities: ['Chaoyang', 'Haidian', 'Dongcheng'] },
      { name: 'Shanghai', code: 'SH', cities: ['Pudong', 'Xuhui', 'Jing\'an'] },
      { name: 'Guangdong', code: 'GD', cities: ['Guangzhou', 'Shenzhen', 'Dongguan'] },
      { name: 'Zhejiang', code: 'ZJ', cities: ['Hangzhou', 'Ningbo', 'Wenzhou'] },
    ],
    streets: ['中山路', '人民路', '解放路', '建国路', '南京路', '淮海路'],
    firstNames: ['Wei', 'Fang', 'Lei', 'Jing', 'Tao', 'Yan', 'Jun', 'Xia'],
    lastNames: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao'],
    postal: () => zipRange(100000, 999999, 6),
    phone: () => digitsPhone('+86', [3, 4, 4]),
  },
  SG: {
    meta: {
      code: 'SG',
      flag: '🇸🇬',
      nameEn: 'Singapore',
      nameZh: '新加坡',
      countryLabel: 'Singapore',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Central', code: 'CEN', cities: ['Orchard', 'Marina Bay', 'Bugis'] },
      { name: 'East', code: 'EAS', cities: ['Tampines', 'Bedok', 'Pasir Ris'] },
      { name: 'West', code: 'WES', cities: ['Jurong East', 'Clementi', 'Bukit Batok'] },
    ],
    streets: ['Orchard Road', 'Marina Boulevard', 'Serangoon Road', 'Bukit Timah Road'],
    firstNames: WEST_FIRST,
    lastNames: ['Tan', 'Lim', 'Lee', 'Ng', 'Ong', 'Wong', 'Goh', ...WEST_LAST.slice(0, 20)],
    postal: () => zipRange(100000, 829999, 6),
    phone: () => digitsPhone('+65', [4, 4]),
  },
  PH: {
    meta: {
      code: 'PH',
      flag: '🇵🇭',
      nameEn: 'Philippines',
      nameZh: '菲律宾',
      countryLabel: 'Philippines',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Metro Manila', code: 'NCR', cities: ['Makati', 'Quezon City', 'Manila', 'Taguig'] },
      { name: 'Cebu', code: 'CEB', cities: ['Cebu City', 'Mandaue', 'Lapu-Lapu'] },
    ],
    streets: ['Ayala Ave', 'EDSA', 'Roxas Blvd', 'Ortigas Ave', 'Taft Ave'],
    firstNames: ['Juan', 'Maria', 'Jose', 'Ana', 'Miguel', 'Sofia'],
    lastNames: ['Santos', 'Reyes', 'Cruz', 'Garcia', 'Lopez', 'Torres'],
    postal: () => zipRange(1000, 9900, 4),
    phone: () => digitsPhone('+63', [3, 3, 4]),
  },
  IN: {
    meta: {
      code: 'IN',
      flag: '🇮🇳',
      nameEn: 'India',
      nameZh: '印度',
      countryLabel: 'India',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Maharashtra', code: 'MH', cities: ['Mumbai', 'Pune', 'Nagpur'] },
      { name: 'Karnataka', code: 'KA', cities: ['Bengaluru', 'Mysuru', 'Mangaluru'] },
      { name: 'Delhi', code: 'DL', cities: ['New Delhi', 'Dwarka', 'Rohini'] },
    ],
    streets: ['MG Road', 'Ring Road', 'Park Street', 'Station Road', 'Nehru Road'],
    firstNames: ['Aarav', 'Diya', 'Vihaan', 'Ananya', 'Kabir', 'Isha'],
    lastNames: ['Sharma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Reddy'],
    postal: () => zipRange(110001, 850000, 6),
    phone: () => digitsPhone('+91', [5, 5]),
  },
  PK: {
    meta: {
      code: 'PK',
      flag: '🇵🇰',
      nameEn: 'Pakistan',
      nameZh: '巴基斯坦',
      countryLabel: 'Pakistan',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Punjab', code: 'PB', cities: ['Lahore', 'Faisalabad', 'Rawalpindi'] },
      { name: 'Sindh', code: 'SD', cities: ['Karachi', 'Hyderabad', 'Sukkur'] },
      { name: 'Islamabad', code: 'IS', cities: ['Islamabad', 'G-9', 'F-10'] },
    ],
    streets: ['Main Blvd', 'Mall Road', 'Shahrah-e-Faisal', 'University Road'],
    firstNames: ['Ahmed', 'Fatima', 'Hassan', 'Ayesha', 'Omar', 'Zainab'],
    lastNames: ['Khan', 'Ahmed', 'Ali', 'Hussain', 'Malik', 'Sheikh'],
    postal: () => zipRange(10000, 99999),
    phone: () => digitsPhone('+92', [3, 7]),
  },
  KZ: {
    meta: {
      code: 'KZ',
      flag: '🇰🇿',
      nameEn: 'Kazakhstan',
      nameZh: '哈萨克斯坦',
      countryLabel: 'Kazakhstan',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Almaty', code: 'ALA', cities: ['Almaty', 'Medeu', 'Bostandyk'] },
      { name: 'Astana', code: 'AST', cities: ['Astana', 'Esil', 'Saryarka'] },
    ],
    streets: ['Abay Ave', 'Dostyk Ave', 'Republic Ave', 'Nazarbayev Ave'],
    firstNames: ['Ayan', 'Aigerim', 'Nurlan', 'Dana', 'Bekzat', 'Madina'],
    lastNames: ['Omarov', 'Suleimenov', 'Nurgaliyev', 'Kim', 'Ivanov'],
    postal: () => zipRange(50000, 99000),
    phone: () => digitsPhone('+7', [3, 3, 4]),
  },
  AE: {
    meta: {
      code: 'AE',
      flag: '🇦🇪',
      nameEn: 'United Arab Emirates',
      nameZh: '阿联酋',
      countryLabel: 'United Arab Emirates',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Dubai', code: 'DU', cities: ['Dubai Marina', 'Downtown', 'Jumeirah', 'Deira'] },
      { name: 'Abu Dhabi', code: 'AZ', cities: ['Abu Dhabi', 'Al Reem', 'Yas Island'] },
      { name: 'Sharjah', code: 'SH', cities: ['Sharjah', 'Al Majaz', 'Al Nahda'] },
    ],
    streets: ['Sheikh Zayed Road', 'Al Wasl Road', 'Jumeirah Beach Road', 'Corniche Road', 'Airport Road'],
    firstNames: ['Omar', 'Fatima', 'Hassan', 'Layla', 'Yousef', 'Noor', 'Khalid', 'Amira'],
    lastNames: ['Al Maktoum', 'Al Nahyan', 'Al Qasimi', 'Hassan', 'Ahmed', 'Ibrahim'],
    postal: () => '—',
    phone: () => digitsPhone('+971', [2, 3, 4]),
  },
  TR: {
    meta: {
      code: 'TR',
      flag: '🇹🇷',
      nameEn: 'Turkey',
      nameZh: '土耳其',
      countryLabel: 'Turkey',
      region: 'asia',
    },
    subdivisions: [
      { name: 'Istanbul', code: '34', cities: ['Kadıköy', 'Beşiktaş', 'Şişli', 'Üsküdar'] },
      { name: 'Ankara', code: '06', cities: ['Çankaya', 'Keçiören', 'Yenimahalle'] },
      { name: 'Izmir', code: '35', cities: ['Konak', 'Bornova', 'Karşıyaka'] },
    ],
    streets: ['Atatürk Cad.', 'İstiklal Cad.', 'Bağdat Cad.', 'Cumhuriyet Cad.'],
    firstNames: ['Emre', 'Elif', 'Can', 'Zeynep', 'Burak', 'Ayşe'],
    lastNames: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Öztürk'],
    postal: () => zipRange(1000, 81999, 5),
    phone: () => digitsPhone('+90', [3, 3, 4]),
  },
  GB: {
    meta: {
      code: 'GB',
      flag: '🇬🇧',
      nameEn: 'United Kingdom',
      nameZh: '英国',
      countryLabel: 'United Kingdom',
      region: 'eu',
    },
    subdivisions: [
      { name: 'England', code: 'ENG', cities: ['London', 'Manchester', 'Birmingham', 'Leeds'] },
      { name: 'Scotland', code: 'SCT', cities: ['Edinburgh', 'Glasgow', 'Aberdeen'] },
      { name: 'Wales', code: 'WLS', cities: ['Cardiff', 'Swansea', 'Newport'] },
    ],
    streets: ['High Street', 'Church Road', 'Station Road', 'Victoria Street', 'King Street'],
    firstNames: WEST_FIRST,
    lastNames: WEST_LAST,
    postal: () => {
      const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const L = () => a[generateRandomNumber(0, 25)];
      const D = () => String(generateRandomNumber(0, 9));
      return `${L()}${L()}${D()}${D()} ${D()}${L()}${L()}`;
    },
    phone: () => digitsPhone('+44', [4, 6]),
  },
  DE: {
    meta: {
      code: 'DE',
      flag: '🇩🇪',
      nameEn: 'Germany',
      nameZh: '德国',
      countryLabel: 'Germany',
      region: 'eu',
    },
    subdivisions: [
      { name: 'Berlin', code: 'BE', cities: ['Mitte', 'Charlottenburg', 'Kreuzberg'] },
      { name: 'Bavaria', code: 'BY', cities: ['Munich', 'Nuremberg', 'Augsburg'] },
      { name: 'Hamburg', code: 'HH', cities: ['Hamburg', 'Altona', 'Eimsbüttel'] },
    ],
    streets: ['Hauptstraße', 'Bahnhofstraße', 'Berliner Straße', 'Goethestraße', 'Schillerstraße'],
    firstNames: ['Lukas', 'Mia', 'Leon', 'Emma', 'Paul', 'Sophie', 'Felix', 'Hannah'],
    lastNames: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Wagner'],
    postal: () => zipRange(10000, 99999),
    phone: () => digitsPhone('+49', [3, 7]),
  },
  FR: {
    meta: {
      code: 'FR',
      flag: '🇫🇷',
      nameEn: 'France',
      nameZh: '法国',
      countryLabel: 'France',
      region: 'eu',
    },
    subdivisions: [
      { name: 'Île-de-France', code: 'IDF', cities: ['Paris', 'Boulogne', 'Versailles'] },
      { name: 'Auvergne-Rhône-Alpes', code: 'ARA', cities: ['Lyon', 'Grenoble', 'Saint-Étienne'] },
      { name: 'Provence-Alpes-Côte d\'Azur', code: 'PAC', cities: ['Marseille', 'Nice', 'Toulon'] },
    ],
    streets: ['Rue de Rivoli', 'Avenue des Champs-Élysées', 'Boulevard Saint-Germain', 'Rue Victor Hugo'],
    firstNames: ['Lucas', 'Emma', 'Hugo', 'Léa', 'Louis', 'Chloé', 'Gabriel', 'Manon'],
    lastNames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard'],
    postal: () => zipRange(1000, 95999, 5),
    phone: () => digitsPhone('+33', [1, 2, 2, 2, 2]),
  },
  NL: {
    meta: {
      code: 'NL',
      flag: '🇳🇱',
      nameEn: 'Netherlands',
      nameZh: '荷兰',
      countryLabel: 'Netherlands',
      region: 'eu',
    },
    subdivisions: [
      { name: 'North Holland', code: 'NH', cities: ['Amsterdam', 'Haarlem', 'Hilversum'] },
      { name: 'South Holland', code: 'ZH', cities: ['Rotterdam', 'The Hague', 'Leiden'] },
      { name: 'Utrecht', code: 'UT', cities: ['Utrecht', 'Amersfoort', 'Zeist'] },
    ],
    streets: ['Kalverstraat', 'Damrak', 'Prinsengracht', 'Herengracht', 'Leidsestraat'],
    firstNames: ['Daan', 'Emma', 'Sem', 'Julia', 'Luuk', 'Sophie'],
    lastNames: ['de Jong', 'Jansen', 'de Vries', 'Bakker', 'Visser', 'Smit'],
    postal: () => {
      const L = () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[generateRandomNumber(0, 25)];
      return `${zipRange(1000, 9999, 4)} ${L()}${L()}`;
    },
    phone: () => digitsPhone('+31', [2, 7]),
  },
  IT: {
    meta: {
      code: 'IT',
      flag: '🇮🇹',
      nameEn: 'Italy',
      nameZh: '意大利',
      countryLabel: 'Italy',
      region: 'eu',
    },
    subdivisions: [
      { name: 'Lazio', code: 'LAZ', cities: ['Rome', 'Latina', 'Viterbo'] },
      { name: 'Lombardy', code: 'LOM', cities: ['Milan', 'Bergamo', 'Brescia'] },
      { name: 'Campania', code: 'CAM', cities: ['Naples', 'Salerno', 'Caserta'] },
    ],
    streets: ['Via Roma', 'Via Garibaldi', 'Corso Italia', 'Via Dante', 'Piazza Navona'],
    firstNames: ['Marco', 'Giulia', 'Luca', 'Sofia', 'Alessandro', 'Chiara'],
    lastNames: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano'],
    postal: () => zipRange(1000, 98168, 5),
    phone: () => digitsPhone('+39', [3, 7]),
  },
  ES: {
    meta: {
      code: 'ES',
      flag: '🇪🇸',
      nameEn: 'Spain',
      nameZh: '西班牙',
      countryLabel: 'Spain',
      region: 'eu',
    },
    subdivisions: [
      { name: 'Madrid', code: 'MD', cities: ['Madrid', 'Alcalá', 'Móstoles'] },
      { name: 'Catalonia', code: 'CT', cities: ['Barcelona', 'Girona', 'Tarragona'] },
      { name: 'Andalusia', code: 'AN', cities: ['Seville', 'Málaga', 'Granada'] },
    ],
    streets: ['Calle Mayor', 'Gran Vía', 'Paseo de la Castellana', 'Rambla Catalunya'],
    firstNames: ['Pablo', 'María', 'Diego', 'Lucía', 'Carlos', 'Carmen'],
    lastNames: ['García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'González'],
    postal: () => zipRange(1000, 52080, 5),
    phone: () => digitsPhone('+34', [3, 3, 3]),
  },
  PL: {
    meta: {
      code: 'PL',
      flag: '🇵🇱',
      nameEn: 'Poland',
      nameZh: '波兰',
      countryLabel: 'Poland',
      region: 'eu',
    },
    subdivisions: [
      { name: 'Masovia', code: 'MZ', cities: ['Warsaw', 'Radom', 'Płock'] },
      { name: 'Lesser Poland', code: 'MA', cities: ['Kraków', 'Tarnów', 'Nowy Sącz'] },
      { name: 'Silesia', code: 'SL', cities: ['Katowice', 'Gliwice', 'Sosnowiec'] },
    ],
    streets: ['ul. Marszałkowska', 'ul. Piotrkowska', 'ul. Floriańska', 'ul. Królewska'],
    firstNames: ['Jakub', 'Zuzanna', 'Jan', 'Julia', 'Antoni', 'Zofia'],
    lastNames: ['Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk'],
    postal: () => `${zipRange(10, 99, 2)}-${zipRange(100, 999, 3)}`,
    phone: () => digitsPhone('+48', [3, 3, 3]),
  },
  RU: {
    meta: {
      code: 'RU',
      flag: '🇷🇺',
      nameEn: 'Russia',
      nameZh: '俄罗斯',
      countryLabel: 'Russia',
      region: 'eu',
    },
    subdivisions: [
      { name: 'Moscow', code: 'MOW', cities: ['Moscow', 'Khamovniki', 'Arbat'] },
      { name: 'Saint Petersburg', code: 'SPE', cities: ['Saint Petersburg', 'Nevsky', 'Vasileostrovsky'] },
    ],
    streets: ['Tverskaya St', 'Nevsky Prospect', 'Arbat St', 'Leninsky Ave'],
    firstNames: ['Ivan', 'Anna', 'Dmitry', 'Maria', 'Alexey', 'Elena'],
    lastNames: ['Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov'],
    postal: () => zipRange(101000, 199406, 6),
    phone: () => digitsPhone('+7', [3, 3, 4]),
  },
  BR: {
    meta: {
      code: 'BR',
      flag: '🇧🇷',
      nameEn: 'Brazil',
      nameZh: '巴西',
      countryLabel: 'Brazil',
      region: 'sa',
    },
    subdivisions: [
      { name: 'São Paulo', code: 'SP', cities: ['São Paulo', 'Campinas', 'Santos'] },
      { name: 'Rio de Janeiro', code: 'RJ', cities: ['Rio de Janeiro', 'Niterói', 'Petrópolis'] },
      { name: 'Minas Gerais', code: 'MG', cities: ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora'] },
    ],
    streets: ['Av. Paulista', 'Rua Augusta', 'Av. Atlântica', 'Rua Oscar Freire'],
    firstNames: ['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia'],
    lastNames: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira'],
    postal: () => `${zipRange(1000, 99999, 5)}-${zipRange(0, 999, 3)}`,
    phone: () => digitsPhone('+55', [2, 5, 4]),
  },
  AR: {
    meta: {
      code: 'AR',
      flag: '🇦🇷',
      nameEn: 'Argentina',
      nameZh: '阿根廷',
      countryLabel: 'Argentina',
      region: 'sa',
    },
    subdivisions: [
      { name: 'Buenos Aires', code: 'BA', cities: ['Buenos Aires', 'La Plata', 'Mar del Plata'] },
      { name: 'Córdoba', code: 'CB', cities: ['Córdoba', 'Villa María', 'Río Cuarto'] },
    ],
    streets: ['Av. Corrientes', 'Av. Santa Fe', 'Calle Florida', 'Av. 9 de Julio'],
    firstNames: ['Santiago', 'Valentina', 'Mateo', 'Sofía', 'Benjamín', 'Martina'],
    lastNames: ['González', 'Rodríguez', 'Fernández', 'López', 'Martínez'],
    postal: () => {
      const L = () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[generateRandomNumber(0, 25)];
      return `${L()}${zipRange(1000, 9999, 4)}${L()}${L()}${L()}`;
    },
    phone: () => digitsPhone('+54', [2, 4, 4]),
  },
  AU: {
    meta: {
      code: 'AU',
      flag: '🇦🇺',
      nameEn: 'Australia',
      nameZh: '澳大利亚',
      countryLabel: 'Australia',
      region: 'oceania',
    },
    subdivisions: [
      { name: 'New South Wales', code: 'NSW', cities: ['Sydney', 'Newcastle', 'Wollongong'] },
      { name: 'Victoria', code: 'VIC', cities: ['Melbourne', 'Geelong', 'Ballarat'] },
      { name: 'Queensland', code: 'QLD', cities: ['Brisbane', 'Gold Coast', 'Cairns'] },
    ],
    streets: WEST_STREETS,
    firstNames: WEST_FIRST,
    lastNames: WEST_LAST,
    postal: () => zipRange(800, 9999, 4),
    phone: () => digitsPhone('+61', [1, 4, 3]),
  },
  NG: {
    meta: {
      code: 'NG',
      flag: '🇳🇬',
      nameEn: 'Nigeria',
      nameZh: '尼日利亚',
      countryLabel: 'Nigeria',
      region: 'africa',
    },
    subdivisions: [
      { name: 'Lagos', code: 'LA', cities: ['Lagos', 'Ikeja', 'Lekki', 'Victoria Island'] },
      { name: 'Abuja FCT', code: 'FC', cities: ['Abuja', 'Garki', 'Maitama'] },
      { name: 'Rivers', code: 'RI', cities: ['Port Harcourt', 'Obio-Akpor'] },
    ],
    streets: ['Adeniran Ogunsanya St', 'Broad Street', 'Awolowo Road', 'Allen Avenue'],
    firstNames: ['Chinedu', 'Amina', 'Emeka', 'Fatima', 'Tunde', 'Ngozi'],
    lastNames: ['Okonkwo', 'Adeyemi', 'Ibrahim', 'Okafor', 'Bello', 'Nwosu'],
    postal: () => zipRange(100001, 901101, 6),
    phone: () => digitsPhone('+234', [3, 3, 4]),
  },
};

export const COUNTRIES: CountryMeta[] = REGION_ORDER.flatMap((region) =>
  (Object.values(PACKS) as CountryPack[])
    .filter((p) => p.meta.region === region)
    .map((p) => p.meta),
);

export function getCountry(code: CountryCode): CountryMeta {
  return PACKS[code].meta;
}

export function getSubdivisions(code: CountryCode): Subdivision[] {
  return PACKS[code].subdivisions;
}

export function generateWorldAddress(
  countryCode: CountryCode,
  options?: { state?: string; city?: string },
): USAddress & { countryCode: CountryCode } {
  if (countryCode === 'US') {
    const us = generateUSAddress({ state: options?.state, city: options?.city });
    return { ...us, countryCode: 'US' };
  }

  const pack = PACKS[countryCode];
  let sub =
    (options?.state
      ? pack.subdivisions.find((s) => s.code === options.state || s.name === options.state)
      : null) ?? pickRandom(pack.subdivisions);

  let city =
    (options?.city
      ? sub.cities.find((c) => c.toLowerCase() === options.city!.toLowerCase())
      : null) ?? pickRandom(sub.cities);

  const firstName = pickRandom(pack.firstNames);
  const lastName = pickRandom(pack.lastNames);
  const streetNo = generateRandomNumber(1, 999);
  const street = `${streetNo} ${pickRandom(pack.streets)}`;

  return {
    firstName,
    lastName,
    street,
    city,
    state: sub.name,
    stateCode: sub.code,
    zipCode: pack.postal(sub),
    phone: pack.phone(),
    email: generateEmail(firstName.replace(/\s+/g, ''), lastName.replace(/\s+/g, '')),
    occupation: generateOccupation(),
    gender: generateGender(),
    birthDate: generateBirthDate(),
    country: pack.meta.countryLabel,
    countryCode,
  };
}

export function formatAddressAsText(addr: USAddress): string {
  return [
    `${addr.firstName} ${addr.lastName}`,
    addr.street,
    `${addr.city}, ${addr.stateCode} ${addr.zipCode}`,
    addr.country,
    `Phone: ${addr.phone}`,
    `Email: ${addr.email}`,
    `Occupation: ${addr.occupation}`,
    `Gender: ${addr.gender}`,
    `DOB: ${addr.birthDate}`,
  ].join('\n');
}

export function isCountryCode(value: string): value is CountryCode {
  return value in PACKS;
}
