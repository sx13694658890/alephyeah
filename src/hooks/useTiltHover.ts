import type { MouseEvent, RefObject } from 'react';
import { useCallback, useRef } from 'react';

interface UseTiltHoverOptions {
  maxTilt?: number;
  scale?: number;
}

export const useTiltHover = <T extends HTMLElement>({
  maxTilt = 6,
  scale = 1.02,
}: UseTiltHoverOptions = {}) => {
  const ref = useRef<T>(null);

  const onMouseMove = useCallback(
    (e: MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      el.style.transform = `perspective(800px) rotateX(${-y * maxTilt}deg) rotateY(${x * maxTilt}deg) scale(${scale}) translateY(-4px)`;
    },
    [maxTilt, scale]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)';
  }, []);

  return { ref, onMouseMove, onMouseLeave };
};
