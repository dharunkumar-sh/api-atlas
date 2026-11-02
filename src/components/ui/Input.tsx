import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      prefixIcon,
      suffixIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#9BB0CC]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#627898]">
              {prefixIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-lg bg-[#0E1726] border border-[#224870] px-3.5 py-2 text-sm text-[#F4F7FB] placeholder:text-[#627898]',
              'transition-colors duration-150',
              'focus:outline-none focus:border-[#4EA5D9] focus:ring-1 focus:ring-[#4EA5D9]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              prefixIcon ? 'pl-9' : '',
              suffixIcon ? 'pr-9' : '',
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                : '',
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
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[#9BB0CC]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#9BB0CC]"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full rounded-lg bg-[#0E1726] border border-[#224870] px-3.5 py-2.5 text-sm text-[#F4F7FB] placeholder:text-[#627898] font-mono text-xs leading-relaxed',
            'transition-colors duration-150',
            'focus:outline-none focus:border-[#4EA5D9] focus:ring-1 focus:ring-[#4EA5D9]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
              : '',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[#9BB0CC]">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
