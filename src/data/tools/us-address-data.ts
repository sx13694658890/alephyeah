export interface USAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  stateCode: string;
  zipCode: string;
  phone: string;
  email: string;
  occupation: string;
  gender: string;
  birthDate: string;
  country: string;
}

export const TAX_FREE_STATES = [
  { name: 'Oregon', code: 'OR' },
  { name: 'Montana', code: 'MT' },
  { name: 'Delaware', code: 'DE' },
  { name: 'New Hampshire', code: 'NH' },
  { name: 'Alaska', code: 'AK' },
];

export const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Andrew', 'Emily', 'Paul', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
  'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra',
  'Frank', 'Rachel', 'Alexander', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Catherine',
  'Dennis', 'Maria', 'Jerry', 'Heather', 'Tyler', 'Diane', 'Aaron', 'Ruth',
  'Jose', 'Julie', 'Nathan', 'Olivia', 'Henry', 'Joyce', 'Douglas', 'Virginia',
  'Peter', 'Victoria', 'Adam', 'Kelly', 'Zachary', 'Lauren', 'Walter', 'Rose',
  'Kyle', 'Megan', 'Harold', 'Evelyn', 'Carl', 'Kayla', 'Jeremy', 'Mildred',
  'Gerald', 'Lori', 'Keith', 'Sherry', 'Roger', 'Sylvia', 'Arthur', 'Judith',
  'Lawrence', 'Theresa', 'Sean', 'Doris', 'Christian', 'Marie', 'Albert', 'Kathryn',
  'Joe', 'Ann', 'Ethan', 'Gloria', 'Austin', 'Jacqueline', 'Jesse', 'Kathy',
  'Willie', 'Hannah', 'Billy', 'Teresa', 'Bruce', 'Sara', 'Bryan', 'Janice',
  'Roy', 'Julia', 'Eugene', 'Grace', 'Louis', 'Judy', 'Dylan', 'Thelma',
  'Juan', 'Lucille', 'Noah', 'Marilyn', 'Randy', 'Madison', 'Russell', 'Lillian',
  'Vincent', 'Charlene', 'Philip', 'Martha', 'Logan', 'Amber', 'Curtis', 'Alice',
  'Bradley', 'Carrie', 'Dominic', 'Ella', 'Luis', 'Diana', 'Isaiah', 'Natalie',
  'Owen', 'Isabella', 'Caleb', 'Ava', 'Micah', 'Sophia', 'Ezra', 'Chloe',
  'Leo', 'Mia', 'Eli', 'Aria', 'Elliot', 'Elena', 'Finn', 'Zoe',
  'Lucas', 'Penelope', 'Mason', 'Layla', 'Chase', 'Riley', 'Aiden', 'Luna',
];

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza',
  'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers',
  'Long', 'Ross', 'Foster', 'Jimenez',
];

export const STREET_NAMES = [
  'Main St', 'Oak Ave', 'Elm St', 'Park Ave', 'Maple Ave', 'Cedar St', 'Pine St',
  'Washington St', 'Lake Dr', 'Hill Rd', 'River Rd', 'Spring St', 'Church St', 'Broadway',
  'High St', 'Market St', 'School St', 'Mill St', 'Forest Ave', 'North St', 'South St',
  'East St', 'West St', 'Center St', 'View Dr', 'Valley Rd', 'Meadow Ln', 'Garden Ln',
  'Sunset Blvd', 'Ocean Dr', 'Harbor Blvd', 'Mountain Rd', 'Birch Ln', 'Chestnut St',
  'Locust St', 'Walnut St', 'Cherry Ln', 'Bay Dr', 'Lakeshore Dr', 'Ridge Rd',
  'Willow Ln', 'Ash St', 'Poplar St', 'Sycamore Ave', 'Hemlock Ln', 'Magnolia Ave',
  'Cypress Ln', 'Laurel Ln', 'Beech St', 'Holly Dr', 'Fir Ln', 'Spruce St',
  'Colonial Dr', 'Heritage Dr', 'Royal Ln', 'Jefferson Ave', 'Madison Ave', 'Monroe Dr',
  'Lincoln St', 'Franklin Blvd', 'Hamilton Ct', 'Adams St', 'Jackson Blvd', 'Grant Ave',
  'Clayton Rd', 'Benton Dr', 'Sterling Ave', 'Cambridge Rd', 'Oxford St', 'Stanford Ave',
  'Harvard Ct', 'Princeton Ln', 'Yale Dr', 'Cornell Ave', 'Duke St', 'Rice Blvd',
  'Pennsylvania Ave', 'Atlantic Ave', 'Pacific Ave', 'Western Ave', 'Eastern Pkwy',
  'Liberty Ave', 'Victory Blvd', 'Heritage Way', 'Trail Dr', 'Timber Ln',
  'Meadowbrook Dr', 'Fairway Dr', 'Country Club Rd', 'Creek Rd', 'Brook Ln',
  'Woodland Dr', 'Highland Ave', 'Park Dr', 'Overlook Dr', 'Summit Dr',
  'Crystal Ln', 'Amber Ct', 'Sapphire Dr', 'Ruby Ln', 'Diamond Ave',
  'Golden Gate Ave', 'Silver Lake Blvd', 'Bronze Ct', 'Cooper Dr',
  'Hickory Ln', 'Dogwood Ave', 'Azalea Ct', 'Jasmine Dr', 'Rose Ln',
  'Tulip Dr', 'Orchid Ln', 'Iris Ct', 'Daisy Ln', 'Lily Ave',
];

