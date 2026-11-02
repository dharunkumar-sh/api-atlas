import React, { useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  UploadCloud,
  Compass,
  Play,
  ArrowRight,
  CheckCircle2,
  FileCode2,
  Network,
  Zap,
  Lock,
  Layers,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const handleCopyCurl = () => {
    setCopiedCurl(true);
    navigator.clipboard.writeText(
      'curl -X POST https://api.atlas.dev/v1/charges -H "Content-Type: application/json" -d \'{"amount":4900,"currency":"usd"}\''
    );
    setTimeout(() => setCopiedCurl(false), 1500);
  };

  const steps = [
    {
      num: 1,
      id: 'step-import',
      icon: UploadCloud,
      title: 'Import your OpenAPI specification',
    },
    {
      num: 2,
      id: 'step-explore',
      icon: Compass,
      title: 'Explore endpoints and schemas',
    },
    {
      num: 3,
      id: 'step-test',
      icon: Play,
      title: 'Test requests and understand relationships',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 border-t border-[#224870]/60 bg-[#080C16] relative scroll-mt-20 font-sans"
    >
      <div id="workflow" className="absolute -top-20" />
      <Container size="xl">
        <SectionHeading
          title="From Raw Contract to Verified Integration in Seconds"
          description="A friction-free cycle designed to keep backend and frontend engineers completely aligned on payload structures, routes, and data models."
        />

        {/* 3 Step Selector Buttons - Shrunk to Button Size */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.num;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.num)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 shadow-md ${
                  isActive
                    ? 'bg-[#142034] border-[#44CFCB] shadow-lg shadow-[#2A4494]/20 ring-1 ring-[#44CFCB]/40'
                    : 'bg-[#0E1726] border-[#224870] hover:border-[#4EA5D9]/50 hover:bg-[#101A2B]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#18263D] text-[#44CFCB] border-[#44CFCB]/50'
                      : 'bg-[#142034] text-[#9BB0CC] border-[#224870]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`font-mono text-[10px] font-bold block ${
                      isActive ? 'text-[#44CFCB]' : 'text-[#4EA5D9]'
                    }`}
                  >
                    STEP 0{step.num}
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#F4F7FB] truncate">
                    {step.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Stage Sandbox Display */}
        <div className="mt-12 p-6 md:p-8 rounded-2xl bg-[#0A101D] border border-[#224870] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#224870]/60">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#44CFCB] mb-1">
                <span className="w-2 h-2 rounded-full bg-[#44CFCB] animate-pulse" />
                <span>STEP 0{activeStep} INTERACTIVE SIMULATION</span>
              </div>
              <h4 className="text-lg font-bold text-[#F4F7FB] tracking-tight">
                {steps[activeStep - 1].title}
              </h4>
            </div>
          </div>

          {/* Step 1 Interactive Sandbox */}
          {activeStep === 1 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#0E1726] border border-[#224870] space-y-3">
                <div className="text-[#4EA5D9] font-bold text-xs flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4" />
                  <span>1. Ingestion Sources</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 rounded bg-[#142034] text-[#E2EAF4] border border-[#224870]/80">
                    ✓ Raw JSON / YAML Drag & Drop
                  </div>
                  <div className="p-2 rounded bg-[#142034] text-[#E2EAF4] border border-[#224870]/80">
                    ✓ Remote GitHub / S3 Spec URL
                  </div>
                  <div className="p-2 rounded bg-[#142034] text-[#E2EAF4] border border-[#224870]/80">
                    ✓ In-Browser Textarea Paste
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1726] border border-[#224870] space-y-3">
                <div className="text-[#44CFCB] font-bold text-xs flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>2. Semantic Parser</span>
                </div>
                <div className="p-3 rounded bg-[#0A101D] border border-[#224870]/60 space-y-2 text-[11px]">
                  <div className="flex justify-between text-[#9BB0CC]">
                    <span>Format:</span>
                    <span className="text-[#BAE6FD]">OpenAPI 3.1.0</span>
                  </div>
                  <div className="flex justify-between text-[#9BB0CC]">
                    <span>Parsing Latency:</span>
                    <span className="text-[#44CFCB] font-bold">11.4 ms</span>
                  </div>
                  <div className="flex justify-between text-[#9BB0CC]">
                    <span>Memory Footprint:</span>
                    <span className="text-[#BAE6FD]">0.84 MB</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1726] border border-[#224870] space-y-3">
                <div className="text-[#4EA5D9] font-bold text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>3. Privacy Shield</span>
                </div>
                <p className="text-[11px] text-[#9BB0CC] leading-relaxed">
                  Contracts never leave your machine. No telemetry beacons, no
                  cloud uploads, and zero tracking cookies.
                </p>
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Deterministic In-Memory Isolation</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 Interactive Sandbox */}
          {activeStep === 2 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#0E1726] border border-[#224870] space-y-3">
                <div className="text-[#4EA5D9] font-bold text-xs flex items-center justify-between">
                  <span>Endpoint Contract Inspection</span>
                  <Badge variant="post">POST</Badge>
                </div>
                <div className="font-mono text-sm text-[#F4F7FB] font-semibold">
                  /v1/charges
                </div>
                <p className="text-xs text-[#9BB0CC]">
                  Creates a single-use payment charge intent against an
                  authorized card token.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-[#224870]/60">
                  <div className="text-[11px] font-semibold text-[#BAE6FD]">
                    Required Parameters:
                  </div>
                  <div className="p-2 rounded bg-[#0A101D] border border-[#224870]/40 flex justify-between text-[11px]">
                    <span className="text-[#F4F7FB]">amount *</span>
                    <span className="text-[#44CFCB]">integer (cents)</span>
                  </div>
                  <div className="p-2 rounded bg-[#0A101D] border border-[#224870]/40 flex justify-between text-[11px]">
                    <span className="text-[#F4F7FB]">currency *</span>
                    <span className="text-[#44CFCB]">string (ISO 4217)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1726] border border-[#224870] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#224870]/60 text-xs">
                    <span className="text-[#44CFCB] font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Synthesized Shell cURL</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCurl}
                      className="text-[#9BB0CC] hover:text-[#44CFCB] flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                    >
                      {copiedCurl ? (
                        <Check className="w-3 h-3 text-[#44CFCB]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                    </button>
                  </div>
                  <pre className="mt-3 p-3 rounded-lg bg-[#060A12] border border-[#224870]/40 text-[#BAE6FD] text-[11px] overflow-x-auto leading-relaxed">
                    {`curl -X POST https://api.atlas.dev/v1/charges \\
  -H "Authorization: Bearer sec_tok_948f2a" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 4900,
    "currency": "usd"
  }'`}
                  </pre>
                </div>
                <div className="text-[11px] text-[#627898] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#44CFCB]" />
                  <span>Includes all required headers & sample mock body</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 Interactive Sandbox */}
          {activeStep === 3 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#0E1726] border border-[#224870] space-y-3">
                <div className="text-[#4EA5D9] font-bold text-xs flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>1. Sandbox Execution</span>
                </div>
                <div className="p-3 rounded bg-[#0A101D] border border-[#224870]/60 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#9BB0CC]">Status:</span>
                    <span className="text-emerald-400 font-bold">
                      201 Created
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BB0CC]">Latency:</span>
                    <span className="text-[#44CFCB] font-bold">12 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BB0CC]">Payload:</span>
                    <span className="text-[#BAE6FD]">528 Bytes</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1726] border border-[#224870] space-y-3">
                <div className="text-[#44CFCB] font-bold text-xs flex items-center gap-1.5">
                  <Network className="w-4 h-4" />
                  <span>2. Schema Relationship</span>
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="p-1.5 rounded bg-[#142034] text-[#BAE6FD] border border-[#224870]">
                    POST /charges → CreateChargeRequest
                  </div>
                  <div className="p-1.5 rounded bg-[#142034] text-[#44CFCB] border border-[#224870]">
                    201 Response → ChargeEntity
                  </div>
                  <div className="p-1.5 rounded bg-[#142034] text-[#E2EAF4] border border-[#224870]">
                    Nested Entity → CustomerProfile ($ref)
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1726] border border-[#224870] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-[#BAE6FD] font-bold text-xs mb-1.5">
                    3. Launch Full Workspace
                  </div>
                  <p className="text-[11px] text-[#9BB0CC] leading-relaxed">
                    Test live against staging clusters, audit breaking diffs,
                    and save request collections.
                  </p>
                </div>
                <a href="/workspace" className="block w-full">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs justify-center font-semibold"
                  >
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};
