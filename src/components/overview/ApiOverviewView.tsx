import React, { useState } from 'react';
import type { ApiProject } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImportSpecModal } from '@/components/workspace/ImportSpecModal';
import { useToast } from '@/components/ui/Toast';
import { formatIsoDate } from '@/utils/formatters';
import {
  Layers,
  Server,
  ShieldCheck,
  Search,
  PlusCircle,
  Copy,
  Check,
  FolderGit2,
  FileCode2,
  Zap,
  Network,
  BarChart3,
  Calendar,
  X,
} from 'lucide-react';

interface ApiOverviewViewProps {
  projects: ApiProject[];
}

export const ApiOverviewView: React.FC<ApiOverviewViewProps> = ({ projects }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const toast = useToast();

  // Aggregate Metrics
  const totalSpecs = projects.length;
  const totalEndpoints = projects.reduce(
    (sum, p) => sum + (p.endpointsCount || 0),
    0
  );
  const totalServers = projects.reduce(
    (sum, p) => sum + (p.serversCount || 0),
    0
  );

  // Collect method distributions across all parsed specs
  const methodCounts: Record<string, number> = {
    GET: 0,
    POST: 0,
    PUT: 0,
    PATCH: 0,
    DELETE: 0,
  };

  projects.forEach((p) => {
    p.parsedSpec?.endpoints?.forEach((ep) => {
      const m = ep.method.toUpperCase();
      if (methodCounts[m] !== undefined) {
        methodCounts[m]++;
      } else {
        methodCounts[m] = 1;
      }
    });
  });

  const totalCalculatedMethods = Object.values(methodCounts).reduce(
    (a, b) => a + b,
    0
  );

  // Calculate spec target breakdowns
  const oas31Count = projects.filter((p) => p.specType === 'openapi_3_1').length;
  const oas30Count = projects.filter((p) => p.specType === 'openapi_3_0').length;
  const swaggerCount = projects.filter((p) => p.specType === 'swagger_2_0').length;

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.info('Spec ID Copied', id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const methodColors: Record<
    string,
    { text: string; bg: string; border: string; bar: string }
  > = {
    GET: {
      text: 'text-[#44CFCB]',
      bg: 'bg-[#44CFCB]/10',
      border: 'border-[#44CFCB]/30',
      bar: 'bg-[#44CFCB]',
    },
    POST: {
      text: 'text-[#4EA5D9]',
      bg: 'bg-[#4EA5D9]/10',
      border: 'border-[#4EA5D9]/30',
      bar: 'bg-[#4EA5D9]',
    },
    PUT: {
      text: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/30',
      bar: 'bg-amber-400',
    },
    PATCH: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-400/10',
      border: 'border-indigo-400/30',
      bar: 'bg-indigo-400',
    },
    DELETE: {
      text: 'text-rose-400',
      bg: 'bg-rose-400/10',
      border: 'border-rose-400/30',
      bar: 'bg-rose-400',
    },
  };

  return (
    <div className="space-y-8 font-sans">
      {/* 1. Page Header with Scope & Engine Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#224870]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4EA5D9] font-mono">
              Workspace
            </span>
            <span className="text-[#627898] text-xs">•</span>
            <span className="text-xs text-[#9BB0CC]">API Topology & Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F7FB]">
            API Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#9BB0CC] max-w-2xl leading-relaxed">
            High-level architectural visibility across all OpenAPI services, network gateways, and schema models.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#142034] border border-[#224870] text-xs text-[#E2EAF4] shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#44CFCB] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#44CFCB]"></span>
            </span>
            <span className="text-xs font-medium text-[#44CFCB]">Deterministic Mesh Active</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Import Contract</span>
          </Button>
        </div>
      </div>

      {/* 2. Top-Level Ecosystem KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1726]/80 backdrop-blur-sm border border-[#224870]/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[#9BB0CC]">
              Integrated Contracts
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#142034] border border-[#224870] flex items-center justify-center text-[#4EA5D9]">
              <FileCode2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-[#F4F7FB]">
              {totalSpecs}
            </p>
            <p className="text-xs text-[#9BB0CC] mt-1">
              {totalSpecs === 1 ? '1 active contract' : `${totalSpecs} active contracts`}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1726]/80 backdrop-blur-sm border border-[#224870]/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[#9BB0CC]">
              Mapped Endpoints
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#142034] border border-[#224870] flex items-center justify-center text-[#44CFCB]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-[#44CFCB]">
              {totalEndpoints}
            </p>
            <p className="text-xs text-[#9BB0CC] mt-1">
              Synchronized HTTP routes
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1726]/80 backdrop-blur-sm border border-[#224870]/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[#9BB0CC]">
              Gateway Targets
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#142034] border border-[#224870] flex items-center justify-center text-[#4EA5D9]">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-[#4EA5D9]">
              {totalServers}
            </p>
            <p className="text-xs text-[#9BB0CC] mt-1">
              Configured service hosts
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1726]/80 backdrop-blur-sm border border-[#224870]/70 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[#9BB0CC]">
              Mock Runtime Status
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#142034] border border-[#224870] flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
              sub-15ms
            </p>
            <p className="text-xs text-[#9BB0CC] mt-1">
              Zero-latency in-browser execution
            </p>
          </div>
        </div>
      </div>

      {/* 3. HTTP Methods Breakdown & Protocol Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Method Distribution Card */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-[#0E1726]/90 border border-[#224870]/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#44CFCB]" />
              <h3 className="text-sm sm:text-base font-bold text-[#F4F7FB]">
                HTTP Method Distribution
              </h3>
            </div>
            <span className="text-xs text-[#9BB0CC] font-mono">
              {totalCalculatedMethods} total operations
            </span>
          </div>

          {/* Visual Percentage Distribution Bar */}
          {totalCalculatedMethods > 0 ? (
            <div className="space-y-3">
              <div className="h-3 w-full bg-[#142034] rounded-full overflow-hidden flex">
                {Object.entries(methodCounts).map(([method, count]) => {
                  if (count === 0) return null;
                  const pct = Math.round((count / totalCalculatedMethods) * 100);
                  const color = methodColors[method] || methodColors.GET;
                  return (
                    <div
                      key={method}
                      style={{ width: `${pct}%` }}
                      className={`${color.bar} h-full transition-all`}
                      title={`${method}: ${count} (${pct}%)`}
                    />
                  );
                })}
              </div>

              {/* Method Badges with Counts */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {Object.entries(methodCounts).map(([method, count]) => {
                  const color = methodColors[method] || methodColors.GET;
                  const pct =
                    totalCalculatedMethods > 0
                      ? Math.round((count / totalCalculatedMethods) * 100)
                      : 0;
                  return (
                    <div
                      key={method}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${color.bg} ${color.border}`}
                    >
                      <span className={`text-xs font-mono font-bold ${color.text}`}>
                        {method}
                      </span>
                      <span className="text-xs font-mono text-[#F4F7FB] font-semibold">
                        {count}
                      </span>
                      <span className="text-[10px] text-[#9BB0CC] font-mono">
                        ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#9BB0CC] bg-[#142034]/50 rounded-xl">
              Import an OpenAPI specification to view live endpoint verb distribution.
            </div>
          )}
        </div>

        {/* Specifications Version Matrix */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1726]/90 border border-[#224870]/70 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#4EA5D9]" />
            <h3 className="text-sm sm:text-base font-bold text-[#F4F7FB]">
              Specification Standards
            </h3>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#142034] border border-[#224870]">
              <span className="text-xs font-mono font-semibold text-[#E2EAF4]">
                OpenAPI 3.1
              </span>
              <span className="text-xs font-mono font-bold text-[#44CFCB]">
                {oas31Count} specs
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#142034] border border-[#224870]">
              <span className="text-xs font-mono font-semibold text-[#E2EAF4]">
                OpenAPI 3.0
              </span>
              <span className="text-xs font-mono font-bold text-[#4EA5D9]">
                {oas30Count} specs
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#142034] border border-[#224870]">
              <span className="text-xs font-mono font-semibold text-[#E2EAF4]">
                Swagger 2.0
              </span>
              <span className="text-xs font-mono font-bold text-[#9BB0CC]">
                {swaggerCount} specs
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#627898] leading-tight">
            Full support for JSON Schema Draft 2020-12, webhooks, and multi-server environments.
          </p>
        </div>
      </div>

      {/* 4. Active Contracts Catalog */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F4F7FB]">
              Active Services & Contracts
            </h2>
            <p className="text-xs text-[#9BB0CC] mt-0.5">
              Launch directly into visual contract exploration and endpoint inspection.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Input
              placeholder="Filter services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefixIcon={<Search className="w-3.5 h-3.5 text-[#9BB0CC]" />}
              className="text-xs h-9 bg-[#142034] border-[#224870] text-[#F4F7FB]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9BB0CC] hover:text-[#F4F7FB] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-[#0E1726]/60 border border-[#224870]/60 text-center">
            <EmptyState
              icon={<FolderGit2 className="w-10 h-10 text-[#4EA5D9]" />}
              title={
                searchQuery
                  ? 'No matching contracts found'
                  : 'No Active Specifications'
              }
              description={
                searchQuery
                  ? `No services matching "${searchQuery}". Try clearing the search filter.`
                  : 'Import your OpenAPI specification to view its full architectural overview and endpoint mesh.'
              }
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsImportModalOpen(true)}
                  className="text-xs sm:text-sm px-5 h-10 rounded-xl cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Import Spec</span>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  window.location.href = `/workspace/${project.id}`;
                }}
                className="group p-5 sm:p-6 rounded-2xl bg-[#0E1726]/90 border border-[#224870]/70 hover:border-[#4EA5D9]/70 hover:bg-[#111C2E] shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium uppercase bg-[#142034] text-[#4EA5D9] border border-[#224870]">
                      {project.specType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#9BB0CC]">
                      v{project.version}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#F4F7FB] group-hover:text-[#44CFCB] transition-colors truncate">
                      {project.name}
                    </h3>
                  </div>

                  {project.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-[#9BB0CC] leading-relaxed">
                      {project.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-[#627898] italic">
                      No description provided.
                    </p>
                  )}

                  {/* Micro stats */}
                  <div className="mt-4 flex items-center gap-3 text-xs font-mono text-[#E2EAF4]">
                    <div className="flex items-center gap-1.5 bg-[#142034] px-2.5 py-1 rounded-lg border border-[#224870]/80">
                      <Layers className="w-3.5 h-3.5 text-[#4EA5D9]" />
                      <span>{project.endpointsCount} endpoints</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#142034] px-2.5 py-1 rounded-lg border border-[#224870]/80">
                      <Server className="w-3.5 h-3.5 text-[#44CFCB]" />
                      <span>{project.serversCount} servers</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] bg-[#142034] text-[#9BB0CC] border-[#224870]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer: Date & Actions */}
                <div className="mt-5 pt-3.5 border-t border-[#224870]/50 flex items-center justify-between text-xs text-[#9BB0CC]">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3 text-[#627898]" />
                    <span>{formatIsoDate(project.updatedAt)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyId(project.id);
                      }}
                      className="p-1.5 rounded-lg text-[#9BB0CC] hover:text-[#44CFCB] hover:bg-[#142034] transition-colors cursor-pointer"
                      title="Copy Spec ID"
                    >
                      {copiedId === project.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Core Platform Architecture Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1726]/70 border border-[#224870]/60 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#142034] border border-[#224870] flex items-center justify-center text-[#4EA5D9]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#F4F7FB]">
            Deterministic Contract AST
          </h3>
          <p className="text-xs text-[#9BB0CC] leading-relaxed">
            Strict client-side parser normalizing OpenAPI 3.0, 3.1, and Swagger specifications into unified schema models with zero telemetry.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1726]/70 border border-[#224870]/60 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#142034] border border-[#224870] flex items-center justify-center text-[#44CFCB]">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#F4F7FB]">
            Sub-15ms Mock Dispatcher
          </h3>
          <p className="text-xs text-[#9BB0CC] leading-relaxed">
            Execute simulated network requests directly within your browser session without configuring remote proxies or staging servers.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1726]/70 border border-[#224870]/60 space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#142034] border border-[#224870] flex items-center justify-center text-[#BAE6FD]">
            <Network className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#F4F7FB]">
            Dependency Trace Mesh
          </h3>
          <p className="text-xs text-[#9BB0CC] leading-relaxed">
            Map relationships between data schemas, path parameters, and shared response codes across multiple interdependent microservices.
          </p>
        </div>
      </div>

      {/* Import Specification Modal */}
      <ImportSpecModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(id) => {
          window.location.href = `/workspace/${id}`;
        }}
      />
    </div>
  );
};
