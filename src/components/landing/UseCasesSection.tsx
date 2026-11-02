import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import {
  Terminal,
  Code2,
  Layers,
  FileText,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

interface UseCaseCapability {
  title: string;
  detail: string;
}

interface UseCaseRole {
  id: string;
  roleName: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  capabilities: UseCaseCapability[];
  snippetFile: string;
  snippetLanguage: string;
  snippetContent: string;
  statusBar: {
    left: string;
    right: string;
  };
}

const USE_CASES: UseCaseRole[] = [
  {
    id: 'backend',
    roleName: 'Backend Developers',
    tag: 'SERVER & GATEWAY ENGINEERS',
    icon: Terminal,
    title: 'Validate Contract Boundaries Before Deploying Handlers',
    capabilities: [
      {
        title: 'Parameter Requirement Audits',
        detail: 'Detects missing path parameters, query flags, and required headers in real time',
      },
      {
        title: 'Synthesized cURL Execution',
        detail: 'Generates ready-to-run terminal commands pre-populated with headers and mock payloads',
      },
      {
        title: 'Sub-15ms Local Validation',
        detail: 'Direct in-memory AST execution without booting heavy gateways or network dependencies',
      },
      {
        title: 'Orphaned Route Guard',
        detail: 'Catches undeclared status codes, unmapped paths, and broken schema references early',
      },
    ],
    snippetFile: 'verify-route.sh',
    snippetLanguage: 'bash',
    snippetContent: `# Synthesize and verify cURL request locally
curl -X POST http://localhost:8080/v1/charges \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 4900, "currency": "usd"}'

# Response: 201 Created (11ms) • 0 Schema Errors`,
    statusBar: {
      left: '● 0 Schema Errors • Local AST',
      right: 'Client-side verification',
    },
  },
  {
    id: 'frontend',
    roleName: 'Frontend Developers',
    tag: 'CLIENT & APPLICATION ENGINEERS',
    icon: Code2,
    title: 'Prototype Client State with Verified Payload Shapes',
    capabilities: [
      {
        title: 'Deep Model Traversal',
        detail: 'Inspects full object hierarchy, optional properties, and nested array types',
      },
      {
        title: 'Strict TypeScript Types',
        detail: 'Extracts exact payload interfaces matching backend model definitions',
      },
      {
        title: 'Instant Mock Payloads',
        detail: 'One-click deterministic JSON fixtures ready for UI components and storybooks',
      },
      {
        title: 'Entity Relationship Mesh',
        detail: 'Traces cross-domain model references before server handlers are deployed',
      },
    ],
    snippetFile: 'types/charge.ts',
    snippetLanguage: 'typescript',
    snippetContent: `export interface ChargeEntity {
  id: string; // pattern: ^ch_[a-zA-Z0-9]+$
  status: 'pending' | 'succeeded' | 'failed';
  amount: number; // integer (cents)
  currency: 'usd' | 'eur' | 'gbp';
  receipt_url: string;
  created_at: string; // ISO-8601
}`,
    statusBar: {
      left: '✓ 1 Interface Generated • 0 Any Types',
      right: 'Strict TypeScript',
    },
  },
  {
    id: 'platform',
    roleName: 'API Platform Teams',
    tag: 'PLATFORM & ARCHITECTURE',
    icon: Layers,
    title: 'Maintain Contract Governance Across Services',
    capabilities: [
      {
        title: 'Specification Diff Engine',
        detail: 'Compares staging vs production contracts side-by-side with clear change markers',
      },
      {
        title: 'Breaking Change Alerts',
        detail: 'Flags removed parameters, altered type signatures, and deprecated routes',
      },
      {
        title: 'Topology Reference Graphs',
        detail: 'Visualizes microservice boundaries, shared schemas, and $ref bindings',
      },
      {
        title: 'Zero-Telemetry Sandbox',
        detail: '100% local in-browser memory execution with zero cloud storage or external leaks',
      },
    ],
    snippetFile: 'contract.diff',
    snippetLanguage: 'diff',
    snippetContent: `@@ Contract Revision: v1.2.0 -> v1.3.0 @@
+ [ADDED]   POST /v1/charges/batch (operationId: batchCharges)
- [REMOVED] query param "legacy_source" from /v1/charges
~ [MODIFIED] field "amount": integer -> number
! [AUDIT]   1 breaking change detected in public perimeter`,
    statusBar: {
      left: '⚠ 1 Breaking Change Flagged',
      right: 'Semantic Diff Engine',
    },
  },
  {
    id: 'docs',
    roleName: 'Technical Documentation',
    tag: 'DOCS & DEVELOPER RELATIONS',
    icon: FileText,
    title: 'Eliminate Manual Documentation Drift & Stale Samples',
    capabilities: [
      {
        title: 'Auto-Indexed Directory',
        detail: 'Instant keyboard-driven fuzzy search across paths, HTTP methods, and tags',
      },
      {
        title: 'Interactive Playground',
        detail: 'In-browser sandbox allowing API consumers to dispatch simulated requests immediately',
      },
      {
        title: 'Single Source of Truth',
        detail: 'Generates up-to-date documentation directly from OpenAPI contracts without manual sync',
      },
      {
        title: 'Standard Header Synthesis',
        detail: 'Pre-configures authentication schemes, content headers, and parameter definitions',
      },
    ],
    snippetFile: 'openapi.yaml',
    snippetLanguage: 'yaml',
    snippetContent: `paths:
  /v1/charges/{id}:
    get:
      summary: Retrieve charge details
      tags: [Charges]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }`,
    statusBar: {
      left: '● Spec Synced • 100% Verified',
      right: 'OpenAPI 3.1 AST',
    },
  },
];

const renderSnippetLine = (line: string, language: string) => {
  if (language === 'diff') {
    if (line.startsWith('+')) {
      return (
        <span className="text-[#34D399] bg-[#059669]/15 px-1 py-0.5 rounded block">
          {line}
        </span>
      );
    }
    if (line.startsWith('-')) {
      return (
        <span className="text-[#F87171] bg-[#DC2626]/15 px-1 py-0.5 rounded block">
          {line}
        </span>
      );
    }
    if (line.startsWith('~')) {
      return (
        <span className="text-[#FBBF24] bg-[#D97706]/15 px-1 py-0.5 rounded block">
          {line}
        </span>
      );
    }
    if (line.startsWith('!')) {
      return (
        <span className="text-[#38BDF8] bg-[#0284C7]/15 px-1 py-0.5 rounded font-semibold block">
          {line}
        </span>
      );
    }
    if (line.startsWith('@@')) {
      return <span className="text-[#9BB0CC] font-semibold block">{line}</span>;
    }
    return <span className="text-[#BAE6FD] block">{line}</span>;
  }

  if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
    return <span className="text-[#627898] italic block">{line}</span>;
  }

  if (language === 'typescript') {
    return (
      <span className="text-[#BAE6FD] block">
        {line.split(/(\bexport\b|\binterface\b|\bstring\b|\bnumber\b|\bnull\b)/g).map((chunk, i) => {
          if (chunk === 'export' || chunk === 'interface') {
            return (
              <span key={i} className="text-[#4EA5D9] font-semibold">
                {chunk}
              </span>
            );
          }
          if (chunk === 'string' || chunk === 'number' || chunk === 'null') {
            return (
              <span key={i} className="text-[#44CFCB]">
                {chunk}
              </span>
            );
          }
          return chunk;
        })}
      </span>
    );
  }

  if (language === 'bash') {
    return (
      <span className="text-[#BAE6FD] block">
        {line.split(/(\bcurl\b|-X|-H|-d)/g).map((chunk, i) => {
          if (chunk === 'curl') {
            return (
              <span key={i} className="text-[#44CFCB] font-bold">
                {chunk}
              </span>
            );
          }
          if (chunk === '-X' || chunk === '-H' || chunk === '-d') {
            return (
              <span key={i} className="text-[#4EA5D9]">
                {chunk}
              </span>
            );
          }
          return chunk;
        })}
      </span>
    );
  }

  if (language === 'yaml') {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1 && !line.trim().startsWith('#')) {
      const key = line.slice(0, colonIdx);
      const val = line.slice(colonIdx);
      return (
        <span className="block">
          <span className="text-[#4EA5D9] font-medium">{key}</span>
          <span className="text-[#44CFCB]">{val}</span>
        </span>
      );
    }
  }

  return <span className="text-[#BAE6FD] block">{line}</span>;
};

