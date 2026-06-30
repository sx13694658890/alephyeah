export interface SoundSettings {
  enabled: boolean;
  /** 主音量倍率 0–2，默认 1.5 比参考 Demo 更响 */
  volume: number;
}

export const DEFAULT_SOUND: SoundSettings = {
  enabled: true,
  volume: 1.5,
};

const BASE_URL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/';

type SoundType = 'lift' | 'burst' | 'burstSmall' | 'crackle' | 'crackleSmall';

interface SoundSource {
  volume: number;
  playbackRateMin: number;
  playbackRateMax: number;
  fileNames: string[];
  buffers?: AudioBuffer[];
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomChoice<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export class FireworksSoundManager {
  private ctx: AudioContext | null = null;
  private settings: SoundSettings = { ...DEFAULT_SOUND };
  private sources: Record<SoundType, SoundSource> = {
    lift: {
      volume: 1.2,
      playbackRateMin: 0.85,
      playbackRateMax: 0.95,
      fileNames: ['lift1.mp3', 'lift2.mp3', 'lift3.mp3'],
    },
    burst: {
      volume: 1.35,
      playbackRateMin: 0.8,
      playbackRateMax: 0.9,
      fileNames: ['burst1.mp3', 'burst2.mp3'],
    },
    burstSmall: {
      volume: 0.45,
      playbackRateMin: 0.8,
      playbackRateMax: 1,
      fileNames: ['burst-sm-1.mp3', 'burst-sm-2.mp3'],
    },
    crackle: {
      volume: 0.55,
      playbackRateMin: 1,
      playbackRateMax: 1,
      fileNames: ['crackle1.mp3'],
    },
    crackleSmall: {
      volume: 0.65,
      playbackRateMin: 1,
      playbackRateMax: 1,
      fileNames: ['crackle-sm-1.mp3'],
    },
  };

  private loaded = false;
  private loading: Promise<void> | null = null;
  private lastSmallBurst = 0;
  private paused = false;

  updateSettings(next: Partial<SoundSettings>) {
    this.settings = { ...this.settings, ...next };
  }

  getSettings() {
    return this.settings;
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (!this.ctx) return;
    if (paused) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  private ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    return this.ctx;
  }

  async unlock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
    this.play('lift', 0);
    window.setTimeout(() => void ctx.resume(), 200);
  }

  preload() {
    if (this.loaded) return Promise.resolve();
    if (this.loading) return this.loading;

    this.loading = (async () => {
      const ctx = this.ensureContext();
      if (!ctx) return;

      const tasks: Promise<void>[] = [];
      (Object.keys(this.sources) as SoundType[]).forEach((type) => {
        const source = this.sources[type];
        source.buffers = [];
        source.fileNames.forEach((fileName) => {
          tasks.push(
            fetch(`${BASE_URL}${fileName}`)
              .then((res) => {
                if (!res.ok) throw new Error(res.statusText);
                return res.arrayBuffer();
              })
              .then((data) => new Promise<AudioBuffer>((resolve, reject) => {
                ctx.decodeAudioData(data, resolve, reject);
              }))
              .then((buffer) => {
                source.buffers!.push(buffer);
              }),
          );
        });
      });

      await Promise.allSettled(tasks);
      this.loaded = true;
    })();

    return this.loading;
  }

  play(type: SoundType, scale = 1) {
    if (!this.settings.enabled || this.paused) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;

    scale = clamp(scale, 0, 1);
    if (scale <= 0) return;

    if (type === 'burstSmall') {
      const now = Date.now();
      if (now - this.lastSmallBurst < 20) return;
      this.lastSmallBurst = now;
    }

    const source = this.sources[type];
    if (!source.buffers?.length) return;

    const master = clamp(this.settings.volume, 0, 2);
    const gainNode = ctx.createGain();
    gainNode.gain.value = source.volume * scale * master;

    const buffer = randomChoice(source.buffers);
    const bufferSource = ctx.createBufferSource();
    const rate = randomBetween(source.playbackRateMin, source.playbackRateMax) * (2 - scale);
    bufferSource.playbackRate.value = rate;
    bufferSource.buffer = buffer;
    bufferSource.connect(gainNode);
    gainNode.connect(ctx.destination);
    bufferSource.start(0);
  }

  playLift() {
    this.play('lift');
  }

  playBurst(shellSpread = 300) {
    const scale = clamp(shellSpread / 500, 0.35, 1);
    this.play('burst', scale);
  }

  playCrackle() {
    this.play('crackle');
  }

  playCrackleSmall() {
    this.play('crackleSmall');
  }
}

export const fireworksSound = new FireworksSoundManager();
