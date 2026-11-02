import React, { useEffect, useRef, useState } from 'react';
import {
  User,
  LogOut,
  ChevronDown,
  Loader2,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { authClient, validateRedirectPath } from '@/lib/auth/client';

export interface AuthUserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string | null;
}

interface UserMenuProps {
  variant?: 'landing' | 'app';
  onOpenAuth?: (view: 'signin' | 'signup') => void;
  className?: string;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  variant = 'landing',
  onOpenAuth,
  className = '',
}) => {
  const [user, setUser] = useState<AuthUserData | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 1. Initial session check & listen for auth state changes using library session API
  useEffect(() => {
    let isMounted = true;

    async function fetchSession() {
      try {
        // Retrieve session using session API endpoint
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' },
          credentials: 'same-origin',
        });
        if (!res.ok) throw new Error('Session query failed');
        const data = await res.json();
        if (isMounted) {
          setUser(data.authenticated && data.user ? data.user : null);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoadingSession(false);
      }
    }

    fetchSession();

    // Listen for real-time auth state change events
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ user: AuthUserData | null }>;
      if (customEvent.detail && customEvent.detail.user !== undefined) {
        setUser(customEvent.detail.user);
      } else {
        fetchSession();
      }
    };

    window.addEventListener('api_atlas_auth_changed', handleAuthChange);
    return () => {
      isMounted = false;
      window.removeEventListener('api_atlas_auth_changed', handleAuthChange);
    };
  }, []);

  // 2. Click outside & Escape dismiss listeners
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // 3. Sign Out handler using authentication library sign-out
  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      // 1. Sign out via official Better Auth client method
      await authClient.signOut().catch(() => ({}));

      // 2. Clear native and bridge cookies
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      }).catch(() => ({}));

      setUser(null);
      setIsOpen(false);

      toast.info('Signed Out', 'You have been securely signed out.');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('api_atlas_auth_changed', { detail: { user: null } })
        );

        // If currently on a private route, redirect to homepage safely
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/settings')) {
          window.location.href = '/';
        }
      }
    } catch {
      toast.error('Sign Out Failed', 'Could not complete sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Helper for avatar initials fallback
  const getInitials = (name: string, email: string) => {
    const source = (name || email || 'Atlas').trim();
    const parts = source.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  };

  // If session is still loading initially, show a subtle placeholder
  if (isLoadingSession) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-[#142034] border border-[#224870]/60 animate-pulse" />
      </div>
    );
  }

  // 4. Authenticated View: User Avatar + Dropdown Menu
  if (user) {
    const initials = getInitials(user.name, user.email);

    return (
      <div className={`relative ${className}`} ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="h-9 flex items-center gap-2.5 px-2.5 rounded-lg bg-[#0E1726] hover:bg-[#142034] border border-[#224870] hover:border-[#4EA5D9]/50 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#4EA5D9]"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="User account menu"
        >
          {/* Avatar image or gradient initials */}
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User profile'}
              className="w-6 h-6 rounded-md object-cover shadow-xs ring-1 ring-[#44CFCB]/40 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#1F365C] via-[#2A4494] to-[#4EA5D9] flex items-center justify-center text-[10px] font-bold text-white shadow-xs ring-1 ring-[#44CFCB]/40 shrink-0">
              {initials}
            </div>
          )}

          <div className="hidden sm:flex flex-col text-left justify-center">
            <span className="text-xs font-semibold text-[#F4F7FB] group-hover:text-[#44CFCB] transition-colors leading-none truncate max-w-[130px]">
              {user.name || 'Developer'}
            </span>
            <span className="text-[10px] font-sans text-[#9BB0CC] leading-none mt-0.5 truncate max-w-[130px]">
              {user.email}
            </span>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-[#9BB0CC] transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-[#44CFCB]' : 'group-hover:text-[#F4F7FB]'
            }`}
          />
        </button>

        {/* Dropdown Menu Modal */}
        {isOpen && (
          <div
            role="menu"
            aria-label="User navigation options"
            className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0E1726]/95 backdrop-blur-xl border border-[#224870] shadow-2xl shadow-[#040810]/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans"
          >
            {/* Header info */}
            <div className="px-3 py-2.5 pb-3 border-b border-[#224870]/60">
              <div className="flex items-center gap-2.5">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User profile'}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#44CFCB]/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1F365C] via-[#2A4494] to-[#4EA5D9] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-[#F4F7FB] truncate">
                      {user.name || 'Atlas Developer'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium uppercase bg-[#142034] text-[#44CFCB] border border-[#224870] shrink-0">
                      <ShieldCheck className="w-2.5 h-2.5 text-[#44CFCB]" />
                      {user.role || 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-[#9BB0CC] truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard shortcut for landing page only */}
            {variant === 'landing' && (
              <div className="py-1 border-b border-[#224870]/60">
                <a
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#E2EAF4] hover:text-[#44CFCB] hover:bg-[#142034] transition-colors"
                  role="menuitem"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#4EA5D9]" />
                  <span>Dashboard</span>
                </a>
              </div>
            )}

            {/* Sign Out Action */}
            <div className="pt-1.5">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/30 transition-colors cursor-pointer group disabled:opacity-50"
                role="menuitem"
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                )}
                <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 5. Unauthenticated State
  if (variant === 'landing') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <button
          type="button"
          onClick={() => onOpenAuth?.('signin')}
          className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#E2EAF4] hover:text-[#44CFCB] hover:bg-[#142034] rounded-lg transition-colors cursor-pointer"
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => onOpenAuth?.('signup')}
          className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#2A4494] to-[#1F365C] hover:from-[#3554b5] hover:to-[#224870] border border-[#4EA5D9]/50 rounded-lg shadow-md shadow-[#2A4494]/30 hover:shadow-[#2A4494]/50 transition-all cursor-pointer"
        >
          Get Started
        </button>
      </div>
    );
  }

  // App Shell variant when unauthenticated
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (onOpenAuth) {
            onOpenAuth('signin');
          } else {
            const redirectUrl = validateRedirectPath(window.location.pathname);
            window.location.href = `/?auth=signin&redirect=${encodeURIComponent(redirectUrl)}`;
          }
        }}
        className="h-9 flex items-center gap-1.5 px-3 rounded-lg bg-[#142034] hover:bg-[#1B2B46] border border-[#224870] hover:border-[#4EA5D9]/50 text-xs font-medium text-[#E2EAF4] hover:text-[#44CFCB] transition-all cursor-pointer"
      >
        <User className="w-3.5 h-3.5 text-[#4EA5D9]" />
        <span>Sign In</span>
      </button>
    </div>
  );
};
