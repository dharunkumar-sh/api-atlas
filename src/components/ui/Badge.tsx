import React, { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import type { BadgeVariant } from '@/types/ui';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#142034] text-[#F4F7FB] border-[#224870]',
  secondary: 'bg-[#0E1726] text-[#9BB0CC] border-[#224870]/60',
  outline: 'bg-transparent text-[#9BB0CC] border-[#224870]',
  success: 'bg-[#0B252C] text-[#44CFCB] border-[#44CFCB]/40',
  warning: 'bg-[#291F0C] text-[#FBBF24] border-[#D97706]/40',
  danger: 'bg-[#2D121B] text-[#FB7185] border-[#E11D48]/40',
  info: 'bg-[#1F365C]/80 text-[#4EA5D9] border-[#4EA5D9]/40',

  // Crisp HTTP Method Badges aligned with Blue-Cyan palette
  get: 'bg-[#0B252C] text-[#44CFCB] border-[#44CFCB]/40 font-mono font-bold tracking-wider',
  post: 'bg-[#132B45] text-[#4EA5D9] border-[#4EA5D9]/40 font-mono font-bold tracking-wider',
  put: 'bg-[#291F0C] text-[#FBBF24] border-[#D97706]/40 font-mono font-bold tracking-wider',
  patch: 'bg-[#1F2544] text-[#A5B4FC] border-[#6366F1]/40 font-mono font-bold tracking-wider',
  delete: 'bg-[#2D121B] text-[#FB7185] border-[#E11D48]/40 font-mono font-bold tracking-wider',
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium border select-none transition-colors leading-none',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
