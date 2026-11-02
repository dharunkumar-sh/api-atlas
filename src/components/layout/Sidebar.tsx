import { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Settings,
  FolderPlus,
  Compass,
} from 'lucide-react';
import { ImportSpecModal } from '@/components/workspace/ImportSpecModal';

interface SidebarProps {
  currentPath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath = '/dashboard',
}) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const mainNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Workspace Explorer', href: '/workspace', icon: Layers },
    { label: 'API Overview', href: '/overview', icon: Compass },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      <aside
        aria-label="Application Sidebar"
        className="hidden md:flex flex-col border-r border-[#224870]/60 bg-[#070B13] text-[#9BB0CC] shrink-0 select-none font-sans fixed top-14 left-0 bottom-0 w-20 z-40 group/sidebar"
      >
        {/* Action Button: Quick Import */}
        <div className="p-3 pt-4">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            title="New API Specification"
            aria-label="New API Specification"
            className="w-12 h-12 mx-auto flex items-center justify-center rounded-xl bg-[#142034] hover:bg-[#1B2B46] border border-[#224870] hover:border-[#4EA5D9]/50 text-xs font-semibold text-[#F4F7FB] transition-all cursor-pointer shadow-xs group"
          >
            <FolderPlus className="w-5 h-5 text-[#44CFCB] group-hover:scale-110 transition-transform shrink-0" />
          </button>
        </div>

        {/* Division Line between New API spec and Navigation Icons */}
        <div className="px-3">
          <div className="border-b border-[#224870]/60 w-full" />
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-3 px-3 space-y-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.href ||
              (item.href !== '/' && currentPath.startsWith(item.href));

            return (
              <a
                key={item.href}
                href={item.href}
                title={item.label}
                aria-label={item.label}
                className={`w-12 h-12 mx-auto flex items-center justify-center rounded-xl font-medium transition-all duration-150 relative group cursor-pointer ${
                  isActive
                    ? 'bg-[#18263D] text-[#F4F7FB] border border-[#4EA5D9]/40 font-semibold shadow-xs'
                    : 'text-[#9BB0CC] hover:text-[#F4F7FB] hover:bg-[#142034]/60 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors shrink-0 ${
                    isActive
                      ? 'text-[#44CFCB]'
                      : 'text-[#627898] group-hover:text-[#F4F7FB]'
                  }`}
                />

                {/* Floating tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#0E1726] border border-[#224870] text-xs font-medium text-[#F4F7FB] whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </aside>

      {/* Import Modal accessible from Sidebar */}
      <ImportSpecModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
};