export const STATES: Array<{ name: string; code: string; cities: string[]; zipRange: [number, number] }> = [
  { name: 'Alabama', code: 'AL', cities: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa', 'Auburn', 'Dothan'], zipRange: [35004, 36925] },
  { name: 'Alaska', code: 'AK', cities: ['Anchorage', 'Fairbanks', 'Juneau', 'Wasilla', 'Sitka', 'Ketchikan'], zipRange: [99501, 99950] },
  { name: 'Arizona', code: 'AZ', cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Gilbert', 'Tempe', 'Peoria', 'Flagstaff'], zipRange: [85001, 86556] },
  { name: 'Arkansas', code: 'AR', cities: ['Little Rock', 'Fayetteville', 'Fort Smith', 'Springdale', 'Jonesboro', 'Rogers', 'Conway'], zipRange: [71601, 72959] },
  { name: 'California', code: 'CA', cities: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Stockton', 'Irvine'], zipRange: [90001, 96162] },
  { name: 'Colorado', code: 'CO', cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Boulder', 'Greeley', 'Pueblo'], zipRange: [80001, 81658] },
  { name: 'Connecticut', code: 'CT', cities: ['Bridgeport', 'New Haven', 'Hartford', 'Stamford', 'Waterbury', 'Norwalk', 'Danbury'], zipRange: [6001, 6928] },
  { name: 'Delaware', code: 'DE', cities: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Milford'], zipRange: [19701, 19980] },
  { name: 'Florida', code: 'FL', cities: ['Miami', 'Jacksonville', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Fort Lauderdale', 'Tallahassee', 'Gainesville', 'Naples', 'Sarasota'], zipRange: [32003, 34997] },
  { name: 'Georgia', code: 'GA', cities: ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Macon', 'Roswell', 'Albany'], zipRange: [30002, 31999] },
  { name: 'Hawaii', code: 'HI', cities: ['Honolulu', 'Hilo', 'Kailua', 'Kapolei', 'Kahului', 'Kaneohe'], zipRange: [96701, 96898] },
  { name: 'Idaho', code: 'ID', cities: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell', 'Coeur d\'Alene'], zipRange: [83201, 83877] },
  { name: 'Illinois', code: 'IL', cities: ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield', 'Peoria', 'Elgin'], zipRange: [60001, 62999] },
  { name: 'Indiana', code: 'IN', cities: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Bloomington', 'Lafayette'], zipRange: [46001, 47997] },
  { name: 'Iowa', code: 'IA', cities: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Council Bluffs'], zipRange: [50001, 52809] },
  { name: 'Kansas', code: 'KS', cities: ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe', 'Lawrence', 'Manhattan'], zipRange: [66002, 67954] },
  { name: 'Kentucky', code: 'KY', cities: ['Louisville', 'Lexington', 'Frankfort', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond'], zipRange: [40003, 42788] },
  { name: 'Louisiana', code: 'LA', cities: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City'], zipRange: [70001, 71497] },
  { name: 'Maine', code: 'ME', cities: ['Portland', 'Lewiston', 'Bangor', 'Augusta', 'South Portland', 'Auburn', 'Biddeford'], zipRange: [3901, 4992] },
  { name: 'Maryland', code: 'MD', cities: ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Waldorf', 'Frederick', 'Gaithersburg'], zipRange: [20601, 21930] },
  { name: 'Massachusetts', code: 'MA', cities: ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'Newton', 'Quincy'], zipRange: [1001, 5544] },
  { name: 'Michigan', code: 'MI', cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn'], zipRange: [48001, 49971] },
  { name: 'Minnesota', code: 'MN', cities: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth', 'Bloomington', 'Plymouth', 'Eagan'], zipRange: [55001, 56763] },
  { name: 'Mississippi', code: 'MS', cities: ['Jackson', 'Gulfport', 'Southaven', 'Biloxi', 'Hattiesburg', 'Meridian', 'Tupelo'], zipRange: [38601, 39776] },
  { name: 'Missouri', code: 'MO', cities: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', 'Lee\'s Summit', 'O\'Fallon'], zipRange: [63001, 65899] },
  { name: 'Montana', code: 'MT', cities: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Helena', 'Butte', 'Kalispell'], zipRange: [59001, 59937] },
  { name: 'Nebraska', code: 'NE', cities: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont', 'Norfolk'], zipRange: [68001, 69367] },
  { name: 'Nevada', code: 'NV', cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City', 'Elko'], zipRange: [88901, 89883] },
  { name: 'New Hampshire', code: 'NH', cities: ['Manchester', 'Nashua', 'Concord', 'Derry', 'Rochester', 'Portsmouth', 'Keene'], zipRange: [3031, 3897] },
  { name: 'New Jersey', code: 'NJ', cities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Trenton', 'Camden', 'Passaic', 'Union City'], zipRange: [7001, 8989] },
  { name: 'New Mexico', code: 'NM', cities: ['Albuquerque', 'Santa Fe', 'Las Cruces', 'Rio Rancho', 'Farmington', 'Roswell', 'Clovis'], zipRange: [87001, 88441] },
  { name: 'New York', code: 'NY', cities: ['New York City', 'Buffalo', 'Rochester', 'Syracuse', 'Albany', 'Yonkers', 'Utica', 'Niagara Falls'], zipRange: [10001, 14975] },
  { name: 'North Carolina', code: 'NC', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Asheville'], zipRange: [27006, 28909] },
  { name: 'North Dakota', code: 'ND', cities: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo', 'Mandan', 'Williston'], zipRange: [58001, 58856] },
  { name: 'Ohio', code: 'OH', cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Youngstown', 'Canton'], zipRange: [43001, 45999] },
  { name: 'Oklahoma', code: 'OK', cities: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond', 'Lawton', 'Enid'], zipRange: [73001, 74966] },
  { name: 'Oregon', code: 'OR', cities: ['Portland', 'Salem', 'Eugene', 'Gresham', 'Beaverton', 'Hillsboro', 'Medford', 'Bend'], zipRange: [97001, 97920] },
  { name: 'Pennsylvania', code: 'PA', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster'], zipRange: [15001, 19640] },
  { name: 'Rhode Island', code: 'RI', cities: ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket', 'Newport'], zipRange: [2801, 2940] },
  { name: 'South Carolina', code: 'SC', cities: ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Spartanburg'], zipRange: [29001, 29945] },
  { name: 'South Dakota', code: 'SD', cities: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown', 'Mitchell', 'Yankton'], zipRange: [57001, 57799] },
  { name: 'Tennessee', code: 'TN', cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin', 'Jackson'], zipRange: [37010, 38589] },
  { name: 'Texas', code: 'TX', cities: ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Garland', 'Irving', 'Lubbock'], zipRange: [73301, 88595] },
  { name: 'Utah', code: 'UT', cities: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George'], zipRange: [84001, 84791] },
  { name: 'Vermont', code: 'VT', cities: ['Burlington', 'South Burlington', 'Rutland', 'Montpelier', 'Barre', 'St. Albans', 'Winooski'], zipRange: [5001, 5907] },
  { name: 'Virginia', code: 'VA', cities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Roanoke'], zipRange: [20101, 24658] },
  { name: 'Washington', code: 'WA', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Yakima'], zipRange: [98001, 99403] },
  { name: 'West Virginia', code: 'WV', cities: ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling', 'Weirton', 'Fairmont'], zipRange: [24701, 26886] },
  { name: 'Wisconsin', code: 'WI', cities: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha', 'Eau Claire'], zipRange: [53001, 54990] },
  { name: 'Wyoming', code: 'WY', cities: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs', 'Sheridan', 'Evanston'], zipRange: [82001, 83414] },
  { name: 'District of Columbia', code: 'DC', cities: ['Washington'], zipRange: [20001, 20599] },
];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generatePhone(): string {
  const area = generateRandomNumber(200, 999);
  const prefix = generateRandomNumber(200, 999);
  const line = generateRandomNumber(1000, 9999);
  return `(${area}) ${prefix}-${line}`;
}

export function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com', 'example.com'];
  const n = generateRandomNumber(10, 99);
  const local = `${firstName.toLowerCase()}${lastName.toLowerCase()}${n}`;
  return `${local}@${pickRandom(domains)}`;
}

export const OCCUPATIONS = [
  'Data Analyst', 'Software Engineer', 'Product Manager', 'Designer', 'Teacher',
  'Accountant', 'Nurse', 'Marketing Specialist', 'Sales Representative', 'Consultant',
  'Project Manager', 'Researcher', 'Architect', 'Lawyer', 'Doctor',
  'Writer', 'Photographer', 'Chef', 'Entrepreneur', 'Student',
];

export function generateOccupation(): string {
  return pickRandom(OCCUPATIONS);
}

export function generateGender(): string {
  return pickRandom(['Male', 'Female']);
}

export function generateBirthDate(minAge = 22, maxAge = 65): string {
  const now = new Date();
  const age = generateRandomNumber(minAge, maxAge);
  const year = now.getFullYear() - age;
  const month = generateRandomNumber(1, 12);
  const day = generateRandomNumber(1, 28);
  return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
}

export function generateAddress(options?: { state?: string; city?: string }): USAddress {
  let stateData: typeof STATES[0];
  let stateName: string;
  let stateCode: string;

  if (options?.state) {
    const found = STATES.find(s => s.code === options.state || s.name === options.state);
    if (found) {
      stateData = found;
      stateName = found.name;
      stateCode = found.code;
    } else {
      stateData = pickRandom(STATES);
      stateName = stateData.name;
      stateCode = stateData.code;
    }
  } else {
    stateData = pickRandom(STATES);
    stateName = stateData.name;
    stateCode = stateData.code;
  }

  let city: string;
  if (options?.city) {
    const foundCity = stateData.cities.find(
      c => c.toLowerCase() === options.city!.toLowerCase()
    );
    city = foundCity ?? pickRandom(stateData.cities);
  } else {
    city = pickRandom(stateData.cities);
  }

  const streetNumber = generateRandomNumber(100, 9999);
  const streetName = pickRandom(STREET_NAMES);
  const street = `${streetNumber} ${streetName}`;

  const [zipMin, zipMax] = stateData.zipRange;
  const zipCode = String(generateRandomNumber(zipMin, zipMax));

  const firstName = pickRandom(FIRST_NAMES);
  const lastName = pickRandom(LAST_NAMES);
  const phone = generatePhone();
  const email = generateEmail(firstName, lastName);

  return {
    firstName,
    lastName,
    street,
    city,
    state: stateName,
    stateCode,
    zipCode,
    phone,
    email,
    occupation: generateOccupation(),
    gender: generateGender(),
    birthDate: generateBirthDate(),
    country: 'United States',
  };
}

export function isTaxFreeState(stateCode: string): boolean {
  return TAX_FREE_STATES.some(s => s.code === stateCode);
}

export function getTaxFreeStates(): typeof TAX_FREE_STATES {
  return TAX_FREE_STATES;
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

export const STATE_OPTIONS = STATES.map(({ code, name }) => ({ code, name }));
