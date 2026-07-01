import { FireworksCanvas } from './FireworksCanvas';
import { DEFAULT_CONFIG } from '../../lib/fireworks/canvasEngine';
import { DEFAULT_SOUND } from '../../lib/fireworks/soundManager';

/** About 页内嵌预览：与 88lin fireworks 参考 Demo 相同的 Canvas 2D 引擎 */
const PREVIEW_CONFIG = {
  ...DEFAULT_CONFIG,
  autoLaunch: true,
  shellType: 'random' as const,
  quality: 2 as const,
  scaleFactor: 0.88 as const,
  skyLighting: 2 as const,
};

const PREVIEW_SOUND = {
  ...DEFAULT_SOUND,
  enabled: false,
  volume: 0,
};

export const FireworksPreview = () => (
  <FireworksCanvas
    className="absolute inset-0 h-full w-full touch-none"
    config={PREVIEW_CONFIG}
    sound={PREVIEW_SOUND}
    simSpeed={0.82}
  />
);
