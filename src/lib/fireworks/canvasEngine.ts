/** 参考 88lin fireworks / NianBroken script.js 色板与常量 */
export const FIREWORK_COLORS = {
  Red: '#ff0043',
  Green: '#14fc56',
  Blue: '#1e7fff',
  Purple: '#e60aff',
  Gold: '#ffbf36',
  White: '#ffffff',
} as const;

export const COLOR_LIST = Object.values(FIREWORK_COLORS);

export const COLOR_TUPLES: Record<string, { r: number; g: number; b: number }> = {
  [FIREWORK_COLORS.Red]: { r: 255, g: 0, b: 67 },
  [FIREWORK_COLORS.Green]: { r: 20, g: 252, b: 86 },
  [FIREWORK_COLORS.Blue]: { r: 30, g: 127, b: 255 },
  [FIREWORK_COLORS.Purple]: { r: 230, g: 10, b: 255 },
  [FIREWORK_COLORS.Gold]: { r: 255, g: 191, b: 54 },
  [FIREWORK_COLORS.White]: { r: 255, g: 255, b: 255 },
};

export const GRAVITY = 0.9;
export const PI2 = Math.PI * 2;
export const STAR_DRAW_WIDTH = 3;
export const SPARK_DRAW_WIDTH = 1;
export const STAR_AIR_DRAG = 0.98;
export const STAR_AIR_DRAG_HEAVY = 0.992;
export const SPARK_AIR_DRAG = 0.9;

export interface FireworksConfig {
  quality: 1 | 2 | 3;
  shellSize: number;
  shellType: ShellType;
  skyLighting: 0 | 1 | 2;
  scaleFactor: number;
  autoLaunch: boolean;
  finaleMode: boolean;
  longExposure: boolean;
}

export type ShellType =
  | 'random'
  | 'crysanthemum'
  | 'crossette'
  | 'crackle'
  | 'strobe'
  | 'willow'
  | 'ring';

export const SHELL_TYPE_OPTIONS: ShellType[] = [
  'random',
  'crysanthemum',
  'crossette',
  'crackle',
  'strobe',
  'willow',
  'ring',
];

export const DEFAULT_CONFIG: FireworksConfig = {
  quality: 2,
  shellSize: 3,
  shellType: 'random',
  skyLighting: 2,
  scaleFactor: 1,
  autoLaunch: true,
  finaleMode: false,
  longExposure: false,
};

export interface BurstFlash {
  x: number;
  y: number;
  radius: number;
}

export interface Spark {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  speedX: number;
  speedY: number;
  life: number;
  color: string;
}

export interface Star {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  speedX: number;
  speedY: number;
  life: number;
  fullLife: number;
  color: string;
  heavy: boolean;
  visible: boolean;
  sparkFreq: number;
  sparkSpeed: number;
  sparkLife: number;
  sparkLifeVariation: number;
  sparkColor: string;
  sparkTimer: number;
  secondColor?: string;
  transitionTime: number;
  colorChanged: boolean;
  onDeath?: (star: Star) => void;
}

export interface Comet {
  star: Star;
  shell: ShellRecipe;
  burstY: number;
}

export interface ShellRecipe {
  spreadSize: number;
  starLife: number;
  starLifeVariation: number;
  starCount: number;
  color: string | [string, string];
  secondColor?: string | null;
  glitter: '' | 'light' | 'medium' | 'willow';
  glitterColor: string;
  crossette?: boolean;
  crackle?: boolean;
  ring?: boolean;
  soundScale?: number;
}

export interface SkyColor {
  r: number;
  g: number;
  b: number;
}

export function randomColor(opts?: { notColor?: string; limitWhite?: boolean }): string {
  let pool = [...COLOR_LIST];
  if (opts?.limitWhite) pool = pool.filter((c) => c !== FIREWORK_COLORS.White);
  if (opts?.notColor) pool = pool.filter((c) => c !== opts.notColor);
  return pool[Math.floor(Math.random() * pool.length)] ?? FIREWORK_COLORS.Red;
}

