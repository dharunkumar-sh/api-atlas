import React, { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { X } from 'lucide-react';

export type AuthView = 'signin' | 'signup';

export interface AuthPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export const AuthPopover: React.FC<AuthPopoverProps> = ({
  isOpen,
  onClose,
  initialView = 'signin',
}) => {
  const [view, setView] = useState<AuthView>(initialView);

  // Preserve entered values across view switches
  const [sharedEmail, setSharedEmail] = useState('');
  const [sharedName, setSharedName] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial view when opened
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-atlas-space/80 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-200"
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-linear-to-b from-[#0E1726] to-atlas-space border border-atlas-denim rounded-3xl shadow-2xl p-6 sm:p-7 relative overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-atlas-royal/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-atlas-cyan/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Bar: Cleanly arranged Brand Icon, Title, and Close Button */}
        <div className="relative z-10 flex items-start justify-between pb-4 border-b border-atlas-denim/60">
          <div className="flex items-center gap-3.5">
            <Logo size="md" showWordmark={false} />
            <div className="space-y-0.5">
              <h2
                id="auth-modal-title"
                className="text-base sm:text-lg font-bold text-[#F4F7FB] tracking-tight leading-snug"
              >
                {view === 'signin'
                  ? 'Sign in to API Atlas'
                  : 'Create Developer Account'}
              </h2>
              <p className="text-xs text-[#9BB0CC]">
                {view === 'signin'
                  ? 'Enter your credentials to access your local workspace'
                  : 'Start exploring and validating OpenAPI contracts'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#142034] hover:bg-[#1B2B46] border border-atlas-denim text-[#9BB0CC] hover:text-atlas-cyan flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4EA5D9] shrink-0 ml-3"
            aria-label="Close authentication dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Form Content */}
        <div className="relative z-10 pt-4">
          {view === 'signin' ? (
            <SignInForm
              email={sharedEmail}
              onEmailChange={setSharedEmail}
              onSuccess={onClose}
              onSwitchToSignUp={() => setView('signup')}
            />
          ) : (
            <SignUpForm
              name={sharedName}
              onNameChange={setSharedName}
              email={sharedEmail}
              onEmailChange={setSharedEmail}
              onSuccess={onClose}
              onSwitchToSignIn={() => setView('signin')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
