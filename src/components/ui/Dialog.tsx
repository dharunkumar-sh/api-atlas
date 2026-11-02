import React, { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

const maxWidthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'lg',
  showCloseButton = false,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        className={cn(
          'relative w-full rounded-2xl bg-[#0E1726] border border-[#224870] shadow-2xl p-6 text-[#F4F7FB] z-10 transition-all duration-200 my-8',
          maxWidthStyles[maxWidth]
        )}
      >
        {/* Optional Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="absolute right-4 top-4 p-1 rounded-lg text-[#9BB0CC] hover:text-[#44CFCB] hover:bg-[#142034] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        {(title || description) && (
          <div className="mb-5 pr-8">
            {title && (
              <h2
                id="dialog-title"
                className="text-lg font-semibold text-[#F4F7FB]"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-[#9BB0CC]">{description}</p>
            )}
          </div>
        )}

        {/* Body */}
        <div className="space-y-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#224870]/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