function whiteOrGold() {
  return Math.random() < 0.5 ? FIREWORK_COLORS.Gold : FIREWORK_COLORS.White;
}

export function crysanthemumShell(size: number): ShellRecipe {
  const single = Math.random() < 0.64;
  const color = single
    ? randomColor({ limitWhite: true })
    : ([randomColor(), randomColor()] as [string, string]);
  const primary = Array.isArray(color) ? color[0] : color;
  const secondColor =
    single && Math.random() < 0.22
      ? randomColor({ notColor: primary, limitWhite: true })
      : null;
  const spreadSize = 300 + size * 100;
  const scaled = spreadSize / 54;
  return {
    spreadSize,
    starLife: 900 + size * 200,
    starLifeVariation: 0.125,
    starCount: Math.max(6, scaled * scaled * 1.25),
    color: primary,
    secondColor,
    glitter: Math.random() < 0.65 ? 'light' : '',
    glitterColor: whiteOrGold(),
  };
}

export function crackleShell(size: number): ShellRecipe {
  const color = Math.random() < 0.75 ? FIREWORK_COLORS.Gold : randomColor();
  const spreadSize = 380 + size * 75;
  const scaled = spreadSize / 54;
  return {
    spreadSize,
    starLife: 600 + size * 100,
    starLifeVariation: 0.32,
    starCount: Math.max(6, scaled * scaled * 1),
    color,
    glitter: 'light',
    glitterColor: FIREWORK_COLORS.Gold,
    crackle: true,
  };
}

export function strobeShell(size: number): ShellRecipe {
  const color = randomColor({ limitWhite: true });
  const spreadSize = 280 + size * 92;
  const scaled = spreadSize / 54;
  return {
    spreadSize,
    starLife: 1100 + size * 200,
    starLifeVariation: 0.4,
    starCount: Math.max(6, scaled * scaled * 1.1),
    color,
    secondColor: Math.random() < 0.5 ? FIREWORK_COLORS.White : null,
    glitter: 'light',
    glitterColor: FIREWORK_COLORS.White,
  };
}

export function crossetteShell(size: number): ShellRecipe {
  const base = crysanthemumShell(size);
  return { ...base, crossette: true, starCount: base.starCount * 0.85 };
}

export function willowShell(size: number): ShellRecipe {
  const spreadSize = 300 + size * 100;
  const scaled = spreadSize / 54;
  return {
    spreadSize,
    starLife: 3000 + size * 300,
    starLifeVariation: 0.2,
    starCount: Math.max(6, scaled * scaled * 0.6),
    color: FIREWORK_COLORS.Gold,
    glitter: 'willow',
    glitterColor: FIREWORK_COLORS.Gold,
    soundScale: 0.7,
  };
}

export function ringShell(size: number): ShellRecipe {
  const color = randomColor();
  const spreadSize = 300 + size * 100;
  const scaled = spreadSize / 54;
  return {
    spreadSize,
    starLife: 900 + size * 200,
    starLifeVariation: 0.125,
    starCount: Math.max(24, PI2 * (size + 1) * 2.2),
    color,
    secondColor: randomColor({ notColor: color, limitWhite: true }),
    glitter: 'light',
    glitterColor: color === FIREWORK_COLORS.Gold ? FIREWORK_COLORS.Gold : FIREWORK_COLORS.White,
    ring: true,
  };
}

export function resolveShell(type: ShellType, size: number): ShellRecipe {
  if (type === 'random') return pickShell(size);
  switch (type) {
    case 'crysanthemum':
      return crysanthemumShell(size);
    case 'crossette':
      return crossetteShell(size);
    case 'crackle':
      return crackleShell(size);
    case 'strobe':
      return strobeShell(size);
    case 'willow':
      return willowShell(size);
    case 'ring':
      return ringShell(size);
    default:
      return pickShell(size);
  }
}

