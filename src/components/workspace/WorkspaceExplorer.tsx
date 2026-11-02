import React, { useState, useEffect, useRef } from 'react';
import type { ApiProject, ApiEndpoint } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { getMethodVariant } from '@/utils/formatters';
import {
  Layers,
  Search,
  Copy,
  Check,
  FileCode2,
  ChevronDown,
  X,
  Play,
  Server,
  FolderGit2,
  Tag,
  Clock,
  Zap,
} from 'lucide-react';
import { ImportSpecModal } from './ImportSpecModal';
import { useToast } from '@/components/ui/Toast';

interface WorkspaceExplorerProps {
  initialProject?: ApiProject | null;
  availableProjects?: ApiProject[];
}

type CodeLanguage = 'curl' | 'fetch' | 'python' | 'axios';

export const WorkspaceExplorer: React.FC<WorkspaceExplorerProps> = ({
  initialProject,
  availableProjects = [],
}) => {
  const [currentProject, setCurrentProject] = useState<ApiProject | null>(
    initialProject || (availableProjects.length > 0 ? availableProjects[0] : null)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(
    currentProject?.parsedSpec?.endpoints[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState<
    'parameters' | 'body' | 'responses' | 'code' | 'sandbox'
  >('parameters');
  const [codeLang, setCodeLang] = useState<CodeLanguage>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Live Mock Dispatcher sandbox state
  const [isDispatching, setIsDispatching] = useState(false);
  const [sandboxResponse, setSandboxResponse] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    timestamp: string;
    data: any;
    headers: Record<string, string>;
  } | null>(null);

  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const serverDropdownRef = useRef<HTMLDivElement>(null);
  const methodDropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
      }
      if (
        serverDropdownRef.current &&
        !serverDropdownRef.current.contains(e.target as Node)
      ) {
        setIsServerDropdownOpen(false);
      }
      if (
        methodDropdownRef.current &&
        !methodDropdownRef.current.contains(e.target as Node)
      ) {
        setIsMethodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected endpoint when project changes
  useEffect(() => {
    if (currentProject?.parsedSpec?.endpoints?.length) {
      setSelectedEndpointId(currentProject.parsedSpec.endpoints[0].id);
      setSelectedServerIndex(0);
      setSandboxResponse(null);
    }
  }, [currentProject?.id]);

  if (!currentProject || !currentProject.parsedSpec) {
    return (
      <div className="p-8 sm:p-12 max-w-4xl mx-auto my-auto font-sans">
        <EmptyState
          icon={<FolderGit2 className="w-10 h-10 text-[#4EA5D9]" />}
          title="No API Workspace Active"
          description="Select an existing specification from your API registry or import an OpenAPI 3.0 / 3.1 contract to start visual endpoint inspection and local mock testing."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsImportModalOpen(true)}
              className="text-xs sm:text-sm px-5 h-10 rounded-xl cursor-pointer"
            >
              <FileCode2 className="w-4 h-4" />
              <span>Import OpenAPI Spec</span>
            </Button>
          }
          secondaryAction={
            <a href="/dashboard">
              <Button
                variant="outline"
                size="md"
                className="text-xs sm:text-sm px-4 h-10 rounded-xl cursor-pointer"
              >
                Go to Dashboard
              </Button>
            </a>
          }
        />

        <ImportSpecModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={(newId) => {
            window.location.href = `/workspace/${newId}`;
          }}
        />
      </div>
    );
  }

  const endpoints = currentProject.parsedSpec.endpoints || [];
  const servers = currentProject.parsedSpec.servers || [];
  const currentServerUrl =
    servers[selectedServerIndex]?.url || 'https://api.example.com';

  const filteredEndpoints = endpoints.filter((ep) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ep.path.toLowerCase().includes(q) ||
      (ep.summary && ep.summary.toLowerCase().includes(q)) ||
      ep.tags.some((t) => t.toLowerCase().includes(q));

    const matchesMethod =
      selectedMethod === 'ALL' || ep.method === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const selectedEndpoint: ApiEndpoint | undefined =
    endpoints.find((ep) => ep.id === selectedEndpointId) || endpoints[0];

  const fullUrl = selectedEndpoint
    ? `${currentServerUrl.replace(/\/$/, '')}${selectedEndpoint.path}`
    : '';

  // Generate code snippet based on selected language
  const generateSnippet = (lang: CodeLanguage, ep: ApiEndpoint): string => {
    const url = `${currentServerUrl.replace(/\/$/, '')}${ep.path}`;
    const method = ep.method;
    const hasBody =
      ep.requestBody && ['POST', 'PUT', 'PATCH'].includes(ep.method);

    switch (lang) {
      case 'curl':
        return `curl -X ${method} "${url}" \\\n  -H "Accept: application/json"${
          hasBody ? ' \\\n  -H "Content-Type: application/json" \\\n  -d \'{}\'' : ''
        }`;
      case 'fetch':
        return `// Native Fetch API
const response = await fetch("${url}", {
  method: "${method}",
  headers: {
    "Accept": "application/json",${
      hasBody ? '\n    "Content-Type": "application/json",' : ''
    }
  },${hasBody ? '\n  body: JSON.stringify({}),' : ''}
});
const data = await response.json();
console.log(data);`;
      case 'python':
        return `# Python Requests
import requests

url = "${url}"
headers = {
    "Accept": "application/json",${
      hasBody ? '\n    "Content-Type": "application/json",' : ''
    }
}
response = requests.${method.toLowerCase()}(url, headers=headers${
          hasBody ? ', json={}' : ''
        })
print(response.json())`;
      case 'axios':
        return `// Axios Client
import axios from 'axios';

const response = await axios({
  method: '${method.toLowerCase()}',
  url: '${url}',
  headers: {
    'Accept': 'application/json',${
      hasBody ? "\n    'Content-Type': 'application/json'," : ''
    }
  },${hasBody ? '\n  data: {},' : ''}
});
console.log(response.data);`;
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    toast.success('Code Snippet Copied');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPath = () => {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl);
    setCopiedPath(true);
    toast.info('Endpoint URL Copied', fullUrl);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  // Mock Dispatcher Execution Simulator
  const handleDispatchMock = async () => {
    if (!selectedEndpoint) return;
    setIsDispatching(true);
    setActiveTab('sandbox');

    // Simulate realistic sub-15ms local engine latency
    await new Promise((resolve) => setTimeout(resolve, 220));

    const sampleResponseKeys = Object.keys(selectedEndpoint.responses);
    const primaryStatus = sampleResponseKeys.find((k) => k.startsWith('2')) || '200';
    const statusCode = parseInt(primaryStatus, 10) || 200;

    const mockPayload: Record<string, any> = {
      endpoint: selectedEndpoint.path,
      method: selectedEndpoint.method,
      status: statusCode,
      success: statusCode >= 200 && statusCode < 300,
      timestamp: new Date().toISOString(),
      latency: '11.8ms',
      parameters: selectedEndpoint.parameters.reduce((acc, p) => {
        acc[p.name] = p.example || (p.required ? 'provided' : 'optional');
        return acc;
      }, {} as Record<string, any>),
    };

    setSandboxResponse({
      status: statusCode,
      statusText: statusCode === 200 ? 'OK' : statusCode === 201 ? 'Created' : 'Accepted',
      durationMs: 12,
      timestamp: new Date().toLocaleTimeString(),
      data: mockPayload,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-powered-by': 'API Atlas Local Runtime',
        'x-contract-target': currentProject.specType,
        'cache-control': 'no-cache',
      },
    });

    setIsDispatching(false);
    toast.success('Mock Request Executed', `${selectedEndpoint.method} ${selectedEndpoint.path}`);
  };

  const methodsList = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden font-sans bg-[#080C16] w-full min-w-0">
      {/* Workspace Subheader Bar */}
      <div className="h-14 border-b border-[#224870]/70 bg-[#0A101D] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 select-none w-full min-w-0">
        {/* Left: Project Selector & Specs */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Project Switcher Dropdown */}
          <div className="relative" ref={projectDropdownRef}>
            <button
              type="button"
              onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
              className="h-9 px-3 rounded-xl bg-[#142034] border border-[#224870] hover:border-[#4EA5D9] text-[#F4F7FB] transition-all flex items-center gap-2 shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4EA5D9]"
              title="Switch Workspace Project"
              aria-label="Switch Workspace Project"
            >
              <FileCode2 className="w-4 h-4 text-[#44CFCB] shrink-0" />
              <span className="text-xs sm:text-sm font-bold truncate max-w-[140px] sm:max-w-xs">
                {currentProject.name}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#9BB0CC] transition-transform duration-200 shrink-0 ${
                  isProjectDropdownOpen ? 'rotate-180 text-[#44CFCB]' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProjectDropdownOpen && (
              <div
                role="listbox"
                className="absolute left-0 mt-1.5 w-64 rounded-xl bg-[#0E1726]/95 backdrop-blur-xl border border-[#224870] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#627898] uppercase tracking-wider border-b border-[#224870]/60">
                  Switch Contract Workspace
                </div>
                <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                  {availableProjects.map((p) => {
                    const isSelected = p.id === currentProject.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setCurrentProject(p);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#142034] text-[#44CFCB] font-semibold'
                            : 'text-[#E2EAF4] hover:text-[#44CFCB] hover:bg-[#142034]/70'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate font-semibold">{p.name}</p>
                          <span className="text-[10px] text-[#9BB0CC] font-mono">
                            v{p.version} • {p.endpointsCount} endpoints
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#44CFCB] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1 border-t border-[#224870]/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setIsImportModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-[#4EA5D9] hover:text-[#44CFCB] hover:bg-[#142034] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>Import New Contract...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Badges: Version & Spec Target */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase bg-[#142034] text-[#4EA5D9] border border-[#224870]">
              v{currentProject.version}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#142034] text-[#9BB0CC] border border-[#224870]">
              {currentProject.specType.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Center: Server Host Selector */}
        {servers.length > 0 && (
          <div className="hidden md:flex items-center gap-2 text-xs font-mono">
            <div className="relative" ref={serverDropdownRef}>
              <button
                type="button"
                onClick={() => setIsServerDropdownOpen((prev) => !prev)}
                className="h-8 px-2.5 rounded-lg bg-[#142034] border border-[#224870] hover:border-[#4EA5D9] text-[#9BB0CC] hover:text-[#F4F7FB] transition-all flex items-center gap-1.5 cursor-pointer"
                title="Select Gateway Host"
              >
                <Server className="w-3 h-3 text-[#44CFCB]" />
                <span className="truncate max-w-[200px] text-xs">
                  {currentServerUrl}
                </span>
                {servers.length > 1 && (
                  <ChevronDown className="w-3 h-3 text-[#9BB0CC]" />
                )}
              </button>

              {servers.length > 1 && isServerDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-[#0E1726]/95 backdrop-blur-xl border border-[#224870] shadow-xl p-1 z-50">
                  {servers.map((srv, idx) => (
                    <button
                      key={srv.url}
                      type="button"
                      onClick={() => {
                        setSelectedServerIndex(idx);
                        setIsServerDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                        selectedServerIndex === idx
                          ? 'bg-[#142034] text-[#44CFCB]'
                          : 'text-[#E2EAF4] hover:bg-[#142034]/70'
                      }`}
                    >
                      <p className="truncate font-semibold">{srv.url}</p>
                      {srv.description && (
                        <p className="text-[10px] text-[#9BB0CC] truncate font-sans">
                          {srv.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right: Endpoints Count & Dashboard link */}
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#142034] border border-[#224870] text-[#E2EAF4]">
            <Layers className="w-3.5 h-3.5 text-[#4EA5D9]" />
            <span>{endpoints.length} Endpoints</span>
          </span>

          <a href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl text-xs font-medium cursor-pointer"
            >
              Back to Dashboard
            </Button>
          </a>
        </div>
      </div>

      {/* Main Split Layout: Left Endpoint Explorer & Right Inspector */}
      <div className="flex-1 flex overflow-hidden w-full min-w-0">
        {/* Left endpoint list panel */}
        <aside
          aria-label="API Endpoints Navigation"
          className="w-72 sm:w-80 lg:w-88 border-r border-[#224870]/70 bg-[#070B13] flex flex-col shrink-0 overflow-hidden select-none"
        >
          {/* Search & Method Filters */}
          <div className="p-3.5 border-b border-[#224870]/50 space-y-2.5 bg-[#0A101D]">
            <div className="relative">
              <Input
                placeholder="Filter endpoints by path or summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefixIcon={<Search className="w-3.5 h-3.5 text-[#9BB0CC]" />}
                className="text-xs py-2 bg-[#142034] border-[#224870] text-[#F4F7FB] focus:border-[#4EA5D9] h-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9BB0CC] hover:text-[#F4F7FB] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Themed Method Selector Dropdown */}
            <div className="relative z-30" ref={methodDropdownRef}>
              <button
                type="button"
                onClick={() => setIsMethodDropdownOpen((prev) => !prev)}
                className="w-full h-9 px-3 rounded-xl bg-[#142034] border border-[#224870] hover:border-[#4EA5D9] text-xs font-medium text-[#E2EAF4] transition-all flex items-center justify-between shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4EA5D9]"
                aria-haspopup="listbox"
                aria-expanded={isMethodDropdownOpen}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#9BB0CC] uppercase tracking-wider">
                    Method:
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      selectedMethod === 'ALL' ? 'text-[#F4F7FB]' : 'text-[#44CFCB]'
                    }`}
                  >
                    {selectedMethod === 'ALL' ? 'ALL METHODS' : selectedMethod}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0A101D] text-[#4EA5D9] border border-[#224870]/70">
                    {selectedMethod === 'ALL'
                      ? endpoints.length
                      : endpoints.filter((ep) => ep.method === selectedMethod).length}{' '}
                    endpoints
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#9BB0CC] transition-transform duration-200 pointer-events-none ${
                      isMethodDropdownOpen ? 'rotate-180 text-[#44CFCB]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Themed Dropdown Menu */}
              {isMethodDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-[#0E1726]/95 backdrop-blur-xl border border-[#224870] shadow-2xl shadow-[#040810] p-1.5 z-50 font-sans"
                >
                  {methodsList.map((m) => {
                    const count =
                      m === 'ALL'
                        ? endpoints.length
                        : endpoints.filter((ep) => ep.method === m).length;
                    const isSelected = selectedMethod === m;

                    return (
                      <button
                        key={m}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setSelectedMethod(m);
                          setIsMethodDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#142034] text-[#44CFCB]'
                            : 'text-[#E2EAF4] hover:text-[#44CFCB] hover:bg-[#142034]/70'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{m === 'ALL' ? 'ALL METHODS' : m}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#44CFCB]" />}
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#0A101D] text-[#9BB0CC] border border-[#224870]/60">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Endpoints List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {filteredEndpoints.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9BB0CC] space-y-2">
                <p>No endpoints match your search filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMethod('ALL');
                  }}
                  className="text-xs text-[#4EA5D9] hover:text-[#44CFCB] underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredEndpoints.map((ep) => {
                const isSelected = selectedEndpoint?.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    type="button"
                    onClick={() => {
                      setSelectedEndpointId(ep.id);
                      setSandboxResponse(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#18263D] border border-[#4EA5D9]/60 shadow-md ring-1 ring-[#4EA5D9]/20'
                        : 'hover:bg-[#142034]/60 border border-transparent text-[#9BB0CC]'
                    }`}
                  >
                    <Badge
                      variant={getMethodVariant(ep.method)}
                      className="text-[10px] px-2 py-0.5 shrink-0 mt-0.5 font-bold uppercase tracking-wider"
                    >
                      {ep.method}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-mono font-semibold truncate ${
                          isSelected ? 'text-[#F4F7FB]' : 'text-[#E2EAF4]'
                        }`}
                      >
                        {ep.path}
                      </p>
                      {ep.summary && (
                        <p className="text-[11px] text-[#9BB0CC] truncate mt-0.5 font-sans">
                          {ep.summary}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Endpoint Inspector & Sandbox */}
        <section
          aria-label="Endpoint Details & Simulator"
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-[#080C16] p-4 sm:p-6 lg:p-8 space-y-6"
        >
          {selectedEndpoint ? (
            <div className="w-full max-w-5xl mx-auto space-y-6 min-w-0">
              {/* Hero Endpoint Header Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0E1726]/90 border border-[#224870]/80 shadow-md space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#224870]/60">
                  <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                    <Badge
                      variant={getMethodVariant(selectedEndpoint.method)}
                      className="text-xs px-2.5 py-1 font-mono font-bold tracking-wider shrink-0 uppercase"
                    >
                      {selectedEndpoint.method}
                    </Badge>
                    <span className="font-mono text-sm sm:text-base lg:text-lg font-bold text-[#F4F7FB] tracking-wide break-all">
                      {selectedEndpoint.path}
                    </span>
                    {selectedEndpoint.operationId && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono text-[#9BB0CC] bg-[#142034] border border-[#224870] truncate max-w-[200px]">
                        {selectedEndpoint.operationId}
                      </span>
                    )}
                  </div>

                  {/* Actions: Copy URL & Send Mock Request */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyPath}
                      className="h-9 px-3 rounded-xl bg-[#142034] border border-[#224870] hover:border-[#4EA5D9] text-xs font-medium text-[#E2EAF4] hover:text-[#44CFCB] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Copy Full URL"
                    >
                      {copiedPath ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleDispatchMock}
                      disabled={isDispatching}
                      className="h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-[#44CFCB]" />
                      <span>{isDispatching ? 'Running...' : 'Send Request'}</span>
                    </Button>
                  </div>
                </div>

                {/* Summary & Description */}
                <div>
                  {selectedEndpoint.summary && (
                    <h2 className="text-sm sm:text-base font-semibold text-[#F4F7FB]">
                      {selectedEndpoint.summary}
                    </h2>
                  )}

                  {selectedEndpoint.description && (
                    <p className="mt-1 text-xs sm:text-sm text-[#9BB0CC] leading-relaxed">
                      {selectedEndpoint.description}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {selectedEndpoint.tags.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-xs text-[#627898] flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Tags:</span>
                    </span>
                    {selectedEndpoint.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[11px] bg-[#142034] text-[#9BB0CC] border-[#224870]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Inspector Tabs */}
              <div className="space-y-4 min-w-0">
                <div className="flex items-center gap-1 border-b border-[#224870]/70 pb-px overflow-x-auto no-scrollbar">
                  {[
                    {
                      id: 'parameters',
                      label: 'Parameters',
                      count: selectedEndpoint.parameters.length,
                    },
                    {
                      id: 'body',
                      label: 'Request Body',
                      count: selectedEndpoint.requestBody ? 1 : 0,
                    },
                    {
                      id: 'responses',
                      label: 'Responses',
                      count: Object.keys(selectedEndpoint.responses).length,
                    },
                    {
                      id: 'code',
                      label: 'Code / Snippets',
                    },
                    {
                      id: 'sandbox',
                      label: 'Live Mock Response',
                      badge: sandboxResponse ? 'Active' : undefined,
                    },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`inline-flex items-center gap-2 text-xs font-semibold px-3.5 sm:px-4 py-2.5 rounded-t-xl transition-all cursor-pointer border-b-2 -mb-px shrink-0 whitespace-nowrap ${
                          isActive
                            ? 'border-[#44CFCB] text-[#44CFCB] bg-[#0E1726]/60 font-bold'
                            : 'border-transparent text-[#9BB0CC] hover:text-[#F4F7FB] hover:border-[#224870]'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {typeof tab.count === 'number' && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                              isActive
                                ? 'bg-[#142034] text-[#44CFCB]'
                                : 'bg-[#142034] text-[#627898]'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                        {tab.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Parameters */}
                {activeTab === 'parameters' && (
                  <div className="space-y-3 min-w-0">
                    {selectedEndpoint.parameters.length === 0 ? (
                      <div className="p-8 sm:p-12 rounded-2xl border border-dashed border-[#224870] text-center text-xs sm:text-sm text-[#9BB0CC] bg-[#0E1726]/40 min-h-[160px] flex items-center justify-center">
                        No path, query, or header parameters required for this endpoint.
                      </div>
                    ) : (
                      <div className="overflow-x-auto no-scrollbar rounded-2xl border border-[#224870]/80 bg-[#0E1726]/90 shadow-sm w-full">
                        <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                          <thead className="bg-[#142034] text-[#9BB0CC] border-b border-[#224870] font-mono text-xs">
                            <tr>
                              <th className="py-3 px-4 font-semibold">Parameter</th>
                              <th className="py-3 px-4 font-semibold">In</th>
                              <th className="py-3 px-4 font-semibold">Type</th>
                              <th className="py-3 px-4 font-semibold">Required</th>
                              <th className="py-3 px-4 font-semibold">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#224870]/40 font-mono text-xs">
                            {selectedEndpoint.parameters.map((param) => (
                              <tr
                                key={`${param.in}-${param.name}`}
                                className="hover:bg-[#142034]/40 transition-colors"
                              >
                                <td className="py-3 px-4 font-bold text-[#44CFCB]">
                                  {param.name}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-[#142034] text-[#9BB0CC] border border-[#224870]">
                                    {param.in}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-[#4EA5D9]">
                                  {param.schemaType || 'string'}
                                </td>
                                <td className="py-3 px-4">
                                  {param.required ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                      Required
                                    </span>
                                  ) : (
                                    <span className="text-[#627898] text-xs">
                                      Optional
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 font-sans text-[#E2EAF4]">
                                  {param.description || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Request Body */}
                {activeTab === 'body' && (
                  <div className="space-y-4 min-w-0">
                    {selectedEndpoint.requestBody ? (
                      <div className="p-5 rounded-2xl border border-[#224870] bg-[#0E1726]/90 space-y-4 min-w-0">
                        <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                          <span className="text-[#9BB0CC] font-semibold">
                            Supported Media Types:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.keys(selectedEndpoint.requestBody.content).map(
                              (ct) => (
                                <span
                                  key={ct}
                                  className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-[#142034] text-[#44CFCB] border border-[#224870]"
                                >
                                  {ct}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        {selectedEndpoint.requestBody.description && (
                          <p className="text-xs sm:text-sm text-[#E2EAF4] leading-relaxed">
                            {selectedEndpoint.requestBody.description}
                          </p>
                        )}

                        <div className="pt-2">
                          <span className="text-xs font-semibold text-[#9BB0CC] mb-2 block">
                            Schema Definition / Payload Structure
                          </span>
                          <pre className="p-4 rounded-xl bg-[#080D18] border border-[#224870] font-mono text-xs text-[#4EA5D9] overflow-x-auto no-scrollbar leading-relaxed">
                            {JSON.stringify(
                              selectedEndpoint.requestBody.content[
                                Object.keys(
                                  selectedEndpoint.requestBody.content
                                )[0]
                              ]?.schema || { type: 'object' },
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl border border-dashed border-[#224870] text-center text-xs sm:text-sm text-[#9BB0CC] bg-[#0E1726]/40">
                        This endpoint does not accept a request body.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Responses */}
                {activeTab === 'responses' && (
                  <div className="space-y-3">
                    {Object.keys(selectedEndpoint.responses).length === 0 ? (
                      <div className="p-8 rounded-2xl border border-dashed border-[#224870] text-center text-xs sm:text-sm text-[#9BB0CC] bg-[#0E1726]/40">
                        No responses defined for this contract operation.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(selectedEndpoint.responses).map(
                          ([code, resp]) => (
                            <div
                              key={code}
                              className="p-4 rounded-2xl border border-[#224870] bg-[#0E1726]/90 flex items-start gap-3.5 hover:border-[#4EA5D9]/50 transition-colors"
                            >
                              <Badge
                                variant={
                                  code.startsWith('2')
                                    ? 'success'
                                    : code.startsWith('4')
                                      ? 'warning'
                                      : 'danger'
                                }
                                className="font-mono text-xs font-bold px-2.5 py-1 shrink-0"
                              >
                                {code}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs sm:text-sm text-[#F4F7FB]">
                                  {resp.description || 'Response definition'}
                                </p>
                                {resp.content && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {Object.keys(resp.content).map((ct) => (
                                      <span
                                        key={ct}
                                        className="text-[10px] font-mono text-[#9BB0CC] bg-[#142034] px-2 py-0.5 rounded border border-[#224870]"
                                      >
                                        {ct}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 4: Code & SDK Snippets */}
                {activeTab === 'code' && (
                  <div className="space-y-3">
                    {/* Language selector pills */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-[#0E1726] p-1 rounded-xl border border-[#224870]">
                        {(
                          [
                            { id: 'curl', label: 'cURL' },
                            { id: 'fetch', label: 'JavaScript' },
                            { id: 'python', label: 'Python' },
                            { id: 'axios', label: 'Node.js' },
                          ] as const
                        ).map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => setCodeLang(l.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              codeLang === l.id
                                ? 'bg-[#224870] text-[#44CFCB] font-bold shadow-xs'
                                : 'text-[#9BB0CC] hover:text-[#F4F7FB]'
                            }`}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleCopyCode(
                            generateSnippet(codeLang, selectedEndpoint)
                          )
                        }
                        className="h-8 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#4EA5D9]" />
                            <span className="text-[#E2EAF4]">Copy Code</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-[#224870] bg-[#080D18] p-4 font-mono text-xs text-[#E2EAF4] leading-relaxed overflow-x-auto no-scrollbar shadow-inner">
                      <pre className="no-scrollbar">{generateSnippet(codeLang, selectedEndpoint)}</pre>
                    </div>
                  </div>
                )}

                {/* Tab 5: Live Mock Response Simulator */}
                {activeTab === 'sandbox' && (
                  <div className="space-y-4">
                    {sandboxResponse ? (
                      <div className="p-5 rounded-2xl border border-[#224870] bg-[#0E1726]/90 space-y-4">
                        {/* Status bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#224870]/60">
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {sandboxResponse.status} {sandboxResponse.statusText}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-mono text-[#44CFCB]">
                              <Zap className="w-3.5 h-3.5" />
                              <span>{sandboxResponse.durationMs}ms</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#9BB0CC]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Executed at {sandboxResponse.timestamp}</span>
                          </div>
                        </div>

                        {/* Headers */}
                        <div>
                          <span className="text-xs font-semibold text-[#9BB0CC] mb-1.5 block">
                            Response Headers:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-[#080D18] p-3 rounded-xl border border-[#224870]/80">
                            {Object.entries(sandboxResponse.headers).map(
                              ([h, v]) => (
                                <div key={h} className="truncate">
                                  <span className="text-[#4EA5D9]">{h}: </span>
                                  <span className="text-[#E2EAF4]">{v}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* JSON Payload */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-[#9BB0CC]">
                              Response Body (JSON):
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  JSON.stringify(sandboxResponse.data, null, 2)
                                );
                                toast.success('JSON Copied to Clipboard');
                              }}
                              className="text-xs text-[#4EA5D9] hover:text-[#44CFCB] flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy JSON</span>
                            </button>
                          </div>
                          <pre className="p-4 rounded-xl bg-[#080D18] border border-[#224870] font-mono text-xs text-[#F4F7FB] overflow-x-auto no-scrollbar leading-relaxed">
                            {JSON.stringify(sandboxResponse.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 sm:p-12 rounded-2xl border border-dashed border-[#224870] text-center bg-[#0E1726]/40 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#142034] border border-[#224870] flex items-center justify-center mx-auto text-[#44CFCB]">
                          <Zap className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#F4F7FB]">
                            Local Mock Engine Ready
                          </h3>
                          <p className="mt-1 text-xs text-[#9BB0CC] max-w-md mx-auto">
                            Dispatch a zero-latency mock request against this contract endpoint to verify parameter handling and inspect deterministic response headers.
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="md"
                          onClick={handleDispatchMock}
                          disabled={isDispatching}
                          className="text-xs font-semibold px-5 h-10 rounded-xl cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current text-[#44CFCB]" />
                          <span>Dispatch Mock Request</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#9BB0CC]">
              Select an endpoint from the left navigation panel.
            </div>
          )}
        </section>
      </div>

      {/* Import Specification Modal */}
      <ImportSpecModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(newId) => {
          window.location.href = `/workspace/${newId}`;
        }}
      />
    </div>
  );
};
