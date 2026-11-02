import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getMethodVariant } from '@/utils/formatters';
import {
  Play,
  Copy,
  Check,
  ArrowRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface MockEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  parameters: Array<{ name: string; in: string; type: string; required: boolean }>;
  mockResponse: Record<string, unknown>;
  statusCode: number;
}

interface MockSpec {
  id: string;
  title: string;
  version: string;
  specType: string;
  endpoints: MockEndpoint[];
}

const SAMPLE_SPECS: MockSpec[] = [
  {
    id: 'payments',
    title: 'Atlas Payment Infrastructure',
    version: '3.1.0',
    specType: 'OpenAPI 3.1',
    endpoints: [
      {
        id: 'create-charge',
        method: 'POST',
        path: '/v1/charges',
        summary: 'Create an authorized transaction',
        description: 'Creates a single-use charge intent against an authorized card or bank token.',
        parameters: [
          { name: 'amount', in: 'body', type: 'integer', required: true },
          { name: 'currency', in: 'body', type: 'string', required: true },
          { name: 'idempotency-key', in: 'header', type: 'string', required: false },
        ],
        statusCode: 201,
        mockResponse: {
          id: 'ch_948f2a1b9',
          status: 'succeeded',
          amount: 4900,
          currency: 'usd',
          authorized_at: '2026-10-17T09:40:12Z',
          risk_evaluation: { score: 98, outcome: 'approved' },
        },
      },
      {
        id: 'get-charge',
        method: 'GET',
        path: '/v1/charges/{charge_id}',
        summary: 'Retrieve charge details',
        description: 'Returns metadata, receipt URL, and ledger balance for the requested charge.',
        parameters: [
          { name: 'charge_id', in: 'path', type: 'string', required: true },
          { name: 'expand', in: 'query', type: 'string', required: false },
        ],
        statusCode: 200,
        mockResponse: {
          id: 'ch_948f2a1b9',
          status: 'settled',
          amount: 4900,
          receipt_url: 'https://pay.atlas.dev/r/ch_948f2a1b9',
          created: 1729158012,
        },
      },
      {
        id: 'refund-charge',
        method: 'DELETE',
        path: '/v1/charges/{charge_id}',
        summary: 'Void or refund charge',
        description: 'Cancels uncaptured authorizations or submits an automated merchant refund.',
        parameters: [
          { name: 'charge_id', in: 'path', type: 'string', required: true },
          { name: 'reason', in: 'query', type: 'string', required: false },
        ],
        statusCode: 200,
        mockResponse: {
          id: 're_01j8f7k9',
          charge_id: 'ch_948f2a1b9',
          status: 'reversed',
          refunded_amount: 4900,
        },
      },
    ],
  },
  {
    id: 'ai',
    title: 'Cognitive Inference Matrix',
    version: '3.0.3',
    specType: 'OpenAPI 3.0',
    endpoints: [
      {
        id: 'generate-embeddings',
        method: 'POST',
        path: '/v2/embeddings',
        summary: 'Generate dense vectors',
        description: 'Computes high-dimensional text embeddings with sub-5ms GPU quantization.',
        parameters: [
          { name: 'input', in: 'body', type: 'array', required: true },
          { name: 'model', in: 'body', type: 'string', required: true },
        ],
        statusCode: 200,
        mockResponse: {
          model: 'atlas-embed-large-v2',
          dimensions: 1536,
          usage: { prompt_tokens: 38, total_tokens: 38 },
          embedding: [0.0142, -0.0489, 0.0821, 0.0034, -0.0912],
        },
      },
      {
        id: 'get-model-status',
        method: 'GET',
        path: '/v2/models/{model_id}',
        summary: 'Inspect neural model runtime',
        description: 'Checks model deployment health, latency percentiles, and active replicas.',
        parameters: [{ name: 'model_id', in: 'path', type: 'string', required: true }],
        statusCode: 200,
        mockResponse: {
          id: 'atlas-embed-large-v2',
          status: 'ready',
          p95_latency_ms: 4.2,
          warm_replicas: 16,
        },
      },
    ],
  },
];

