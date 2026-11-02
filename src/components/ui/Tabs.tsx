import React from 'react';
import { cn } from '@/utils/cn';
import type { TabItem } from '@/types/ui';

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'line' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  className,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1',
        variant === 'line'
          ? 'border-b border-[#224870]/60 pb-px'
          : 'bg-[#0E1726] p-1 rounded-xl border border-[#224870]',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-lg transition-all duration-150 cursor-pointer select-none',
              variant === 'line' && [
                'border-b-2 -mb-px rounded-b-none',
                isActive
                  ? 'border-[#44CFCB] text-[#44CFCB] font-semibold'
                  : 'border-transparent text-[#9BB0CC] hover:text-[#F4F7FB] hover:border-[#224870]',
              ],
              variant === 'pills' && [
                isActive
                  ? 'bg-[#2A4494] text-[#F4F7FB] shadow-sm border border-[#4EA5D9]/40'
                  : 'text-[#9BB0CC] hover:text-[#F4F7FB] hover:bg-[#142034]/60',
              ],
              tab.disabled &&
                'opacity-40 cursor-not-allowed pointer-events-none'
            )}
          >
            {tab.icon && (
              <span className="w-4 h-4 flex items-center justify-center">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold',
                  isActive
                    ? 'bg-[#1F365C] text-[#44CFCB]'
                    : 'bg-[#142034] text-[#9BB0CC]'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
