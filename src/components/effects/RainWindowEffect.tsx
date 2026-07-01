import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { RainWindowScene } from './RainWindowScene';

interface RainWindowEffectProps {
  paused?: boolean;
  className?: string;
}

export const RainWindowEffect = ({ paused = false, className }: RainWindowEffectProps) => {
  const reducedMotion = useReducedMotion();
  const dpr = useMemo(() => (typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 1.5), []);

  if (reducedMotion) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-foreground/50">
        已启用减少动效，窗户雨预览已禁用
      </div>
    );
  }

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: false, alpha: false }}
      className={className ?? 'h-full w-full touch-none'}
    >
      <RainWindowScene paused={paused} />
    </Canvas>
  );
};
