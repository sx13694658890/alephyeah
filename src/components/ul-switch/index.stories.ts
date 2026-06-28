import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent } from 'storybook/test';

import { UlSwitch } from './index';

const meta = {
  title: 'ultra-design-ui/UlSwitch',
  component: UlSwitch,
  args: {
    defaultChecked: false,
    toggleSize: 30,
    'aria-label': '主题开关',
  },
  argTypes: {
    toggleSize: {
      control: { type: 'range', min: 20, max: 48, step: 2 },
    },
    onChange: { action: 'changed' },
  },
  parameters: {
    docs: {
      description: {
        component:
          '昼夜主题风格开关，带太阳/月亮、云朵与星星动画。支持受控与非受控模式，可通过 `toggleSize` 调整整体尺寸。',
      },
    },
  },
} satisfies Meta<typeof UlSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  name: '基本',
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('switch', { name: '主题开关' });
    await expect(toggle).toBeInTheDocument();
    await expect(toggle).not.toBeChecked();
  },
};