export function createBurst(
  count: number,
  factory: (angle: number, speedMult: number) => void,
  startAngle = 0,
  arcLength = PI2,
) {
  const R = 0.5 * Math.sqrt(count / Math.PI);
  const C = 2 * R * Math.PI;
  const C_HALF = C / 2;

  for (let ring = 0; ring <= C_HALF; ring += 1) {
    const ringAngle = (ring / C_HALF) * (Math.PI / 2);
    const ringSize = Math.cos(ringAngle);
    const partsPerFullRing = C * ringSize;
    const partsPerArc = partsPerFullRing * (arcLength / PI2);
    const angleInc = PI2 / partsPerFullRing;
    const angleOffset = Math.random() * angleInc + startAngle;
    const maxRandomAngleOffset = angleInc * 0.33;

    for (let i = 0; i < partsPerArc; i += 1) {
      factory(angleInc * i + angleOffset + Math.random() * maxRandomAngleOffset, ringSize);
    }
  }
}

function makeStar(
  x: number,
  y: number,
  color: string,
  angle: number,
  speed: number,
  life: number,
  speedOffX = 0,
  speedOffY = 0,
  heavy = false,
): Star {
  return {
    x,
    y,
    prevX: x,
    prevY: y,
    speedX: Math.sin(angle) * speed + speedOffX,
    speedY: Math.cos(angle) * speed + speedOffY,
    life,
    fullLife: life,
    color,
    heavy,
    visible: true,
    sparkFreq: 0,
    sparkSpeed: 1,
    sparkLife: 750,
    sparkLifeVariation: 0.25,
    sparkColor: color,
    sparkTimer: 0,
    transitionTime: 0,
    colorChanged: false,
  };
}

function spawnSpark(sparks: Spark[], x: number, y: number, color: string, angle: number, speed: number, life: number) {
  sparks.push({
    x,
    y,
    prevX: x,
    prevY: y,
    speedX: Math.sin(angle) * speed,
    speedY: Math.cos(angle) * speed,
    life,
    color,
  });
}

function applyGlitter(star: Star, level: '' | 'light' | 'medium' | 'willow', glitterColor: string, quality: number) {
  if (!level) return;
  if (level === 'light') {
    star.sparkFreq = 400 / quality;
    star.sparkSpeed = 0.3;
    star.sparkLife = 300;
    star.sparkLifeVariation = 2;
  } else if (level === 'medium') {
    star.sparkFreq = 200 / quality;
    star.sparkSpeed = 0.44;
    star.sparkLife = 700;
    star.sparkLifeVariation = 2;
  } else {
    star.sparkFreq = 120 / quality;
    star.sparkSpeed = 0.34;
    star.sparkLife = 1400;
    star.sparkLifeVariation = 3.8;
  }
  star.sparkColor = glitterColor;
  star.sparkTimer = Math.random() * star.sparkFreq;
}

function crossetteEffect(stars: Star[], star: Star) {
  const start = Math.random() * (Math.PI / 2);
  for (let i = 0; i < 4; i += 1) {
    const angle = start + (PI2 / 4) * i + (Math.random() - 0.5) * 0.5;
    stars.push(
      makeStar(star.x, star.y, star.color, angle, Math.random() * 0.6 + 0.75, 600),
    );
  }
}

function crackleEffect(sparks: Spark[], star: Star) {
  for (let i = 0; i < 8; i += 1) {
    spawnSpark(
      sparks,
      star.x,
      star.y,
      FIREWORK_COLORS.Gold,
      Math.random() * PI2,
      Math.random() * 1.4,
      280 + Math.random() * 120,
    );
  }
}

export interface FireworksAudioHooks {
  onLift?: () => void;
  onBurst?: (shell: ShellRecipe) => void;
  onCrackle?: () => void;
  onCrackleSmall?: () => void;
}

