import React, { useState, useEffect } from 'react';
import { AuthInput } from './AuthInput';
import { PasswordInput } from './PasswordInput';
import { AuthDivider } from './AuthDivider';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { isValidEmail } from './authStore';
import {
  initiateOAuthSignIn,
  validateRedirectPath,
  type OAuthProvider,
} from '@/lib/auth/client';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';

export interface SignInFormProps {
  email?: string;
  onEmailChange?: (val: string) => void;
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  email: controlledEmail,
  onEmailChange,
  onSuccess,
  onSwitchToSignUp,
}) => {
  const [internalEmail, setInternalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeOAuthProvider, setActiveOAuthProvider] =
    useState<OAuthProvider | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);

  const email = controlledEmail !== undefined ? controlledEmail : internalEmail;

  // Detect OAuth callback cancellation or error parameters in URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error') || params.get('error_description');
    if (err) {
      const isDenied = err.includes('access_denied') || err.includes('denied');
      const message = isDenied
        ? 'OAuth authorization was cancelled. You can sign in using your email and password.'
        : `Provider returned: ${decodeURIComponent(err)}`;
      setOauthNotice(message);
      toast.warning('Sign-In Cancelled', message);
    }
  }, []);

  const handleEmailUpdate = (val: string) => {
    if (onEmailChange) {
      onEmailChange(val);
    } else {
      setInternalEmail(val);
    }
    if (errors.email || errors.form) {
      setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
    }
  };

  const handlePasswordUpdate = (val: string) => {
    setPassword(val);
    if (errors.password || errors.form) {
      setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
    }
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};

    if (!email.trim()) {
      errs.email = 'Work email is required.';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please enter a valid work email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOauthNotice(null);

    if (!validate() || isLoading || activeOAuthProvider) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        const errorMsg =
          data.error || 'Authentication failed. Please verify credentials.';
        setErrors({ form: errorMsg });
        toast.error('Sign In Failed', errorMsg);
        return;
      }

      toast.success(
        'Signed In Successfully',
        `Welcome back, ${data.user?.name || data.user?.email || 'developer'}!`
      );

      // Notify navbar and other components about authentication status
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('api_atlas_auth_changed', {
            detail: { user: data.user },
          })
        );

        // Safe redirect to intended destination
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect');
        const target = validateRedirectPath(redirectParam, '/dashboard');
        if (window.location.pathname !== target) {
          window.location.href = target;
        }
      }

      onSuccess?.();
    } catch {
      const connError =
        'Unable to connect to the authentication server. Please try again.';
      setErrors({ form: connError });
      toast.error('Connection Error', connError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthClick = async (provider: OAuthProvider) => {
    if (isLoading || activeOAuthProvider) return; // Prevent duplicate submissions

    setOauthNotice(null);
    setActiveOAuthProvider(provider);

    try {
      // Validate intended destination from URL params
      const params =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search)
          : null;
      const redirectParam = params?.get('redirect');
      const destination = validateRedirectPath(redirectParam, '/dashboard');

      const result = await initiateOAuthSignIn(provider, destination);
      if (!result.success) {
        setOauthNotice(
          result.error || `Unable to connect to ${provider} OAuth.`
        );
        toast.warning(`${provider.toUpperCase()} Notice`, result.error);
        setActiveOAuthProvider(null);
      }
      // If success, initiateOAuthSignIn sets window.location.href to provider URL
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : `Unexpected error initiating ${provider} authentication.`;
      setOauthNotice(msg);
      toast.error('OAuth Error', msg);
      setActiveOAuthProvider(null);
    }
  };

  const isAnyLoading = isLoading || activeOAuthProvider !== null;

  return (
    <div className="space-y-4">
      {/* Real OAuth Providers (Google & GitHub) */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleOAuthClick('github')}
            disabled={isAnyLoading}
            aria-label="Continue with GitHub"
            aria-busy={activeOAuthProvider === 'github'}
            className="group relative h-10 px-3 rounded-xl bg-[#142034] hover:bg-[#1B2B46] border border-[#224870] hover:border-[#4EA5D9]/50 text-xs font-sans font-medium text-[#E2EAF4] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activeOAuthProvider === 'github' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#44CFCB]" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 fill-current text-[#F4F7FB]"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>Continue with GitHub</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleOAuthClick('google')}
            disabled={isAnyLoading}
            aria-label="Continue with Google"
            aria-busy={activeOAuthProvider === 'google'}
            className="group relative h-10 px-3 rounded-xl bg-[#142034] hover:bg-[#1B2B46] border border-[#224870] hover:border-[#4EA5D9]/50 text-xs font-sans font-medium text-[#E2EAF4] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activeOAuthProvider === 'google' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#4EA5D9]" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Informative notice for unconfigured OAuth or cancelled callback */}
        {oauthNotice && (
          <div
            role="alert"
            className="p-2.5 rounded-lg bg-[#142034]/90 border border-[#4EA5D9]/40 text-left space-y-1 animate-in fade-in duration-150"
          >
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-[#4EA5D9] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#E2EAF4] leading-relaxed font-sans">
                {oauthNotice}
              </p>
            </div>
          </div>
        )}
      </div>

      <AuthDivider label="OR CONTINUE WITH EMAIL" />

      {/* Main Email/Password Sign-In Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {errors.form && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-snug">{errors.form}</p>
          </div>
        )}

        <AuthInput
          id="signin-email"
          label="Work Email"
          type="email"
          value={email}
          onChange={(e) => handleEmailUpdate(e.target.value)}
          placeholder="name@company.com"
          required
          autoComplete="email"
          disabled={isAnyLoading}
          error={errors.email}
          prefixIcon={<Mail className="w-4 h-4 text-[#9BB0CC]" />}
        />

        <PasswordInput
          id="signin-password"
          label="Password"
          value={password}
          onChange={(e) => handlePasswordUpdate(e.target.value)}
          placeholder="Enter your account password"
          required
          autoComplete="current-password"
          disabled={isAnyLoading}
          error={errors.password}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isAnyLoading}
          className="w-full justify-center shadow-lg shadow-[#2A4494]/30 hover:shadow-[#2A4494]/50 cursor-pointer disabled:opacity-50"
        >
          <span>Sign In to API Atlas</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      {/* Switch to Sign Up */}
      <div className="pt-2 text-center text-xs text-[#9BB0CC]">
        <span>New to API Atlas? </span>
        <button
          type="button"
          onClick={onSwitchToSignUp}
          disabled={isAnyLoading}
          className="text-[#4EA5D9] hover:text-[#44CFCB] font-semibold underline underline-offset-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          Create an account
        </button>
      </div>
    </div>
  );
};
