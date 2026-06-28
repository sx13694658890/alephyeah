import type { CSSProperties } from 'react';

export interface IUlSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** 仅展示，不响应点击（由外层按钮处理） */
  readOnly?: boolean;
  /** 三态主题外观（readOnly 时优先于 checked） */
  appearance?: 'light' | 'system' | 'dark';
  /** 无障碍标签 */
  'aria-label'?: string;
  /** 开关整体缩放，对应 CSS 变量 --toggle-size（px） */
  toggleSize?: number;
  className?: string;
  style?: CSSProperties;
}