export function launchComet(
  comets: Comet[],
  width: number,
  height: number,
  xNorm: number,
  launchHeight: number,
  shell: ShellRecipe,
  quality: number,
  audio?: FireworksAudioHooks,
) {
  const hpad = 60;
  const vpad = 50;
  const minHeight = height - height * 0.45;
  const launchX = xNorm * (width - hpad * 2) + hpad;
  const launchY = height;
  const burstY = minHeight - launchHeight * (minHeight - vpad);
  const launchDistance = launchY - burstY;
  const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);
  const cometColor = typeof shell.color === 'string' ? shell.color : shell.color[0];

  const star = makeStar(launchX, launchY, cometColor, Math.PI, launchVelocity, launchVelocity * 400, 0, 0, true);
  star.sparkFreq = Math.max(8, 32 / quality);
  star.sparkSpeed = 0.6;
  star.sparkLife = 320;
  star.sparkLifeVariation = 3;
  star.sparkColor = cometColor;
  star.sparkTimer = Math.random() * star.sparkFreq;

  comets.push({ star, shell, burstY });
  audio?.onLift?.();
}

export function burstShell(
  stars: Star[],
  sparks: Spark[],
  flashes: BurstFlash[],
  x: number,
  y: number,
  shell: ShellRecipe,
  quality: number,
  audio?: FireworksAudioHooks,
) {
  const speed = shell.spreadSize / 96;
  const standardInitialSpeed = shell.spreadSize / 1800;
  const primary = typeof shell.color === 'string' ? shell.color : shell.color[0];

  const starFactory = (angle: number, speedMult: number, ringSpeed = speedMult * speed) => {
    const life = shell.starLife + Math.random() * shell.starLife * shell.starLifeVariation;
    const star = makeStar(x, y, primary, angle, ringSpeed, life, 0, -standardInitialSpeed);

    if (shell.secondColor) {
      star.transitionTime = life * (Math.random() * 0.05 + 0.32);
      star.secondColor = shell.secondColor;
    }

    applyGlitter(star, shell.glitter, shell.glitterColor, quality);

    if (shell.crossette) {
      star.onDeath = (s) => {
        audio?.onCrackleSmall?.();
        crossetteEffect(stars, s);
      };
    } else if (shell.crackle) {
      star.onDeath = (s) => {
        audio?.onCrackle?.();
        crackleEffect(sparks, s);
      };
    }

    stars.push(star);
  };

  if (shell.ring) {
    const ringCount = shell.starCount;
    const angleInc = PI2 / ringCount;
    for (let i = 0; i < ringCount; i += 1) {
      const angle = angleInc * i + Math.random() * angleInc * 0.25;
      starFactory(angle, 1, speed * (0.92 + Math.random() * 0.08));
    }
  } else {
    createBurst(shell.starCount, (angle, speedMult) => {
      starFactory(angle, speedMult);
    });
  }

  if (Array.isArray(shell.color)) {
    createBurst(Math.floor(shell.starCount * 0.4), (angle, speedMult) => {
      stars.push(
        makeStar(x, y, shell.color[1], angle, speedMult * speed * 0.85, shell.starLife * 0.9, 0, -standardInitialSpeed),
      );
    });
  }

  flashes.push({ x, y, radius: 36 + shell.spreadSize / 18 });
  audio?.onBurst?.(shell);
}

