export interface SoundSettings {
  enabled: boolean;
  /** 主音量倍率 0–1.5 */
  volume: number;
}

export const DEFAULT_SOUND: SoundSettings = {
  enabled: true,
  volume: 0.85,
};

const BASE_URL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/';

type SoundType = 'lift' | 'burst' | 'burstSmall' | 'crackle' | 'crackleSmall';

interface SoundSource {
  volume: number;
  playbackRateMin: number;
  playbackRateMax: number;
  fileNames: string[];
  buffers: AudioBuffer[];
}

interface PendingPlay {
  type: SoundType;
  scale: number;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function randomChoice<T>(items: T[]): T | undefined {
  if (!items.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

/** 爆发类音效低通截止频率，削弱刺耳高频 */
const TONE_FILTER_HZ: Partial<Record<SoundType, number>> = {
  lift: 3200,
  burst: 2600,
  burstSmall: 4200,
  crackle: 3800,
  crackleSmall: 4800,
};

const THROTTLE_MS: Record<SoundType, number> = {
  lift: 220,
  burst: 180,
  burstSmall: 72,
  crackle: 140,
  crackleSmall: 72,
};

const MAX_CONCURRENT = 3;

export class FireworksSoundManager {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private settings: SoundSettings = { ...DEFAULT_SOUND };

  private sources: Record<SoundType, SoundSource> = {
    lift: {
      volume: 0.42,
      playbackRateMin: 0.82,
      playbackRateMax: 0.92,
      fileNames: ['lift1.mp3', 'lift2.mp3', 'lift3.mp3'],
      buffers: [],
    },
    burst: {
      volume: 0.38,
      playbackRateMin: 0.76,
      playbackRateMax: 0.86,
      fileNames: ['burst1.mp3', 'burst2.mp3'],
      buffers: [],
    },
    burstSmall: {
      volume: 0.12,
      playbackRateMin: 0.8,
      playbackRateMax: 0.92,
      fileNames: ['burst-sm-1.mp3', 'burst-sm-2.mp3'],
      buffers: [],
    },
    crackle: {
      volume: 0.1,
      playbackRateMin: 0.92,
      playbackRateMax: 0.98,
      fileNames: ['crackle1.mp3'],
      buffers: [],
    },
    crackleSmall: {
      volume: 0.12,
      playbackRateMin: 0.92,
      playbackRateMax: 0.98,
      fileNames: ['crackle-sm-1.mp3'],
      buffers: [],
    },
  };

  private loaded = false;
  private loading: Promise<void> | null = null;
  private unlocked = false;
  private paused = false;
  private pending: PendingPlay[] = [];
  private lastPlayed: Partial<Record<SoundType, number>> = {};
  private activeVoices = 0;

  updateSettings(next: Partial<SoundSettings>) {
    this.settings = { ...this.settings, ...next };
  }

  getSettings() {
    return this.settings;
  }

  isUnlocked() {
    return this.unlocked;
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (!this.ctx) return;
    if (paused) void this.ctx.suspend();
    else void this.resumeContext();
  }

  private ensureContext() {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    return this.ctx;
  }

  private getCompressor(ctx: AudioContext) {
    if (!this.compressor) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -32;
      comp.knee.value = 24;
      comp.ratio.value = 2.2;
      comp.attack.value = 0.006;
      comp.release.value = 0.28;
      comp.connect(ctx.destination);
      this.compressor = comp;
    }
    return this.compressor;
  }

  private async resumeContext() {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return false;
      }
    }
    return ctx.state === 'running';
  }

