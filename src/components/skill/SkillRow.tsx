import { memo } from 'react';

import type { TechItem } from '@/data/tech';

import { TechIcon } from './TechIcon';

type SkillRowProps = {
  skills: TechItem[];
  direction: 'left' | 'right';
};

export const SkillRow = memo(({ skills, direction }: SkillRowProps) => (
  <div className="overflow-hidden">
    <div
      className={`flex w-max gap-4 will-change-transform ${
        direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
      }`}
    >
      {[...skills, ...skills].map((skill, index) => (
        <span
          key={`${skill.name}-${index}`}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-dashed border-border/70 bg-card px-4 py-1 text-foreground"
        >
          <TechIcon item={skill} className="h-4 w-4" />
          {skill.name}
        </span>
      ))}
    </div>
  </div>
));

SkillRow.displayName = 'SkillRow';
