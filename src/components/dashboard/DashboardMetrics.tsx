import React from 'react';
import type { DashboardMetric } from '@/schemas/dashboard';
import {
  Database,
  Layers,
  Server,
  ShieldCheck,
} from 'lucide-react';

interface DashboardMetricsProps {
  metrics: DashboardMetric;
  recentProjectsCount?: number;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  metrics,
  recentProjectsCount = 0,
}) => {
  const cards = [
    {
      id: 'specs',
      label: 'Registered Specs',
      value: metrics.totalSpecs,
      icon: Database,
      iconColor: 'text-[#4EA5D9]',
      borderColor: 'hover:border-[#4EA5D9]/50',
      badgeColor: 'bg-[#4EA5D9]/10 text-[#4EA5D9] border-[#4EA5D9]/30',
      subtext:
        recentProjectsCount > 0
          ? `${recentProjectsCount} updated this week`
          : metrics.totalSpecs === 1
            ? '1 active specification'
            : `${metrics.totalSpecs} active specifications`,
      pill: metrics.supportedFormats.join(' & '),
    },
    {
      id: 'endpoints',
      label: 'Parsed Endpoints',
      value: metrics.totalEndpoints,
      icon: Layers,
      iconColor: 'text-[#44CFCB]',
      borderColor: 'hover:border-[#44CFCB]/50',
      badgeColor: 'bg-[#44CFCB]/10 text-[#44CFCB] border-[#44CFCB]/30',
      subtext: `${metrics.totalServers} ${
        metrics.totalServers === 1 ? 'target host' : 'target hosts'
      } configured`,
      pill: 'REST & HTTP',
    },
    {
      id: 'targets',
      label: 'OpenAPI Targets',
      value: metrics.openApiTargets.join(' / '),
      icon: Server,
      iconColor: 'text-[#4EA5D9]',
      borderColor: 'hover:border-[#4EA5D9]/50',
      badgeColor: 'bg-[#224870]/40 text-[#E2EAF4] border-[#224870]',
      subtext: 'Swagger 2.0, OAS 3.0 & 3.1',
      pill: 'Full Schema Support',
      isTextValue: true,
    },
    {
      id: 'validation',
      label: 'Validation Engine',
      value: metrics.validationStatus,
      icon: ShieldCheck,
      iconColor:
        metrics.validationStatus === 'Active'
          ? 'text-emerald-400'
          : metrics.validationStatus === 'Degraded'
            ? 'text-amber-400'
            : 'text-slate-400',
      borderColor:
        metrics.validationStatus === 'Active'
          ? 'hover:border-emerald-500/50'
          : 'hover:border-slate-500/50',
      badgeColor:
        metrics.validationStatus === 'Active'
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-slate-700/20 text-slate-300 border-slate-700',
      subtext:
        metrics.validationStatus === 'Active'
          ? 'Real-time schema verification'
          : 'Standby for contract imports',
      pill: metrics.validationStatus === 'Active' ? 'Operational' : 'Idle',
      isTextValue: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`group relative p-5 sm:p-6 rounded-2xl bg-[#0E1726]/80 backdrop-blur-sm border border-[#224870]/70 shadow-sm transition-all duration-200 ${card.borderColor} hover:bg-[#0E1726] flex flex-col justify-between`}
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-medium text-[#9BB0CC]">
                {card.label}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#142034] border border-[#224870] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>

            {/* Middle row: Big Value */}
            <div className="mt-3">
              <p
                className={`font-mono font-bold tracking-tight text-[#F4F7FB] ${
                  card.isTextValue
                    ? 'text-xl sm:text-2xl'
                    : 'text-2xl sm:text-3xl'
                }`}
              >
                {card.value}
              </p>
            </div>

            {/* Bottom row: Subtext & micro badge */}
            <div className="mt-3 pt-3 border-t border-[#224870]/40 flex items-center justify-between gap-2 text-xs">
              <span className="text-[#9BB0CC] text-[11px] sm:text-xs truncate">
                {card.subtext}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border shrink-0 ${card.badgeColor}`}
              >
                {card.pill}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