export function updateParticles(
  comets: Comet[],
  stars: Star[],
  sparks: Spark[],
  width: number,
  height: number,
  timeStep: number,
  simSpeed: number,
  flashes: BurstFlash[],
  quality: number,
  audio?: FireworksAudioHooks,
) {
  const speed = simSpeed;
  const starDrag = 1 - (1 - STAR_AIR_DRAG) * speed;
  const starDragHeavy = 1 - (1 - STAR_AIR_DRAG_HEAVY) * speed;
  const sparkDrag = 1 - (1 - SPARK_AIR_DRAG) * speed;
  const gAcc = (timeStep / 1000) * GRAVITY;

  for (let i = comets.length - 1; i >= 0; i -= 1) {
    const comet = comets[i];
    const star = comet.star;
    star.life -= timeStep;
    star.prevX = star.x;
    star.prevY = star.y;
    star.x += star.speedX * speed;
    star.y += star.speedY * speed;
    star.speedX *= starDragHeavy;
    star.speedY *= starDragHeavy;
    star.speedY += gAcc;

    emitStarSparks(star, sparks, timeStep, speed, quality);

    if (star.y <= comet.burstY || star.life <= 0) {
      burstShell(stars, sparks, flashes, star.x, star.y, comet.shell, quality, audio);
      comets.splice(i, 1);
    }
  }

  for (let i = stars.length - 1; i >= 0; i -= 1) {
    const star = stars[i];
    star.life -= timeStep;
    if (star.life <= 0) {
      star.onDeath?.(star);
      stars.splice(i, 1);
      continue;
    }

    const burnRate = Math.pow(star.life / star.fullLife, 0.5);
    const burnRateInverse = 1 - burnRate;

    star.prevX = star.x;
    star.prevY = star.y;
    star.x += star.speedX * speed;
    star.y += star.speedY * speed;

    if (star.heavy) {
      star.speedX *= starDragHeavy;
      star.speedY *= starDragHeavy;
    } else {
      star.speedX *= starDrag;
      star.speedY *= starDrag;
    }
    star.speedY += gAcc;

    emitStarSparks(star, sparks, timeStep, speed, quality, burnRate, burnRateInverse);

    if (star.life < star.transitionTime && star.secondColor && !star.colorChanged) {
      star.colorChanged = true;
      star.color = star.secondColor;
    }

    if (star.y > height + 60 || star.x < -60 || star.x > width + 60) {
      stars.splice(i, 1);
    }
  }

  for (let i = sparks.length - 1; i >= 0; i -= 1) {
    const spark = sparks[i];
    spark.life -= timeStep;
    if (spark.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }
    spark.prevX = spark.x;
    spark.prevY = spark.y;
    spark.x += spark.speedX * speed;
    spark.y += spark.speedY * speed;
    spark.speedX *= sparkDrag;
    spark.speedY *= sparkDrag;
    spark.speedY += gAcc;
  }
}

function emitStarSparks(
  star: Star,
  sparks: Spark[],
  timeStep: number,
  speed: number,
  quality: number,
  burnRate = 1,
  burnRateInverse = 0,
) {
  if (!star.sparkFreq) return;
  star.sparkTimer -= timeStep;
  while (star.sparkTimer < 0) {
    star.sparkTimer += star.sparkFreq * 0.75 + star.sparkFreq * burnRateInverse * 4;
    spawnSpark(
      sparks,
      star.x,
      star.y,
      star.sparkColor,
      Math.random() * PI2,
      Math.random() * star.sparkSpeed * burnRate,
      star.sparkLife * 0.8 + Math.random() * star.sparkLifeVariation * star.sparkLife,
    );
  }
}

export function computeSkyColor(stars: Star[], skyLighting: number): SkyColor {
  if (skyLighting === 0) return { r: 0, g: 0, b: 0 };

  const maxSkySaturation = skyLighting * 15;
  const maxStarCount = 500;
  let total = 0;
  let r = 0;
  let g = 0;
  let b = 0;

  for (const star of stars) {
    const tuple = COLOR_TUPLES[star.color];
    if (!tuple) continue;
    total += 1;
    r += tuple.r;
    g += tuple.g;
    b += tuple.b;
  }

  const intensity = Math.pow(Math.min(1, total / maxStarCount), 0.3);
  const maxC = Math.max(1, r, g, b);
  return {
    r: (r / maxC) * maxSkySaturation * intensity,
    g: (g / maxC) * maxSkySaturation * intensity,
    b: (b / maxC) * maxSkySaturation * intensity,
  };
}

export function lerpSky(current: SkyColor, target: SkyColor, speed: number): SkyColor {
  const k = 10;
  return {
    r: current.r + ((target.r - current.r) / k) * speed,
    g: current.g + ((target.g - current.g) / k) * speed,
    b: current.b + ((target.b - current.b) / k) * speed,
  };
}

