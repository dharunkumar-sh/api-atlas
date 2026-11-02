import React, { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string | ReactNode;
  description?: string | ReactNode;
  align?: 'left' | 'center';
  actions?: ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  actions,
  className,
}) => {
  const isCenter = align === 'center';

  return (
    <div
      className={cn(
        'space-y-3.5',
        isCenter ? 'text-center mx-auto max-w-3xl flex flex-col items-center' : 'text-left max-w-2xl',
        className
      )}
    >
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#224870] bg-[#142034] text-[#4EA5D9] text-xs font-mono font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#44CFCB]" />
          <span>{eyebrow}</span>
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#F4F7FB] leading-tight">
        {title}
      </h2>

      {description && (
        <p className="text-sm sm:text-base text-[#9BB0CC] leading-relaxed max-w-2xl">
          {description}
        </p>
      )}

      {actions && <div className="pt-2 flex items-center gap-3">{actions}</div>}
    </div>
  );
};