  async unlock() {
    this.unlocked = true;
    const ok = await this.resumeContext();
    await this.preload();
    this.play('lift', 0);
    window.setTimeout(() => void this.resumeContext(), 250);
    this.flushPending();
    return ok;
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
        source.fileNames.forEach((fileName) => {
          tasks.push(
            fetch(`${BASE_URL}${fileName}`)
              .then((res) => {
                if (!res.ok) throw new Error(res.statusText);
                return res.arrayBuffer();
              })
              .then(
                (data) =>
                  new Promise<AudioBuffer>((resolve, reject) => {
                    ctx.decodeAudioData(data, resolve, reject);
                  }),
              )
              .then((buffer) => {
                source.buffers.push(buffer);
              })
              .catch(() => undefined),
          );
        });
      });

      await Promise.allSettled(tasks);
      this.loaded = sourceHasBuffers(this.sources);
    })();

    return this.loading;
  }

  play(type: SoundType, scale = 1) {
    if (!this.settings.enabled || this.paused) return;
    void this.playInternal(type, scale);
  }

  private shouldThrottle(type: SoundType, now: number) {
    const base = THROTTLE_MS[type];
    const adaptive = base + this.activeVoices * (type === 'lift' ? 90 : 45);
    const last = this.lastPlayed[type] ?? 0;
    if (now - last < adaptive) return true;
    this.lastPlayed[type] = now;
    return false;
  }

  private async playInternal(type: SoundType, scale: number) {
    if (!this.unlocked) {
      this.pending.push({ type, scale });
      return;
    }

    await this.preload();
    const running = await this.resumeContext();
    if (!running) {
      this.pending.push({ type, scale });
      return;
    }

    scale = clamp(scale, 0, 1);
    if (scale <= 0) return;

    const now = Date.now();
    if (this.shouldThrottle(type, now)) return;
    if (this.activeVoices >= MAX_CONCURRENT) return;

    const source = this.sources[type];
    if (!source.buffers.length) return;

    const ctx = this.ctx!;
    const buffer = randomChoice(source.buffers);
    if (!buffer) return;

    const playbackRate =
      randomBetween(source.playbackRateMin, source.playbackRateMax) * (1.55 - scale * 0.45);
    const duration = buffer.duration / playbackRate;

    const master = clamp(this.settings.volume, 0, 1.5);
    let peakGain = source.volume * scale * master;
    if (type === 'burst') peakGain *= 0.82;
    if (this.activeVoices > 0) {
      peakGain *= 1 / (1 + this.activeVoices * 0.55);
    }
    peakGain = Math.min(peakGain, 0.48);

    const bufferSource = ctx.createBufferSource();
    bufferSource.playbackRate.value = playbackRate;
    bufferSource.buffer = buffer;

    const gainNode = ctx.createGain();
    const t0 = ctx.currentTime;
    const attack = type === 'burst' ? 0.018 : 0.014;
    gainNode.gain.setValueAtTime(0.0001, t0);
    gainNode.gain.linearRampToValueAtTime(Math.max(peakGain, 0.0001), t0 + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + duration + 0.06);

    let tail: AudioNode = gainNode;
    const cutoff = TONE_FILTER_HZ[type];
    if (cutoff) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = cutoff;
      filter.Q.value = 0.45;
      gainNode.connect(filter);
      tail = filter;
    }

    bufferSource.connect(gainNode);
    tail.connect(this.getCompressor(ctx));

    this.activeVoices += 1;
    bufferSource.onended = () => {
      this.activeVoices = Math.max(0, this.activeVoices - 1);
    };

    bufferSource.start(0);
  }

  private flushPending() {
    const queue = [...this.pending];
    this.pending = [];
    queue.forEach(({ type, scale }) => this.play(type, scale));
  }

  playLift() {
    this.play('lift', 0.55);
  }

  playBurst(shellSpread = 300) {
    const scale = clamp(shellSpread / 650, 0.18, 0.58);
    this.play('burst', scale);
  }

  playCrackle() {
    this.play('crackle', 0.45);
  }

  playCrackleSmall() {
    this.play('crackleSmall', 0.35);
  }
}

function sourceHasBuffers(sources: Record<SoundType, SoundSource>) {
  return (Object.keys(sources) as SoundType[]).some((key) => sources[key].buffers.length > 0);
}

export const fireworksSound = new FireworksSoundManager();
