import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import React from 'react';

import { UlLiquidGlass } from './index';

const meta = {
  title: 'ultra-design-ui/UlLiquidGlass',
  component: UlLiquidGlass,
  args: {
    children: 'Liquid Glass',
    className: 'rounded-xl px-6 py-3 font-medium text-foreground',
    optics: {
      frost: 8,
      strength: 0.35,
    },
  },
  decorators: [
    (Story) =>
      React.createElement(
        'div',
        {
          className:
            'relative flex min-h-52 w-full max-w-md items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-01 via-brand-02 to-brand-04 p-10',
        },
        React.createElement('div', {
          'aria-hidden': true,
          className: 'pointer-events-none absolute inset-0 opacity-40',
          style: {
            backgroundImage:
              'radial-gradient(circle at 20% 30%, var(--color-brand-01) 0%, transparent 45%), radial-gradient(circle at 80% 70%, var(--color-brand-05) 0%, transparent 50%)',
          },
        }),
        React.createElement(Story),
      ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Apple 风格液态玻璃透镜。默认 material 模式会在支持 backdrop-filter 的浏览器上 frosted 并折射背后内容。',
      },
    },
  },
} satisfies Meta<typeof UlLiquidGlass>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  name: '基本',
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Liquid Glass')).toBeInTheDocument();
  },
};
