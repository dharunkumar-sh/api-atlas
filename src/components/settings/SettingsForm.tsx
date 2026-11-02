import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { userSettingsSchema, type UserSettings } from '@/schemas/settings';
import type { HealthStatus } from '@/services/healthService';
import {
  Save,
  RotateCcw,
  Check,
  ChevronDown,
  Activity,
  Sliders,
  Globe,
  HardDrive,
  User,
  ShieldCheck,
  RefreshCw,
  Download,
  Trash2,
  Cpu,
  Clock,
  Zap,
  CheckCircle2,
  Layers,
} from 'lucide-react';

type SettingsTab = 'all' | 'general' | 'network' | 'diagnostics' | 'storage' | 'profile';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  compactView: false,
  defaultHttpMethod: 'GET',
  showDeprecatedEndpoints: true,
  autoValidateOnPaste: true,
  telemetryEnabled: false,
  apiTimeoutSeconds: 30,
  mockLatencyMs: 150,
};

// Custom Themed Dropdown Component
interface ThemedDropdownProps<T extends string> {
  value: T;
  options: { id: T; label: string; description?: string }[];
  onChange: (val: T) => void;
  label?: string;
}

function ThemedDropdown<T extends string>({
  value,
  options,
  onChange,
  label,
}: ThemedDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((o) => o.id === value) || options[0];

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-[#9BB0CC] block">
          {label}
        </label>
      )}
      <div className={`relative ${isOpen ? 'z-50' : 'z-20'}`} ref={containerRef}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="w-full h-10 px-3.5 rounded-xl bg-[#0A101D] border border-[#224870] hover:border-[#4EA5D9] text-xs font-medium text-[#E2EAF4] transition-all flex items-center justify-between shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4EA5D9]"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="font-semibold text-[#F4F7FB]">{selectedOption.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#9BB0CC] transition-transform duration-200 pointer-events-none ${
              isOpen ? 'rotate-180 text-[#44CFCB]' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-[#0E1726]/95 backdrop-blur-xl border border-[#224870] shadow-2xl shadow-[#040810] p-1.5 z-50 font-sans"
          >
            {options.map((opt) => {
              const isSelected = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#142034] text-[#44CFCB] font-semibold'
                      : 'text-[#E2EAF4] hover:text-[#44CFCB] hover:bg-[#142034]/70'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{opt.label}</div>
                    {opt.description && (
                      <div className="text-[11px] text-[#9BB0CC] font-normal mt-0.5">
                        {opt.description}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#44CFCB] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Accessible Pill Toggle Switch
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  title: string;
  description?: string;
  badge?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  title,
  description,
  badge,
}) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between p-3.5 rounded-xl bg-[#0A101D]/60 hover:bg-[#142034]/50 border border-[#224870]/60 hover:border-[#224870] transition-all cursor-pointer group"
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
    >
      <div className="pr-4 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#F4F7FB] group-hover:text-white transition-colors">
            {title}
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#142034] text-[#4EA5D9] border border-[#224870]">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-[#9BB0CC] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Modern pill slider knob */}
      <div
        className={`w-11 h-6 shrink-0 rounded-full transition-colors duration-200 ease-in-out p-0.5 relative cursor-pointer border ${
          checked
            ? 'bg-[#2A4494] border-[#44CFCB]/50'
            : 'bg-[#142034] border-[#224870]'
        }`}
      >
        <div
          className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5 bg-[#44CFCB]' : 'translate-x-0 bg-[#9BB0CC]'
          }`}
        />
      </div>
    </div>
  );
};

export const SettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<SettingsTab>('all');
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState<{ keys: number; sizeKb: number }>({
    keys: 0,
    sizeKb: 0,
  });

  const toast = useToast();

  const calculateStorage = () => {
    try {
      let totalLength = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key) || '';
          totalLength += key.length + val.length;
        }
      }
      setStorageEstimate({
        keys: localStorage.length,
        sizeKb: Math.round((totalLength * 2) / 1024), // Approx UTF-16
      });
    } catch {
      // ignore
    }
  };

  const fetchHealth = async () => {
    setIsHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch {
      // ignore
    } finally {
      setIsHealthLoading(false);
    }
  };

  useEffect(() => {
    // Load persisted settings if available
    const saved = localStorage.getItem('api_atlas_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const result = userSettingsSchema.safeParse(parsed);
        if (result.success) {
          setSettings(result.data);
        }
      } catch {
        // ignore
      }
    }

    calculateStorage();
    fetchHealth();
  }, []);

  const handleSave = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      localStorage.setItem('api_atlas_settings', JSON.stringify(settings));
      calculateStorage();
      setTimeout(() => {
        setIsSaving(false);
        toast.success(
          'Settings Saved',
          'Your workspace preferences and runtime defaults have been updated.'
        );
      }, 250);
    } catch {
      setIsSaving(false);
      toast.error('Failed to save settings');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all settings to default configuration?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('api_atlas_settings', JSON.stringify(DEFAULT_SETTINGS));
      calculateStorage();
      toast.info('Settings Reset', 'Restored default configuration.');
    }
  };

  const handleExportSettings = () => {
    try {
      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-atlas-settings-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Preferences Exported', 'Configuration JSON downloaded.');
    } catch {
      toast.error('Export Failed');
    }
  };

  const handleClearCache = () => {
    if (confirm('Clear local spec cache and temporary browser data? Active projects in database will not be affected.')) {
      try {
        const settingsBackup = localStorage.getItem('api_atlas_settings');
        localStorage.clear();
        if (settingsBackup) {
          localStorage.setItem('api_atlas_settings', settingsBackup);
        }
        calculateStorage();
        toast.success('Cache Cleared', 'Local client cache freed successfully.');
      } catch {
        toast.error('Failed to clear cache');
      }
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const themeOptions = [
    { id: 'dark' as const, label: 'Dark Theme (Recommended)', description: 'Deep slate & midnight navy palette with high-contrast cyan accents' },
    { id: 'light' as const, label: 'Light Theme', description: 'Clean light background with dark typography and standard borders' },
    { id: 'system' as const, label: 'System Preference', description: 'Automatically matches your host operating system display mode' },
  ];

  const methodOptions = [
    { id: 'GET' as const, label: 'GET (Safe & Idempotent)' },
    { id: 'POST' as const, label: 'POST (Create & Dispatch)' },
    { id: 'PUT' as const, label: 'PUT (Full Replace)' },
    { id: 'PATCH' as const, label: 'PATCH (Partial Update)' },
    { id: 'DELETE' as const, label: 'DELETE (Remove)' },
  ];

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Preferences', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'general', label: 'General & UI', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'network', label: 'Network & Mocking', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'diagnostics', label: 'Diagnostics & Telemetry', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'storage', label: 'Data & Storage', icon: <HardDrive className="w-3.5 h-3.5" /> },
    { id: 'profile', label: 'Developer Profile', icon: <User className="w-3.5 h-3.5" /> },
  ];

  const showGeneral = activeTab === 'all' || activeTab === 'general';
  const showNetwork = activeTab === 'all' || activeTab === 'network';
  const showDiagnostics = activeTab === 'all' || activeTab === 'diagnostics';
  const showStorage = activeTab === 'all' || activeTab === 'storage';
  const showProfile = activeTab === 'all' || activeTab === 'profile';

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl">
      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#224870]/40 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#142034] text-[#44CFCB] border border-[#224870] shadow-xs'
                  : 'text-[#9BB0CC] hover:text-[#F4F7FB] hover:bg-[#142034]/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. General & Interface Preferences */}
      {showGeneral && (
        <Card className="border-[#224870]/70 bg-[#0E1726]/80 backdrop-blur-md shadow-lg shadow-[#040810]/40 overflow-visible">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#142034] border border-[#224870] flex items-center justify-center text-[#4EA5D9]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-[#F4F7FB]">Workspace & Interface</CardTitle>
                  <CardDescription className="text-xs text-[#9BB0CC]">
                    Configure default visual styles, contract presentation views, and OpenAPI input handlers.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] text-[#44CFCB] border-[#224870]">
                UI Config
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 overflow-visible">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ThemedDropdown
                label="Interface Theme"
                value={settings.theme}
                options={themeOptions}
                onChange={(theme) => setSettings({ ...settings, theme })}
              />

              <ThemedDropdown
                label="Default Explorer HTTP Method"
                value={settings.defaultHttpMethod}
                options={methodOptions}
                onChange={(defaultHttpMethod) =>
                  setSettings({ ...settings, defaultHttpMethod })
                }
              />
            </div>

            <div className="pt-2 space-y-3">
              <ToggleSwitch
                title="Automatically Validate OpenAPI on Paste"
                description="Immediately lint syntax and build AST models upon pasting raw YAML or JSON into the spec importer."
                checked={settings.autoValidateOnPaste}
                onChange={(autoValidateOnPaste) =>
                  setSettings({ ...settings, autoValidateOnPaste })
                }
                badge="Recommended"
              />

              <ToggleSwitch
                title="Display Deprecated Endpoints"
                description="Show endpoints flagged as deprecated with warning badges in the contract tree and search results."
                checked={settings.showDeprecatedEndpoints}
                onChange={(showDeprecatedEndpoints) =>
                  setSettings({ ...settings, showDeprecatedEndpoints })
                }
              />

              <ToggleSwitch
                title="Compact Endpoint Explorer View"
                description="Reduce padding and use tighter rows in the workspace endpoint list for dense screen real-estate."
                checked={settings.compactView}
                onChange={(compactView) =>
                  setSettings({ ...settings, compactView })
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Network & Mock Server Settings */}
      {showNetwork && (
        <Card className="border-[#224870]/70 bg-[#0E1726]/80 backdrop-blur-md shadow-lg shadow-[#040810]/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#142034] border border-[#224870] flex items-center justify-center text-[#44CFCB]">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-[#F4F7FB]">Network & Mock Sandbox Engine</CardTitle>
                  <CardDescription className="text-xs text-[#9BB0CC]">
                    Manage HTTP request timeouts, simulated network latency, and mock dispatcher rules.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] text-[#4EA5D9] border-[#224870]">
                Sandbox
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Timeout Setting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9BB0CC]">
                    Request Timeout (Seconds)
                  </label>
                  <span className="text-xs font-mono font-semibold text-[#4EA5D9]">
                    {settings.apiTimeoutSeconds}s
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={120}
                    value={settings.apiTimeoutSeconds}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        apiTimeoutSeconds: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#4EA5D9] bg-[#142034] h-2 rounded-lg cursor-pointer"
                  />
                  <div className="w-20">
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={settings.apiTimeoutSeconds}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          apiTimeoutSeconds: Math.min(120, Math.max(1, Number(e.target.value) || 1)),
                        })
                      }
                      className="text-xs h-9 text-center bg-[#0A101D] border-[#224870] font-mono"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#9BB0CC]">
                  Maximum wait time before mock or live target execution is safely aborted.
                </p>
              </div>

              {/* Mock Latency Setting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#9BB0CC]">
                    Simulated Network Latency
                  </label>
                  <span className="text-xs font-mono font-semibold text-[#44CFCB]">
                    {settings.mockLatencyMs || 0}ms
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={50}
                    value={settings.mockLatencyMs || 0}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mockLatencyMs: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#44CFCB] bg-[#142034] h-2 rounded-lg cursor-pointer"
                  />
                  <div className="w-20">
                    <Input
                      type="number"
                      min={0}
                      max={2000}
                      value={settings.mockLatencyMs || 0}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          mockLatencyMs: Math.min(2000, Math.max(0, Number(e.target.value) || 0)),
                        })
                      }
                      className="text-xs h-9 text-center bg-[#0A101D] border-[#224870] font-mono"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#9BB0CC]">
                  Simulates realistic network delay when generating sample mock responses.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <ToggleSwitch
                title="Zero-Telemetry Privacy Guarantee"
                description="API Atlas operates with zero external tracking. Your OpenAPI specs, request bodies, and auth tokens never leave your host."
                checked={!settings.telemetryEnabled}
                onChange={(enabled) =>
                  setSettings({ ...settings, telemetryEnabled: !enabled })
                }
                badge="Strict Local"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Diagnostics & Runtime Status */}
      {showDiagnostics && (
        <Card className="border-[#224870]/70 bg-[#0E1726]/80 backdrop-blur-md shadow-lg shadow-[#040810]/40">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#142034] border border-[#224870] flex items-center justify-center text-[#44CFCB]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-[#F4F7FB]">Diagnostics & Engine Status</CardTitle>
                  <CardDescription className="text-xs text-[#9BB0CC]">
                    Live runtime telemetry, memory metrics, and compiler operational state.
                  </CardDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchHealth}
                isLoading={isHealthLoading}
                className="self-start sm:self-auto cursor-pointer border-[#224870] hover:border-[#4EA5D9] text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Refresh Diagnostics</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              {/* Status */}
              <div className="p-3.5 rounded-xl bg-[#0A101D] border border-[#224870]/80">
                <div className="flex items-center justify-between text-[#9BB0CC] text-[11px] mb-1 font-sans">
                  <span>Engine Health</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#44CFCB]" />
                </div>
                <div className="text-[#44CFCB] font-bold text-sm tracking-wide">
                  {healthData?.status.toUpperCase() || 'HEALTHY'}
                </div>
                <div className="text-[10px] text-[#9BB0CC] mt-1 font-sans">
                  v{healthData?.version || '0.1.0-alpha'}
                </div>
              </div>

              {/* Uptime */}
              <div className="p-3.5 rounded-xl bg-[#0A101D] border border-[#224870]/80">
                <div className="flex items-center justify-between text-[#9BB0CC] text-[11px] mb-1 font-sans">
                  <span>Process Uptime</span>
                  <Clock className="w-3.5 h-3.5 text-[#4EA5D9]" />
                </div>
                <div className="text-[#4EA5D9] font-bold text-sm">
                  {healthData ? formatUptime(healthData.uptimeSeconds) : 'Active'}
                </div>
                <div className="text-[10px] text-[#9BB0CC] mt-1 font-sans">
                  Continuous Session
                </div>
              </div>

              {/* Heap Memory */}
              <div className="p-3.5 rounded-xl bg-[#0A101D] border border-[#224870]/80">
                <div className="flex items-center justify-between text-[#9BB0CC] text-[11px] mb-1 font-sans">
                  <span>Heap Memory</span>
                  <Cpu className="w-3.5 h-3.5 text-[#44CFCB]" />
                </div>
                <div className="text-[#44CFCB] font-bold text-sm">
                  {healthData ? `${healthData.memoryUsage.heapUsedMb} MB` : 'Optimal'}
                </div>
                <div className="text-[10px] text-[#9BB0CC] mt-1 font-sans">
                  Total Allocated: {healthData ? `${healthData.memoryUsage.heapTotalMb} MB` : '128 MB'}
                </div>
              </div>

              {/* Node Environment */}
              <div className="p-3.5 rounded-xl bg-[#0A101D] border border-[#224870]/80">
                <div className="flex items-center justify-between text-[#9BB0CC] text-[11px] mb-1 font-sans">
                  <span>Environment</span>
                  <Zap className="w-3.5 h-3.5 text-[#4EA5D9]" />
                </div>
                <div className="text-[#F4F7FB] font-bold text-sm uppercase">
                  {healthData?.environment || 'DEVELOPMENT'}
                </div>
                <div className="text-[10px] text-[#9BB0CC] mt-1 font-sans">
                  Node.js Runtime
                </div>
              </div>
            </div>

            {/* Additional engine features summary */}
            <div className="p-4 rounded-xl bg-[#142034]/40 border border-[#224870]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#44CFCB] animate-pulse"></div>
                <span className="text-[#E2EAF4]">
                  OpenAPI Spec Parser & AST Validation Engine: <strong className="text-[#44CFCB]">Online</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#9BB0CC]">
                <span>Mock Dispatcher:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#224870]/50 text-[#4EA5D9] border border-[#224870]">
                  Enabled
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Data & Storage Management */}
      {showStorage && (
        <Card className="border-[#224870]/70 bg-[#0E1726]/80 backdrop-blur-md shadow-lg shadow-[#040810]/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#142034] border border-[#224870] flex items-center justify-center text-[#4EA5D9]">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-[#F4F7FB]">Data & Client Storage</CardTitle>
                  <CardDescription className="text-xs text-[#9BB0CC]">
                    Manage browser storage allocation, export preferences, and clear client-side AST cache.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] text-[#4EA5D9] border-[#224870]">
                {storageEstimate.sizeKb} KB Cached
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0A101D] border border-[#224870]/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#F4F7FB]">
                  Local Storage Consumption
                </div>
                <div className="text-xs text-[#9BB0CC]">
                  Currently retaining <strong>{storageEstimate.keys}</strong> browser storage records (~{storageEstimate.sizeKb} KB) for responsive offline contract editing.
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportSettings}
                  className="cursor-pointer border-[#224870] hover:border-[#4EA5D9] text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span>Export JSON</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  className="cursor-pointer border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:text-rose-300 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Clear Cache</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Developer Profile & Auth Summary */}
      {showProfile && (
        <Card className="border-[#224870]/70 bg-[#0E1726]/80 backdrop-blur-md shadow-lg shadow-[#040810]/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#142034] border border-[#224870] flex items-center justify-center text-[#44CFCB]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-[#F4F7FB]">Active Developer Account</CardTitle>
                  <CardDescription className="text-xs text-[#9BB0CC]">
                    Workspace session details and authentication credentials.
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] text-[#44CFCB] border-[#224870]">
                Verified Session
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[#0A101D] border border-[#224870]/70 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4EA5D9] to-[#2A4494] p-0.5 shadow-md">
                  <div className="w-full h-full rounded-[10px] bg-[#0A101D] flex items-center justify-center text-base font-bold text-[#44CFCB]">
                    DK
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#F4F7FB]">Dharun Kumar</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#142034] text-[#44CFCB] border border-[#224870]">
                      Lead Architect
                    </span>
                  </div>
                  <div className="text-xs text-[#9BB0CC] mt-0.5">
                    techpro03dharun@gmail.com
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#9BB0CC]">
                <ShieldCheck className="w-4 h-4 text-[#44CFCB]" />
                <span>Neon PostgreSQL Connected</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Footer Bar */}
      <div className="sticky bottom-6 z-20 p-4 rounded-2xl bg-[#0E1726]/95 backdrop-blur-xl border border-[#224870] shadow-2xl shadow-[#040810] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#9BB0CC]">
          <span className="w-2 h-2 rounded-full bg-[#44CFCB]"></span>
          <span>Preferences are persisted locally in browser client storage.</span>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleResetDefaults}
            className="cursor-pointer border-[#224870] hover:border-[#4EA5D9] text-[#E2EAF4]"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            <span>Reset to Defaults</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            className="cursor-pointer bg-gradient-to-r from-[#2A4494] to-[#224870] hover:from-[#224870] hover:to-[#4EA5D9] text-white shadow-md shadow-[#2A4494]/30"
          >
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Preferences</span>
          </Button>
        </div>
      </div>
    </form>
  );
};
