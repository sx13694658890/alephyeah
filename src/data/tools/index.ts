import { Apple, MapPin } from 'lucide-react';
import type { ComponentType } from 'react';

export interface ToolDefinition {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  category: string;
}

export const tools: ToolDefinition[] = [
  {
    id: 'us-address',
    title: 'US Address Generator',
    titleZh: '美国地址生成器',
    description: 'Generate random US addresses with names, phone numbers, and ZIP codes.',
    descriptionZh: '随机生成美国地址、姓名、电话和邮编，支持免税州地址。',
    icon: MapPin,
    href: '/tools/us-address',
    category: 'generator',
  },
  {
    id: 'apple-id-shared',
    title: 'Shared US Apple ID',
    titleZh: '美区 Apple ID 共享',
    description: 'Browse live shared US Apple IDs with App Store switch guide and FAQ.',
    descriptionZh: '实时共享美区 Apple ID，含 App Store 切换教程与常见问题。',
    icon: Apple,
    href: '/tools/apple-id-shared',
    category: 'account',
  },
];

export const toolsNavLabel = { en: 'Tools', zh: '工具' };
