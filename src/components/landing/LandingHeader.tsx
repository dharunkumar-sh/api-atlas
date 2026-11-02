import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { AuthPopover, UserMenu, type AuthView, type AuthUserData } from '@/components/auth';
import {
  ArrowRight,
  LogIn,
  Menu,
  X,
  LayoutDashboard,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export const LandingHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('signin');
  const [user, setUser] = useState<AuthUserData | null>(null);

  // Check URL query parameters (e.g., redirected from protected route: ?auth=signin)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get('auth');
    if (authParam === 'signin' || authParam === 'signup') {
      setAuthView(authParam);
      setIsAuthOpen(true);
    }
  }, []);

  // Sync user state with session endpoint and global events
  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' },
          credentials: 'same-origin',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setUser(data.authenticated && data.user ? data.user : null);
        }
      } catch {
        if (isMounted) setUser(null);
      }
    }

    loadSession();

    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ user: AuthUserData | null }>;
      if (customEvent.detail && customEvent.detail.user !== undefined) {
        setUser(customEvent.detail.user);
      } else {
        loadSession();
      }
    };

    window.addEventListener('api_atlas_auth_changed', handleAuthChange);
    return () => {
      isMounted = false;
      window.removeEventListener('api_atlas_auth_changed', handleAuthChange);
    };
  }, []);

  const handleOpenSignIn = () => {
    setAuthView('signin');
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleOpenSignUp = () => {
    setAuthView('signup');
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleMobileSignOut = async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
      });
      setUser(null);
      setIsMobileMenuOpen(false);
      toast.info('Signed Out', 'You have been securely signed out.');
      window.dispatchEvent(
        new CustomEvent('api_atlas_auth_changed', { detail: { user: null } })
      );
    } catch {
      toast.error('Sign Out Failed', 'Could not complete sign out. Please try again.');
    }
  };

  // Close mobile menu on Escape key press (when auth popover is not open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen && !isAuthOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isAuthOpen]);

  // Prevent background scroll when mobile menu is open (if auth popover is not open)
  useEffect(() => {
    if (isMobileMenuOpen && !isAuthOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!isAuthOpen) {
      document.body.style.overflow = '';
    }
    return () => {
      if (!isAuthOpen) {
        document.body.style.overflow = '';
      }
    };
  }, [isMobileMenuOpen, isAuthOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-atlas-space/90 backdrop-blur-md border-b border-atlas-denim/70 shadow-md shadow-atlas-space/50 px-4 sm:px-6 lg:px-8 transition-all">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* 1. API Atlas Logo (medium size) */}
          <a
            href="/"
            className="flex items-center gap-2 group transition-opacity hover:opacity-90"
            aria-label="API Atlas Homepage"
          >
            <Logo size="md" />
          </a>

          {/* 2. Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1 text-sm font-medium text-[#9BB0CC]"
            aria-label="Primary Navigation"
          >
            <a
              href="#features"
              className="px-3 py-1.5 rounded-lg text-[#9BB0CC] hover:text-atlas-cyan hover:bg-[#142034]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-sky"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-1.5 rounded-lg text-[#9BB0CC] hover:text-atlas-cyan hover:bg-[#142034]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-sky"
            >
              How It Works
            </a>
            <a
              href="#use-cases"
              className="px-3 py-1.5 rounded-lg text-[#9BB0CC] hover:text-atlas-cyan hover:bg-[#142034]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA5D9]"
            >
              Use Cases
            </a>
            <a
              href="/docs"
              className="px-3 py-1.5 rounded-lg text-[#9BB0CC] hover:text-atlas-cyan hover:bg-[#142034]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA5D9]"
            >
              Documentation
            </a>
          </nav>

          {/* 3. Desktop Action Area: Dynamic UserMenu or Auth Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <UserMenu
              variant="landing"
              onOpenAuth={(view) => {
                setAuthView(view);
                setIsAuthOpen(true);
              }}
            />
          </div>

          {/* 4. Mobile Menu Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {!user ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleOpenSignUp}
                className="text-xs px-3 py-1.5 font-medium cursor-pointer"
              >
                <span>Start</span>
              </Button>
            ) : (
              <UserMenu
                variant="landing"
                onOpenAuth={(view) => {
                  setAuthView(view);
                  setIsAuthOpen(true);
                }}
              />
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-[#0E1726] border border-[#224870] text-[#E2EAF4] hover:text-[#44CFCB] hover:border-[#4EA5D9]/50 focus:outline-none focus:ring-2 focus:ring-[#4EA5D9] transition-all cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[#44CFCB]" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 5. Mobile Collapsible Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="fixed inset-0 top-16 z-30 bg-[#0A101D]/95 backdrop-blur-xl md:hidden flex flex-col border-b border-[#224870] animate-in fade-in slide-in-from-top-2 duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-between">
            {/* Links List */}
            <nav className="flex flex-col space-y-5 text-base font-medium text-[#E2EAF4]">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-[#224870]/40 hover:text-[#44CFCB] transition-colors"
              >
                <span>Features</span>
                <span className="text-xs text-[#4EA5D9] font-mono">01</span>
              </a>
              <a
                href="#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-[#224870]/40 hover:text-[#44CFCB] transition-colors"
              >
                <span>How It Works</span>
                <span className="text-xs text-[#4EA5D9] font-mono">02</span>
              </a>
              <a
                href="#use-cases"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-[#224870]/40 hover:text-[#44CFCB] transition-colors"
              >
                <span>Use Cases</span>
                <span className="text-xs text-[#4EA5D9] font-mono">03</span>
              </a>
              <a
                href="/docs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-[#224870]/40 hover:text-[#44CFCB] transition-colors"
              >
                <span>Documentation</span>
                <span className="text-xs text-[#4EA5D9] font-mono">04</span>
              </a>

              {user && (
                <>
                  <a
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 border-b border-[#224870]/40 text-[#44CFCB] font-semibold transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-[#4EA5D9]" />
                      Dashboard
                    </span>
                    <span className="text-xs text-[#44CFCB] font-mono">APP</span>
                  </a>
                  <a
                    href="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 border-b border-[#224870]/40 text-[#E2EAF4] hover:text-[#44CFCB] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#4EA5D9]" />
                      Settings
                    </span>
                    <span className="text-xs text-[#9BB0CC] font-mono">CONFIG</span>
                  </a>
                </>
              )}
            </nav>

            {/* Mobile Actions: User Profile or Sign In / Sign Up */}
            <div className="pt-8 space-y-3">
              {user ? (
                <div className="p-4 rounded-xl bg-[#0E1726] border border-[#224870] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#1F365C] via-[#2A4494] to-[#4EA5D9] flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-[#44CFCB]/40">
                      {(user.name || user.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#F4F7FB] truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] font-mono text-[#9BB0CC] truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-[#142034] text-[#44CFCB] border border-[#224870]">
                      <ShieldCheck className="w-2.5 h-2.5 text-[#44CFCB]" />
                      {user.role || 'DEV'}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleMobileSignOut}
                    className="w-full justify-center text-xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={handleOpenSignIn}
                    className="w-full justify-center cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 mr-2 text-[#4EA5D9]" />
                    <span>Sign In</span>
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleOpenSignUp}
                    className="w-full justify-center shadow-lg shadow-[#2A4494]/40 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}

              <div className="pt-4 text-center font-mono text-[11px] text-[#627898]">
                <span>API ATLAS v0.1 • ZERO CLOUD TELEMETRY</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Auth Popover Modal */}
      <AuthPopover
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialView={authView}
      />
    </>
  );
};
