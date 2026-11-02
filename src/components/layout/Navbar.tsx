import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { UserMenu, AuthPopover, type AuthView } from '@/components/auth';

interface NavbarProps {
  currentPath?: string;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('signin');

  const handleOpenAuth = (view: AuthView) => {
    setAuthView(view);
    setIsAuthOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-14 bg-[#0A101D]/95 backdrop-blur-md border-b border-[#224870]/60 px-4 sm:px-6 flex items-center justify-between font-sans">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <Logo size="md" />
          </a>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2.5">
          {/* User Menu reflecting authenticated state & sign-out action */}
          <UserMenu
            variant="app"
            onOpenAuth={handleOpenAuth}
          />
        </div>
      </header>

      {/* In-app Auth Popover */}
      <AuthPopover
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialView={authView}
      />
    </>
  );
};
