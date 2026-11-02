import React, { forwardRef, useState } from 'react';
import { AuthInput, type AuthInputProps } from './AuthInput';
import { Eye, EyeOff, Lock, Check, X } from 'lucide-react';
import { evaluatePassword } from './authStore';

export interface PasswordInputProps
  extends Omit<AuthInputProps, 'type' | 'suffixIcon'> {
  showStrengthFeedback?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      showStrengthFeedback = false,
      value,
      prefixIcon = <Lock className="w-4 h-4" />,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const pwd = typeof value === 'string' ? value : '';
    const criteria = evaluatePassword(pwd);

    const strengthLabels = ['Too weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = [
      'bg-rose-500',
      'bg-amber-500',
      'bg-[#4EA5D9]',
      'bg-[#44CFCB]',
    ];

    return (
      <div className="w-full space-y-1.5">
        <AuthInput
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          prefixIcon={prefixIcon}
          suffixIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 rounded-md text-[#627898] hover:text-[#44CFCB] focus:outline-none focus:text-[#4EA5D9] transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          {...props}
        />

        {/* Real-time Password Strength Feedback & Checklist */}
        {showStrengthFeedback && pwd.length > 0 && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-150">
            {/* Strength bar */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 h-1.5 w-full">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      step < criteria.score
                        ? strengthColors[criteria.score - 1]
                        : 'bg-[#142034]'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center text-[10px] font-sans text-[#627898]">
                <span>Strength requirement</span>
                <span
                  className={`font-semibold ${
                    criteria.score > 0 ? 'text-[#BAE6FD]' : 'text-[#627898]'
                  }`}
                >
                  {criteria.score > 0 ? strengthLabels[criteria.score - 1] : ''}
                </span>
              </div>
            </div>

            {/* Criteria checklist */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-sans">
              <div
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  criteria.hasMinLength ? 'text-[#44CFCB]' : 'text-[#627898]'
                }`}
              >
                {criteria.hasMinLength ? (
                  <Check className="w-3 h-3 text-[#44CFCB]" />
                ) : (
                  <X className="w-3 h-3 text-[#627898]" />
                )}
                <span>8+ characters</span>
              </div>

              <div
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  criteria.hasUppercase ? 'text-[#44CFCB]' : 'text-[#627898]'
                }`}
              >
                {criteria.hasUppercase ? (
                  <Check className="w-3 h-3 text-[#44CFCB]" />
                ) : (
                  <X className="w-3 h-3 text-[#627898]" />
                )}
                <span>Uppercase letter</span>
              </div>

              <div
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  criteria.hasNumber ? 'text-[#44CFCB]' : 'text-[#627898]'
                }`}
              >
                {criteria.hasNumber ? (
                  <Check className="w-3 h-3 text-[#44CFCB]" />
                ) : (
                  <X className="w-3 h-3 text-[#627898]" />
                )}
                <span>Number (0-9)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  criteria.hasSpecialChar ? 'text-[#44CFCB]' : 'text-[#627898]'
                }`}
              >
                {criteria.hasSpecialChar ? (
                  <Check className="w-3 h-3 text-[#44CFCB]" />
                ) : (
                  <X className="w-3 h-3 text-[#627898]" />
                )}
                <span>Special symbol</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
