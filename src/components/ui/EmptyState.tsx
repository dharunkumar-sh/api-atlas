import React, { type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { FolderGit2 } from 'lucide-react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-[#224870]/60 bg-[#0E1726]/40',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#142034] border border-[#224870] flex items-center justify-center text-[#4EA5D9] mb-4 shadow-inner">
        {icon || <FolderGit2 className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-[#F4F7FB] tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-[#9BB0CC] max-w-sm leading-relaxed">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
