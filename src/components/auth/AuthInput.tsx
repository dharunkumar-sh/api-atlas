import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle } from 'lucide-react';

export interface AuthInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  containerClassName?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      prefixIcon,
      suffixIcon,
      id,
      containerClassName,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId =
      id || (label ? `auth-input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;

    return (
      <div className={cn('w-full space-y-1.5 text-left', containerClassName)}>
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-xs font-sans font-medium text-[#BAE6FD] tracking-wide"
          >
            {label}
            {required && <span className="text-[#44CFCB] ml-1">*</span>}
          </label>
        </div>

        <div className="relative flex items-center group">
          {prefixIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#627898] group-focus-within:text-[#4EA5D9] transition-colors">
              {prefixIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            required={required}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={errorId || helperId}
            className={cn(
              'w-full rounded-xl bg-[#080D18] border border-[#224870] px-3.5 py-2.5 text-sm font-sans text-[#F4F7FB] placeholder:text-[#627898]',
              'transition-all duration-150',
              'focus:outline-none focus:border-[#4EA5D9] focus:ring-2 focus:ring-[#4EA5D9]/30 focus:bg-[#0A101D]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              prefixIcon ? 'pl-9' : 'pl-3.5',
              suffixIcon ? 'pr-10' : 'pr-3.5',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30',
              className
            )}
            {...props}
          />

          {suffixIcon && (
            <div className="absolute right-3 flex items-center text-[#627898]">
              {suffixIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="text-xs font-sans text-rose-400 flex items-center gap-1.5 animate-in fade-in duration-150"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-[11px] font-sans text-[#627898]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
