import { useCallback, useEffect, useRef, useState } from 'react';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import {
  type BurstFlash,
  type Comet,
  type FireworksAudioHooks,
  type FireworksConfig,
  type SkyColor,
  type Spark,
  type Star,
  DEFAULT_CONFIG,
  computeSkyColor,
  launchAtPointer,
  launchComet,
  lerpSky,
  nextAutoSequence,
  renderFireworks,
  resolveShell,
  updateParticles,
  SEQUENCE_GAP,
} from '../../lib/fireworks/canvasEngine';
import { type SoundSettings, DEFAULT_SOUND, fireworksSound } from '../../lib/fireworks/soundManager';

interface FireworksCanvasProps {
  fullscreen?: boolean;
  className?: string;
  paused?: boolean;
  config?: FireworksConfig;
  sound?: SoundSettings;
  onSkyColor?: (color: SkyColor) => void;
  simSpeed?: number;
  onSimSpeedChange?: (speed: number) => void;
}

export const FireworksCanvas = ({
  fullscreen = false,
  className,
  paused = false,
  config = DEFAULT_CONFIG,
  sound = DEFAULT_SOUND,
  onSkyColor,
  simSpeed = 1,
  onSimSpeedChange,
}: FireworksCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLCanvasElement>(null);
  const mainRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const skyRef = useRef<SkyColor>({ r: 0, g: 0, b: 0 });
  const [speedBarOpacity, setSpeedBarOpacity] = useState(0);

  const pausedRef = useRef(paused);
  const configRef = useRef(config);
  const soundRef = useRef(sound);
  const simSpeedRef = useRef(simSpeed);
  const draggingSpeedRef = useRef(false);

  pausedRef.current = paused;
  configRef.current = config;
  soundRef.current = sound;
  simSpeedRef.current = simSpeed;

  useEffect(() => {
    fireworksSound.updateSettings(sound);
  }, [sound]);

  useEffect(() => {
    fireworksSound.setPaused(paused);
  }, [paused]);

  useEffect(() => {
    if (reducedMotion) return;
    void fireworksSound.preload();
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const container = containerRef.current;
    const trailsCanvas = trailsRef.current;
    const mainCanvas = mainRef.current;
    if (!container || !trailsCanvas || !mainCanvas) return;

    const trailsCtx = trailsCanvas.getContext('2d');
    const mainCtx = mainCanvas.getContext('2d');
    if (!trailsCtx || !mainCtx) return;

    const comets: Comet[] = [];
    const stars: Star[] = [];
    const sparks: Spark[] = [];
    const flashes: BurstFlash[] = [];
    const finaleCounter = { count: 0 };

    const audio: FireworksAudioHooks = {
      onLift: () => fireworksSound.playLift(),
      onBurst: (shell) => fireworksSound.playBurst((shell.soundScale ?? 1) * shell.spreadSize),
      onCrackle: () => fireworksSound.playCrackle(),
      onCrackleSmall: () => fireworksSound.playCrackleSmall(),
    };

    let width = 0;
    let height = 0;
    let stageW = 0;
    let stageH = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let autoTimer = 3200;
    let running = true;
    const pendingTimers: number[] = [];

    const resize = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      const sf = configRef.current.scaleFactor;
      stageW = width / sf;
      stageH = height / sf;
      trailsCanvas.width = width * dpr;
      trailsCanvas.height = height * dpr;
      mainCanvas.width = width * dpr;
      mainCanvas.height = height * dpr;
      trailsCanvas.style.width = `${width}px`;
      trailsCanvas.style.height = `${height}px`;
      mainCanvas.style.width = `${width}px`;
      mainCanvas.style.height = `${height}px`;
    };

    const schedule = (fn: () => void, ms: number) => {
      pendingTimers.push(
        window.setTimeout(() => {
          if (running) fn();
        }, ms),
      );
    };

    const launchBurst = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const sf = configRef.current.scaleFactor;
      launchAtPointer(
        comets,
        stageW,
        stageH,
        (clientX - rect.left) / sf,
        (clientY - rect.top) / sf,
        configRef.current,
        audio,
      );
    };

    const updateSpeedFromEvent = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const y = clientY - rect.top;
      if (y < rect.height - 44) return false;
      const edge = 16;
      const next = Math.min(Math.max((clientX - rect.left - edge) / (rect.width - edge * 2), 0), 1);
      onSimSpeedChange?.(next);
      setSpeedBarOpacity(1);
      return true;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (updateSpeedFromEvent(event.clientX, event.clientY)) {
        draggingSpeedRef.current = true;
        return;
      }
      if (!pausedRef.current) {
        void fireworksSound.unlock();
        launchBurst(event.clientX, event.clientY);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (draggingSpeedRef.current) updateSpeedFromEvent(event.clientX, event.clientY);
    };

    const onPointerUp = () => {
      draggingSpeedRef.current = false;
    };

    const tick = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 32);
      last = now;

      if (!pausedRef.current) {
        const cfg = configRef.current;
        const speed = simSpeedRef.current;

        if (cfg.autoLaunch) {
          autoTimer -= dt * speed;
          if (autoTimer <= 0) {
            autoTimer = nextAutoSequence(comets, stageW, stageH, cfg, schedule, audio, finaleCounter) * SEQUENCE_GAP;
          }
        }

        updateParticles(comets, stars, sparks, stageW, stageH, dt * speed, speed, flashes, cfg.quality, audio);
        renderFireworks(
          trailsCtx,
          mainCtx,
          stageW,
          stageH,
          comets,
          stars,
          sparks,
          flashes,
          dpr,
          cfg.scaleFactor,
          speed,
          cfg.longExposure,
          cfg.quality,
        );

        const targetSky = computeSkyColor(stars, cfg.skyLighting);
        skyRef.current = lerpSky(skyRef.current, targetSky, speed);
        onSkyColor?.(skyRef.current);
      }

      if (!draggingSpeedRef.current) {
        setSpeedBarOpacity((prev) => Math.max(0, prev - dt / 500));
      }
    };

    resize();
    const cfg = configRef.current;
    void fireworksSound.unlock();
    launchComet(comets, stageW, stageH, 0.5, 0.5, resolveShell(cfg.shellType, cfg.shellSize), cfg.quality, audio);

    window.addEventListener('resize', resize);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      pendingTimers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('resize', resize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
    };
  }, [reducedMotion, onSkyColor, onSimSpeedChange]);

  if (reducedMotion) {
    return (
      <div className="flex h-full items-center justify-center bg-black px-6 text-center text-sm text-white/50">
        已启用减少动效，烟花预览已禁用
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className ?? (fullscreen ? 'fixed inset-0 touch-none' : 'relative h-full w-full touch-none')}
    >
      <canvas ref={trailsRef} className="absolute inset-0 h-full w-full mix-blend-lighten" aria-hidden />
      <canvas ref={mainRef} className="absolute inset-0 h-full w-full mix-blend-lighten" aria-hidden />
      {speedBarOpacity > 0.01 ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-white/10"
          style={{ opacity: speedBarOpacity }}
        >
          <div className="h-full bg-[#1e7fff]" style={{ width: `${simSpeed * 100}%` }} />
        </div>
      ) : null}
    </div>
  );
};

export const useFireworksConfig = () => {
  const [config, setConfig] = useState<FireworksConfig>(() => ({ ...DEFAULT_CONFIG }));
  const updateConfig = useCallback((patch: Partial<FireworksConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);
  return { config, updateConfig };
};

export const useFireworksSound = () => {
  const [sound, setSound] = useState<SoundSettings>(() => ({ ...DEFAULT_SOUND }));
  const updateSound = useCallback((patch: Partial<SoundSettings>) => {
    setSound((prev) => ({ ...prev, ...patch }));
  }, []);
  const toggleSound = useCallback(async () => {
    const next = !sound.enabled;
    setSound((prev) => ({ ...prev, enabled: next }));
    if (next) await fireworksSound.unlock();
  }, [sound.enabled]);
  return { sound, updateSound, toggleSound };
};