export function renderFireworks(
  trailsCtx: CanvasRenderingContext2D,
  mainCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  comets: Comet[],
  stars: Star[],
  sparks: Spark[],
  flashes: BurstFlash[],
  dpr: number,
  scaleFactor: number,
  simSpeed: number,
  longExposure: boolean,
) {
  const scale = dpr * scaleFactor;
  trailsCtx.setTransform(scale, 0, 0, scale, 0, 0);
  mainCtx.setTransform(scale, 0, 0, scale, 0, 0);

  trailsCtx.globalCompositeOperation = 'source-over';
  trailsCtx.fillStyle = longExposure
    ? 'rgba(0, 0, 0, 0.0025)'
    : `rgba(0, 0, 0, ${0.175 * simSpeed})`;
  trailsCtx.fillRect(0, 0, width, height);

  while (flashes.length) {
    const bf = flashes.shift()!;
    const gradient = trailsCtx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.radius);
    gradient.addColorStop(0.024, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.125, 'rgba(255, 160, 20, 0.2)');
    gradient.addColorStop(0.32, 'rgba(255, 140, 20, 0.11)');
    gradient.addColorStop(1, 'rgba(255, 120, 20, 0)');
    trailsCtx.fillStyle = gradient;
    trailsCtx.fillRect(bf.x - bf.radius, bf.y - bf.radius, bf.radius * 2, bf.radius * 2);
  }

  trailsCtx.globalCompositeOperation = 'lighten';
  trailsCtx.lineCap = 'round';

  const starGroups = groupByColor([...comets.map((c) => c.star), ...stars.filter((s) => s.visible)]);
  for (const [color, group] of starGroups) {
    trailsCtx.strokeStyle = color;
    trailsCtx.lineWidth = STAR_DRAW_WIDTH;
    trailsCtx.beginPath();
    for (const star of group) {
      trailsCtx.moveTo(star.x, star.y);
      trailsCtx.lineTo(star.prevX, star.prevY);
    }
    trailsCtx.stroke();
  }

  const sparkGroups = groupSparksByColor(sparks);
  for (const [color, group] of sparkGroups) {
    trailsCtx.strokeStyle = color;
    trailsCtx.lineWidth = SPARK_DRAW_WIDTH;
    trailsCtx.lineCap = 'butt';
    trailsCtx.beginPath();
    for (const spark of group) {
      trailsCtx.moveTo(spark.x, spark.y);
      trailsCtx.lineTo(spark.prevX, spark.prevY);
    }
    trailsCtx.stroke();
  }

  mainCtx.clearRect(0, 0, width, height);
  mainCtx.strokeStyle = '#fff';
  mainCtx.lineWidth = 1;
  mainCtx.beginPath();
  for (const comet of comets) {
    mainCtx.moveTo(comet.star.x, comet.star.y);
    mainCtx.lineTo(comet.star.x - comet.star.speedX * 1.6, comet.star.y - comet.star.speedY * 1.6);
  }
  for (const star of stars) {
    if (!star.visible) continue;
    mainCtx.moveTo(star.x, star.y);
    mainCtx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
  }
  mainCtx.stroke();

  trailsCtx.setTransform(1, 0, 0, 1, 0, 0);
  mainCtx.setTransform(1, 0, 0, 1, 0, 0);
}

function groupByColor(stars: Star[]) {
  const map = new Map<string, Star[]>();
  for (const star of stars) {
    const list = map.get(star.color) ?? [];
    list.push(star);
    map.set(star.color, list);
  }
  return map;
}

function groupSparksByColor(sparks: Spark[]) {
  const map = new Map<string, Spark[]>();
  for (const spark of sparks) {
    const list = map.get(spark.color) ?? [];
    list.push(spark);
    map.set(spark.color, list);
  }
  return map;
}

export function fitShellPositionH(position: number) {
  const edge = 0.18;
  return (1 - edge * 2) * position + edge;
}

export function fitShellPositionV(position: number) {
  return position * 0.75;
}

