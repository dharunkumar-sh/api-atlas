import React, { useState, useEffect, useRef } from 'react';
import type { ApiProject } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImportSpecModal } from '@/components/workspace/ImportSpecModal';
import { useToast } from '@/components/ui/Toast';
import { formatIsoDate } from '@/utils/formatters';
import {
  FolderGit2,
  PlusCircle,
  Search,
  Trash2,
  Layers,
  Server,
  LayoutGrid,
  List,
  Copy,
  Check,
  Calendar,
  X,
  FileCode2,
  ChevronDown,
} from 'lucide-react';

type ViewMode = 'grid' | 'table';
type SortOption = 'updated_desc' | 'name_asc' | 'endpoints_desc';

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('updated_desc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Project Deleted', `Removed ${name}`);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error('Delete Failed');
      }
    } catch {
      toast.error('Network Error while deleting');
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.info('Project ID Copied', id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filter projects by query
  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Sort filtered projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortOption === 'updated_desc') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortOption === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortOption === 'endpoints_desc') {
      return (b.endpointsCount || 0) - (a.endpointsCount || 0);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Control Toolbar: Search, Filters, Sorters & View Switcher */}
      <div className="flex flex-col gap-4 bg-[#0E1726]/60 p-4 sm:p-5 rounded-2xl border border-[#224870]/70">
        {/* Top row: Search input & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Input
              placeholder="Search contracts by name, tag, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefixIcon={<Search className="w-4 h-4 text-[#9BB0CC]" />}
              className="text-sm bg-[#142034] border-[#224870] text-[#F4F7FB] placeholder-[#627898] focus:border-[#4EA5D9] h-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BB0CC] hover:text-[#F4F7FB] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            {/* Themed Custom Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen((prev) => !prev)}
                className="h-10 px-3.5 rounded-xl bg-[#142034] border border-[#224870] hover:border-[#4EA5D9] text-xs font-medium text-[#E2EAF4] transition-all flex items-center gap-2 shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4EA5D9]"
                aria-haspopup="listbox"
                aria-expanded={isSortDropdownOpen}
              >
                <span className="font-semibold text-[#F4F7FB]">
                  {sortOption === 'updated_desc' && 'Recently Updated'}
                  {sortOption === 'name_asc' && 'Name (A to Z)'}
                  {sortOption === 'endpoints_desc' && 'Most Endpoints'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#9BB0CC] transition-transform duration-200 ${
                    isSortDropdownOpen ? 'rotate-180 text-[#44CFCB]' : ''
                  }`}
                />
              </button>

              {/* Themed Dropdown Menu */}
              {isSortDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#0E1726]/95 backdrop-blur-xl border border-[#224870] shadow-xl shadow-[#040810]/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 font-sans"
                >
                  {[
                    { id: 'updated_desc', label: 'Recently Updated' },
                    { id: 'name_asc', label: 'Name (A to Z)' },
                    { id: 'endpoints_desc', label: 'Most Endpoints' },
                  ].map((option) => {
                    const isSelected = sortOption === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setSortOption(option.id as SortOption);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#142034] text-[#44CFCB] font-semibold'
                            : 'text-[#E2EAF4] hover:text-[#44CFCB] hover:bg-[#142034]/70'
                        }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#44CFCB] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grid / Table Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#142034] border border-[#224870]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#224870] text-[#44CFCB] shadow-xs'
                    : 'text-[#9BB0CC] hover:text-[#F4F7FB]'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#224870] text-[#44CFCB] shadow-xs'
                    : 'text-[#9BB0CC] hover:text-[#F4F7FB]'
                }`}
                title="Table view"
                aria-label="Table view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Action Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="h-10 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Import Spec</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area: Loading / Empty / Grid / Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-56 rounded-2xl bg-[#0E1726]/60 border border-[#224870]/60 animate-pulse p-6"
            />
          ))}
        </div>
      ) : sortedProjects.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-[#0E1726]/60 border border-[#224870]/60 text-center">
          <EmptyState
            icon={<FolderGit2 className="w-10 h-10 text-[#4EA5D9]" />}
            title={
              searchQuery
                ? 'No matching contracts found'
                : 'No API Specifications Registered'
            }
            description={
              searchQuery
                ? `No specifications match "${searchQuery}". Try clearing your search query or importing a new spec.`
                : 'Import an OpenAPI 3.0 or 3.1 specification (YAML or JSON) to begin visual contract inspection, schema validation, and mock requests.'
            }
            action={
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsImportModalOpen(true)}
                className="text-xs sm:text-sm px-5 h-10 rounded-xl cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Import OpenAPI Spec</span>
              </Button>
            }
            secondaryAction={
              searchQuery ? (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setSearchQuery('')}
                  className="text-xs sm:text-sm px-4 h-10 rounded-xl cursor-pointer"
                >
                  Clear Search
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => {
                window.location.href = `/workspace/${project.id}`;
              }}
              className="group p-5 sm:p-6 rounded-2xl bg-[#0E1726]/90 border border-[#224870]/70 hover:border-[#4EA5D9]/70 hover:bg-[#111C2E] shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Header: Spec Type & Version */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium uppercase bg-[#142034] text-[#4EA5D9] border border-[#224870]">
                    {project.specType.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-[#9BB0CC] font-mono font-semibold">
                    v{project.version}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#F4F7FB] group-hover:text-[#44CFCB] transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                </div>

                {project.description ? (
                  <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-[#9BB0CC] leading-relaxed">
                    {project.description}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-[#627898] italic">
                    No description provided.
                  </p>
                )}

                {/* Metrics: Endpoints & Servers */}
                <div className="mt-4 flex items-center gap-4 text-xs font-mono text-[#E2EAF4]">
                  <div className="flex items-center gap-1.5 bg-[#142034] px-2.5 py-1 rounded-lg border border-[#224870]/80">
                    <Layers className="w-3.5 h-3.5 text-[#4EA5D9]" />
                    <span className="font-semibold">
                      {project.endpointsCount}
                    </span>
                    <span className="text-[#9BB0CC]">endpoints</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#142034] px-2.5 py-1 rounded-lg border border-[#224870]/80">
                    <Server className="w-3.5 h-3.5 text-[#44CFCB]" />
                    <span className="font-semibold">
                      {project.serversCount}
                    </span>
                    <span className="text-[#9BB0CC]">servers</span>
                  </div>
                </div>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[11px] bg-[#142034] text-[#9BB0CC] border-[#224870]"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-[11px] text-[#627898] self-center">
                        +{project.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Timestamp & Actions */}
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
                    title="Copy Project ID"
                    aria-label="Copy Project ID"
                  >
                    {copiedId === project.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id, project.name);
                    }}
                    className="p-1.5 rounded-lg text-[#9BB0CC] hover:text-rose-400 hover:bg-[#142034] transition-colors cursor-pointer"
                    title="Delete project"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="overflow-x-auto rounded-2xl border border-[#224870]/70 bg-[#0E1726]/90 shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#224870]/70 bg-[#142034]/70 text-[#9BB0CC] font-medium text-xs">
                <th className="py-3.5 px-4 font-semibold">Contract</th>
                <th className="py-3.5 px-4 font-semibold">Spec Type</th>
                <th className="py-3.5 px-4 font-semibold">Version</th>
                <th className="py-3.5 px-4 font-semibold">Endpoints</th>
                <th className="py-3.5 px-4 font-semibold">Servers</th>
                <th className="py-3.5 px-4 font-semibold">Last Updated</th>
                <th className="py-3.5 px-4 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#224870]/40">
              {sortedProjects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => {
                    window.location.href = `/workspace/${project.id}`;
                  }}
                  className="hover:bg-[#142034]/50 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#142034] border border-[#224870] flex items-center justify-center shrink-0 text-[#4EA5D9]">
                        <FileCode2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#F4F7FB] group-hover:text-[#44CFCB] transition-colors block truncate max-w-xs">
                          {project.name}
                        </span>
                        {project.description && (
                          <p className="text-xs text-[#9BB0CC] truncate max-w-xs mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium uppercase bg-[#142034] text-[#4EA5D9] border border-[#224870]">
                      {project.specType.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-[#E2EAF4]">
                    v{project.version}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-[#44CFCB] font-semibold">
                      <Layers className="w-3.5 h-3.5 text-[#4EA5D9]" />
                      {project.endpointsCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-[#9BB0CC]">
                      <Server className="w-3.5 h-3.5 text-[#44CFCB]" />
                      {project.serversCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-xs text-[#9BB0CC]">
                    {formatIsoDate(project.updatedAt)}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyId(project.id);
                        }}
                        className="p-1.5 rounded-lg text-[#9BB0CC] hover:text-[#44CFCB] hover:bg-[#142034] transition-colors cursor-pointer"
                        title="Copy Project ID"
                      >
                        {copiedId === project.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id, project.name);
                        }}
                        className="p-1.5 rounded-lg text-[#9BB0CC] hover:text-rose-400 hover:bg-[#142034] transition-colors cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for importing OpenAPI spec */}
      <ImportSpecModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          fetchProjects();
        }}
      />
    </div>
  );
};