export const InteractiveDemoIsland: React.FC = () => {
  const [activeSpecId, setActiveSpecId] = useState<string>('payments');
  const currentSpec = SAMPLE_SPECS.find((s) => s.id === activeSpecId) || SAMPLE_SPECS[0];
  const [activeEndpointId, setActiveEndpointId] = useState<string>(currentSpec.endpoints[0].id);
  const [activeTab, setActiveTab] = useState<'response' | 'curl' | 'parameters'>('response');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [latencyMs, setLatencyMs] = useState<number>(14);

  const selectedEndpoint =
    currentSpec.endpoints.find((ep) => ep.id === activeEndpointId) || currentSpec.endpoints[0];

  const handleRunRequest = () => {
    setIsRunning(true);
    setTimeout(() => {
      setLatencyMs(Math.floor(Math.random() * 8) + 11);
      setIsRunning(false);
    }, 240);
  };

  const curlCommand = `curl -X ${selectedEndpoint.method} "https://api.atlas.dev${selectedEndpoint.path}" \\\n  -H "Authorization: Bearer test_key_99" \\\n  -H "Accept: application/json"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-[#0E1726] border border-[#224870] shadow-[0_20px_50px_-20px_rgba(10,16,29,0.8)] overflow-hidden text-left">
      {/* Island Top Bar / Spec Selector */}
      <div className="px-4 py-3 bg-[#142034] border-b border-[#224870] flex flex-wrap items-center justify-between gap-3">
        {/* Spec Tabs */}
        <div className="flex items-center gap-1.5 bg-[#0A101D] p-1 rounded-lg border border-[#224870]/60">
          {SAMPLE_SPECS.map((spec) => (
            <button
              key={spec.id}
              onClick={() => {
                setActiveSpecId(spec.id);
                setActiveEndpointId(spec.endpoints[0].id);
              }}
              className={`text-xs font-mono font-medium px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeSpecId === spec.id
                  ? 'bg-[#2A4494] text-[#F4F7FB] shadow-sm border border-[#4EA5D9]/40 font-semibold'
                  : 'text-[#9BB0CC] hover:text-[#F4F7FB] hover:bg-[#1F365C]/30'
              }`}
            >
              <span>{spec.title}</span>
              <span className="ml-1.5 text-[10px] text-[#4EA5D9] font-sans">{spec.version}</span>
            </button>
          ))}
        </div>

        {/* Spec metadata badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-mono text-[#4EA5D9] border-[#224870]">
            {currentSpec.specType}
          </Badge>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#9BB0CC] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#44CFCB] animate-pulse" />
            <span className="text-[#44CFCB]">Simulation Active</span>
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
        {/* Left Endpoints List (5 cols) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#224870] bg-[#0A101D] p-3 space-y-1.5">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#9BB0CC]">
            <span>Endpoints ({currentSpec.endpoints.length})</span>
            <span className="text-[10px] text-[#627898]">Click to Inspect</span>
          </div>

          <div className="space-y-1">
            {currentSpec.endpoints.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setActiveEndpointId(ep.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? 'bg-[#18263D] border border-[#4EA5D9]/40 text-[#F4F7FB] shadow-sm'
                      : 'hover:bg-[#142034]/60 border border-transparent text-[#9BB0CC]'
                  }`}
                >
                  <Badge variant={getMethodVariant(ep.method)} size="sm" className="shrink-0">
                    {ep.method}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-mono font-medium truncate ${
                        isSelected ? 'text-[#F4F7FB] font-semibold' : 'text-[#E2EAF4]'
                      }`}
                    >
                      {ep.path}
                    </p>
                    <p className="text-[11px] text-[#9BB0CC] truncate mt-0.5">
                      {ep.summary}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#0E1726] border border-[#224870]/60 text-xs space-y-1 text-[#9BB0CC]">
            <div className="flex items-center gap-1.5 text-[#E2EAF4] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#44CFCB]" />
              <span>Deterministic Contract Invariant</span>
            </div>
            <p className="text-[11px] text-[#9BB0CC] leading-normal">
              Schemas, path parameters, and headers are verified in-memory before request dispatch.
            </p>
          </div>
        </div>

        {/* Right Inspector & Runner (7 cols) */}
        <div className="lg:col-span-7 bg-[#0E1726] p-4 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Active Endpoint Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#224870]/60">
              <div className="flex items-center gap-2 font-mono">
                <Badge variant={getMethodVariant(selectedEndpoint.method)} size="md">
                  {selectedEndpoint.method}
                </Badge>
                <span className="text-xs sm:text-sm font-semibold text-[#F4F7FB]">
                  {selectedEndpoint.path}
                </span>
              </div>

              {/* Run Test Button in Royal Blue with Sky Blue Highlight */}
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunRequest}
                isLoading={isRunning}
                className="text-xs font-mono"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Dispatch Request</span>
              </Button>
            </div>

            {/* Description */}
            <p className="text-xs text-[#9BB0CC] leading-relaxed">
              {selectedEndpoint.description}
            </p>

            {/* Sub-tabs with Sky Blue & Cyan indicators */}
            <div className="flex items-center gap-2 border-b border-[#224870]/60 pb-2">
              <button
                onClick={() => setActiveTab('response')}
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'response'
                    ? 'bg-[#1F365C] text-[#44CFCB] font-semibold border border-[#224870]'
                    : 'text-[#9BB0CC] hover:text-[#F4F7FB]'
                }`}
              >
                Mock Response
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'curl'
                    ? 'bg-[#1F365C] text-[#44CFCB] font-semibold border border-[#224870]'
                    : 'text-[#9BB0CC] hover:text-[#F4F7FB]'
                }`}
              >
                cURL Snippet
              </button>
              <button
                onClick={() => setActiveTab('parameters')}
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'parameters'
                    ? 'bg-[#1F365C] text-[#44CFCB] font-semibold border border-[#224870]'
                    : 'text-[#9BB0CC] hover:text-[#F4F7FB]'
                }`}
              >
                Parameters ({selectedEndpoint.parameters.length})
              </button>
            </div>

            {/* Tab content: Response with Coolors Highlights */}
            {activeTab === 'response' && (
              <div className="rounded-xl bg-[#080D18] border border-[#224870] p-4 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#224870]/50 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      {selectedEndpoint.statusCode} OK
                    </Badge>
                    <span className="text-[#9BB0CC]">application/json</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#9BB0CC]">
                    <Clock className="w-3 h-3 text-[#4EA5D9]" />
                    <span className="text-[#44CFCB] font-semibold">{latencyMs}ms</span>
                  </div>
                </div>
                <pre className="text-[#BAE6FD] overflow-x-auto leading-relaxed pt-1">
                  {JSON.stringify(selectedEndpoint.mockResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Tab content: cURL */}
            {activeTab === 'curl' && (
              <div className="relative rounded-xl bg-[#080D18] border border-[#224870] p-4 font-mono text-xs">
                <div className="absolute top-3 right-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCurl}
                    className="h-7 px-2 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#44CFCB]" />
                        <span className="text-[#44CFCB]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#4EA5D9]" />
                        <span className="text-[#E2EAF4]">Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <pre className="text-[#E2EAF4] overflow-x-auto pr-16 leading-relaxed">
                  {curlCommand}
                </pre>
              </div>
            )}

            {/* Tab content: Parameters */}
            {activeTab === 'parameters' && (
              <div className="rounded-xl border border-[#224870] bg-[#080D18] overflow-hidden text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-[#142034] text-[#9BB0CC] border-b border-[#224870] text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">In</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#224870]/40">
                    {selectedEndpoint.parameters.map((p) => (
                      <tr key={`${p.in}-${p.name}`} className="hover:bg-[#142034]/40">
                        <td className="py-2 px-3 text-[#44CFCB] font-semibold">{p.name}</td>
                        <td className="py-2 px-3 text-[#9BB0CC]">{p.in}</td>
                        <td className="py-2 px-3 text-[#4EA5D9]">{p.type}</td>
                        <td className="py-2 px-3">
                          {p.required ? (
                            <span className="text-rose-400 font-semibold">Yes</span>
                          ) : (
                            <span className="text-[#627898]">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Island footer callout */}
          <div className="pt-3 border-t border-[#224870]/60 flex items-center justify-between text-xs text-[#9BB0CC]">
            <span>Deterministic In-Memory Contract Runner</span>
            <a
              href="/workspace"
              className="inline-flex items-center gap-1 text-[#4EA5D9] hover:text-[#44CFCB] font-medium transition-colors"
            >
              <span>Open in Full Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