export function getRandomShellSize(baseSize: number) {
  const maxVariance = Math.min(2.5, baseSize);
  const variance = Math.random() * maxVariance;
  const size = Math.max(0.5, baseSize - variance);
  const height = maxVariance === 0 ? Math.random() : 1 - variance / maxVariance;
  const centerOffset = Math.random() * (1 - height * 0.65) * 0.5;
  const x = Math.random() < 0.5 ? 0.5 - centerOffset : 0.5 + centerOffset;
  return { size, x: fitShellPositionH(x), height: fitShellPositionV(height) };
}

export function launchAtPointer(
  comets: Comet[],
  width: number,
  height: number,
  x: number,
  y: number,
  config: FireworksConfig,
  audio?: FireworksAudioHooks,
) {
  const shell = resolveShell(config.shellType, config.shellSize);
  launchComet(
    comets,
    width,
    height,
    fitShellPositionH(x / width),
    1 - y / height,
    shell,
    config.quality,
    audio,
  );
}

export function autoLaunchTick(
  comets: Comet[],
  width: number,
  height: number,
  config: FireworksConfig,
  audio?: FireworksAudioHooks,
): number {
  const { size, x, height: h } = getRandomShellSize(config.shellSize);
  const shell = resolveShell(config.shellType, size);
  launchComet(comets, width, height, x, h, shell, config.quality, audio);
  return 900 + Math.random() * 600 + shell.starLife;
}

export function seqTwoRandom(
  comets: Comet[],
  width: number,
  height: number,
  config: FireworksConfig,
  schedule: (fn: () => void, ms: number) => void,
  audio?: FireworksAudioHooks,
): number {
  const s1 = getRandomShellSize(config.shellSize);
  const s2 = getRandomShellSize(config.shellSize);
  launchComet(comets, width, height, s1.x - 0.08, s1.height, resolveShell(config.shellType, s1.size), config.quality, audio);
  schedule(() => {
    launchComet(comets, width, height, s2.x + 0.08, s2.height, resolveShell(config.shellType, s2.size), config.quality, audio);
  }, 100);
  return 1200 + Math.random() * 800;
}

export function seqTriple(
  comets: Comet[],
  width: number,
  height: number,
  config: FireworksConfig,
  schedule: (fn: () => void, ms: number) => void,
  audio?: FireworksAudioHooks,
): number {
  const base = config.shellSize;
  const small = Math.max(0.5, base - 1.25);
  launchComet(comets, width, height, 0.5, 0.7, resolveShell(config.shellType, base), config.quality, audio);
  schedule(() => {
    launchComet(comets, width, height, 0.2, 0.1, resolveShell(config.shellType, small), config.quality, audio);
  }, 900 + Math.random() * 300);
  schedule(() => {
    launchComet(comets, width, height, 0.8, 0.1, resolveShell(config.shellType, small), config.quality, audio);
  }, 1400 + Math.random() * 400);
  return 4000;
}

const FINALE_BURST_COUNT = 32;

export function nextAutoSequence(
  comets: Comet[],
  width: number,
  height: number,
  config: FireworksConfig,
  schedule: (fn: () => void, ms: number) => void,
  audio: FireworksAudioHooks | undefined,
  finaleCounter: { count: number },
): number {
  if (config.finaleMode && config.autoLaunch) {
    autoLaunchTick(comets, width, height, config, audio);
    if (finaleCounter.count < FINALE_BURST_COUNT) {
      finaleCounter.count += 1;
      return 170;
    }
    finaleCounter.count = 0;
    return 6000;
  }

  const rand = Math.random();
  if (rand < 0.12) return seqTriple(comets, width, height, config, schedule, audio);
  if (rand < 0.5) return seqTwoRandom(comets, width, height, config, schedule, audio);
  return autoLaunchTick(comets, width, height, config, audio);
}

export function pickShell(size: number): ShellRecipe {
  const r = Math.random();
  if (r < 0.35) return crysanthemumShell(size);
  if (r < 0.48) return crossetteShell(size);
  if (r < 0.62) return crackleShell(size);
  if (r < 0.75) return strobeShell(size);
  if (r < 0.88) return ringShell(size);
  return willowShell(size);
}
