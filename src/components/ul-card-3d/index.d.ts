import type { HTMLAttributes, ReactNode } from 'react';

export type UlCard3dSocialType = 'instagram' | 'twitter' | 'discord';

export interface IUlCard3dSocialAction {
  type?: UlCard3dSocialType;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export type UlCard3dVariant = 'default' | 'ai';

export interface IUlCard3dProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  text?: ReactNode;
  viewMoreLabel?: ReactNode;
  onViewMore?: () => void;
  socialActions?: IUlCard3dSocialAction[];
  variant?: UlCard3dVariant;
  logoIcon?: ReactNode;
}