export const UseCasesSection: React.FC = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('backend');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const activeRole =
    USE_CASES.find((u) => u.id === selectedRoleId) || USE_CASES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeRole.snippetContent);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 1500);
  };

  const ActiveIcon = activeRole.icon;

  return (
    <section
      id="use-cases"
      className="py-24 border-t border-[#224870]/60 relative bg-[#0A101D] scroll-mt-20 overflow-hidden"
    >
      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#2A4494]/15 via-[#4EA5D9]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <Container size="xl" className="space-y-10">
        {/* Section Heading */}
        <SectionHeading
          eyebrow="TARGETED WORKFLOWS"
          title="Engineered for Every Team in Your API Lifecycle"
        />

        {/* Clean Segmented Role Switcher */}
        <div className="flex justify-center">
          <div
            className="inline-flex p-1.5 rounded-2xl bg-[#0E1726]/90 border border-[#224870]/70 backdrop-blur-md shadow-xl max-w-full overflow-x-auto"
            role="tablist"
            aria-label="API Atlas Role Navigation"
          >
            {USE_CASES.map((item) => {
              const Icon = item.icon;
              const isSelected = item.id === selectedRoleId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedRoleId(item.id)}
                  role="tab"
                  aria-selected={isSelected}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl font-sans text-xs sm:text-sm font-medium flex items-center gap-2.5 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#18263D] to-[#142034] text-[#F4F7FB] border border-[#44CFCB]/50 shadow-lg shadow-[#2A4494]/25 font-semibold'
                      : 'text-[#9BB0CC] hover:text-[#F4F7FB] hover:bg-[#142034]/50 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#0A101D] text-[#44CFCB] border border-[#44CFCB]/40'
                        : 'bg-[#101A2B] text-[#627898]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.roleName}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#44CFCB] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Role Showcase Card */}
        <div className="rounded-3xl bg-gradient-to-b from-[#0E1726] to-[#0A101D] border border-[#224870] p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Corner Glow Accents */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#2A4494]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#44CFCB]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              {/* Header Info */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#142034] border border-[#224870] text-[#4EA5D9] text-[11px] font-mono font-semibold tracking-wider uppercase">
                  <ActiveIcon className="w-3.5 h-3.5 text-[#44CFCB]" />
                  <span>{activeRole.tag}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7FB] tracking-tight leading-snug">
                  {activeRole.title}
                </h3>
              </div>

              {/* Structured Capabilities Matrix */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-semibold text-[#E2EAF4] tracking-wide uppercase flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#4EA5D9]" />
                  <span>Key Workflow Capabilities</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeRole.capabilities.map((cap) => (
                    <div
                      key={cap.title}
                      className="p-3.5 rounded-xl bg-[#080C16] border border-[#224870]/70 hover:border-[#4EA5D9]/50 transition-colors flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#44CFCB] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-[#F4F7FB] font-sans">
                          {cap.title}
                        </div>
                        <div className="text-[11px] text-[#9BB0CC] leading-relaxed">
                          {cap.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="pt-4 border-t border-[#224870]/60 flex flex-wrap items-center justify-between gap-4">
                <a href="/workspace">
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-mono text-xs shadow-lg shadow-[#2A4494]/30"
                  >
                    <span>Inspect In Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </a>
                <span className="text-[11px] font-mono text-[#627898]">
                  Zero configuration • 100% in-browser
                </span>
              </div>
            </div>

            {/* Right Terminal & Contract Inspector Column (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-[#080C16] border border-[#224870] overflow-hidden shadow-2xl flex flex-col justify-between font-mono text-xs">
              {/* Terminal Window Header */}
              <div className="px-4 py-3 bg-[#0E1726] border-b border-[#224870] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:brightness-110 transition-all inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:brightness-110 transition-all inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:brightness-110 transition-all inline-block" />
                  </div>
                  <span className="text-[11px] text-[#BAE6FD] font-semibold pl-1">
                    {activeRole.snippetFile}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#142034] border border-[#224870] text-[10px] text-[#4EA5D9] uppercase font-bold tracking-wider">
                    {activeRole.snippetLanguage}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-[#9BB0CC] hover:text-[#44CFCB] flex items-center gap-1 text-[11px] px-2 py-1 rounded hover:bg-[#142034] transition-colors cursor-pointer"
                    aria-label="Copy snippet code"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#44CFCB]" />
                        <span className="text-[#44CFCB]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Gutter + Highlighted Code Area */}
              <div className="p-4 bg-[#060911] text-[11px] leading-relaxed overflow-x-auto flex-1">
                <div className="flex font-mono min-w-max">
                  {/* Line Numbers */}
                  <div className="select-none pr-4 text-[#3D4F68] text-right font-mono text-[11px] space-y-0.5">
                    {activeRole.snippetContent.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Highlighted Lines */}
                  <div className="flex-1 space-y-0.5">
                    {activeRole.snippetContent.split('\n').map((line, i) => (
                      <div key={i}>
                        {renderSnippetLine(line, activeRole.snippetLanguage)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Terminal Status Bar Footer */}
              <div className="px-4 py-2.5 bg-[#0E1726] border-t border-[#224870]/70 flex items-center justify-between text-[11px] text-[#627898]">
                <span className="text-[#BAE6FD] font-medium flex items-center gap-1.5">
                  {activeRole.statusBar.left}
                </span>
                <span className="text-[#44CFCB] text-[10px] uppercase tracking-wider font-semibold">
                  {activeRole.statusBar.right}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
