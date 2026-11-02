import React from 'react';
import { cn } from '@/utils/cn';

export interface AuthDividerProps {
  label?: string;
  className?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({
  label = 'OR CONTINUE WITH',
  className,
}) => {
  return (
    <div className={cn('relative py-3.5 flex items-center justify-center', className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-linear-to-r from-transparent via-atlas-denim to-transparent" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 py-0.5 rounded-full bg-[#0E1726] border border-atlas-denim/80 text-[10px] font-sans font-medium tracking-wider text-[#627898] uppercase">
          {label}
        </span>
      </div>
    </div>
  );
};
