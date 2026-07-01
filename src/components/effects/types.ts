export type EffectId = 'fireworks' | 'rain-window';

export interface EffectItem {
  id: EffectId;
  labelKey: string;
  descKey: string;
  hintKey?: string;
  fullscreenPath?: string;
}
