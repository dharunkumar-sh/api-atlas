import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import type { ButtonVariant, ButtonSize } from '@/types/ui';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#2A4494] hover:bg-[#22387a] text-[#F4F7FB] font-medium border border-[#4EA5D9]/40 shadow-[0_1px_3px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] active:translate-y-px',
  secondary:
    'bg-[#142034] hover:bg-[#1B2B46] text-[#E2EAF4] border border-[#224870] hover:border-[#4EA5D9]/50 shadow-[0_1px_2px_rgba(0,0,0,0.4)] active:translate-y-px',
  outline:
    'bg-transparent hover:bg-[#1F365C]/30 text-[#E2EAF4] hover:text-[#44CFCB] border border-[#224870] hover:border-[#4EA5D9]/60 active:translate-y-px',
  ghost:
    'bg-transparent hover:bg-[#1F365C]/30 text-[#9BB0CC] hover:text-[#F4F7FB]',
  danger:
    'bg-rose-600/90 hover:bg-rose-600 text-white font-medium border border-rose-400/30 shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:translate-y-px',
  success:
    'bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium border border-emerald-400/30 shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:translate-y-px',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5 font-medium',
  md: 'text-xs sm:text-sm px-4 py-2 rounded-lg gap-2 font-medium',
  lg: 'text-sm sm:text-base px-5 py-2.5 rounded-lg gap-2.5 font-semibold',
  icon: 'p-2 rounded-lg aspect-square',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer tracking-tight',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA5D9]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A101D]',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
