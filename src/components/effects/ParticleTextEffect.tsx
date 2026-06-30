import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Dot {
  x: number;
  y: number;
  tx: number;
  ty: number;
  size: number;
  hue: number;
}

const TEXT = 'alephyeah';
const PARTICLE_COUNT = 720;

function sampleTextTargets(width: number, height: number): { x: number; y: number }[] {
  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const ctx = off.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.min(width / (TEXT.length * 0.55), height * 0.35);
  ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.fillText(TEXT, width / 2, height / 2);

  const data = ctx.getImageData(0, 0, width, height).data;
  const points: { x: number; y: number }[] = [];
  const step = Math.max(4, Math.floor(fontSize / 8));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 128) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

export const ParticleTextEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const morphRef = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targets = sampleTextTargets(rect.width, rect.height);
      const dots: Dot[] = [];

      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const target = targets[i % targets.length] ?? { x: rect.width / 2, y: rect.height / 2 };
        dots.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          tx: target.x,
          ty: target.y,
          size: 1.2 + Math.random() * 1.8,
          hue: 0.08 + Math.random() * 0.12,
        });
      }
      dotsRef.current = dots;
      morphRef.current = 0;

      const morphState = { value: 0 };
      animate(morphState, {
        value: 1,
        ease: 'outExpo',
        duration: 2200,
        delay: 200,
        onUpdate: () => {
          morphRef.current = morphState.value;
        },
      });
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!running) return;
      raf = requestAnimationFrame(draw);

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const t = morphRef.current;

      for (const dot of dotsRef.current) {
        const x = dot.x + (dot.tx - dot.x) * t;
        const y = dot.y + (dot.ty - dot.y) * t;
        const pulse = 0.65 + Math.sin((x + y) * 0.02 + t * 6) * 0.15;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${dot.hue * 360}, 72%, 68%, ${0.35 + pulse * 0.45})`;
        ctx.arc(x, y, dot.size * (0.6 + pulse * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-foreground/50">
        已启用减少动效，粒子文字预览已禁用
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full touch-none"
      aria-label="粒子文字特效"
    />
  );
};
