import React from 'react';
import { cn } from '@/utils/cn';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  showBadge?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 'w-7 h-7', text: 'text-sm', badge: 'text-[9px] px-1' },
  md: { icon: 'w-8 h-8', text: 'text-base', badge: 'text-[10px] px-1.5' },
  lg: { icon: 'w-9 h-9 sm:w-10 sm:h-10', text: 'text-lg sm:text-xl', badge: 'text-xs px-2' },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  showBadge = false,
  className,
}) => {
  const { icon, text, badge } = sizeMap[size];

  return (
    <div className={cn('inline-flex items-center gap-2.5 sm:gap-3 select-none group', className)}>
      {/* Vibrant Mint-Teal Squircle Icon Mark */}
      <div
        className={cn(
          'relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(53,207,183,0.25)]',
          icon
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Rounded Squircle Container */}
          <rect width="32" height="32" rx="7.5" fill="#35CFB7" />

          {/* Network Connection Lines */}
          <line
            x1="8.5"
            y1="16"
            x2="15"
            y2="9.5"
            stroke="#0E1726"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
          <line
            x1="8.5"
            y1="16"
            x2="23.5"
            y2="16"
            stroke="#0E1726"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
          <line
            x1="8.5"
            y1="16"
            x2="15"
            y2="22.5"
            stroke="#0E1726"
            strokeWidth="2.25"
            strokeLinecap="round"
          />

          {/* Connected Network Nodes (Hollow Rings) */}
          <circle cx="8.5" cy="16" r="2.5" fill="#35CFB7" stroke="#0E1726" strokeWidth="2" />
          <circle cx="15" cy="9.5" r="2.5" fill="#35CFB7" stroke="#0E1726" strokeWidth="2" />
          <circle cx="23.5" cy="16" r="2.5" fill="#35CFB7" stroke="#0E1726" strokeWidth="2" />
          <circle cx="15" cy="22.5" r="2.5" fill="#35CFB7" stroke="#0E1726" strokeWidth="2" />
        </svg>
      </div>

      {/* Clean Sans-Serif Wordmark: "API Atlas" */}
      {showWordmark && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-semibold tracking-tight text-[#F4F7FB] group-hover:text-white transition-colors font-sans',
              text
            )}
          >
            API Atlas
          </span>
          {showBadge && (
            <span
              className={cn(
                'rounded font-mono font-medium border border-[#224870] bg-[#1F365C]/60 text-[#4EA5D9] py-0.5',
                badge
              )}
            >
              v0.1
            </span>
          )}
        </div>
      )}
    </div>
  );
};
