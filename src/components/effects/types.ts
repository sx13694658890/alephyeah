export type EffectId = 'fireworks-2d' | 'fireworks-3d' | 'particle-text';

export interface EffectItem {
  id: EffectId;
  labelKey: string;
  descKey: string;
}
