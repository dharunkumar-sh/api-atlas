import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getMethodVariant } from '@/utils/formatters';
import {
  Play,
  Copy,
  Check,
  Search,
  ArrowRight,
  Clock,
  ShieldCheck,
  Database,
  FileCode2,
  Terminal,
  Activity,
  ChevronRight,
  Code2,
} from 'lucide-react';

export interface EndpointParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  type: string;
  required: boolean;
  defaultValue: string;
  description: string;
}

export interface SchemaProperty {
  name: string;
  type: string;
  format?: string;
  required: boolean;
  description: string;
  example: string;
}

export interface SchemaModel {
  title: string;
  description: string;
  properties: SchemaProperty[];
}

export interface EndpointMock {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  tag: string;
  summary: string;
  description: string;
  parameters: EndpointParameter[];
  schemaModel: SchemaModel;
  defaultResponse: Record<string, unknown>;
  statusCode: number;
}

const DEMO_ENDPOINTS: EndpointMock[] = [
  {
    id: 'post-charges',
    method: 'POST',
    path: '/v1/charges',
    tag: 'Payments',
    summary: 'Authorize payment intent',
    description: 'Creates a cryptographically signed payment transaction against an authorized vault card or bank token.',
    parameters: [
      {
        name: 'amount',
        in: 'body',
        type: 'integer',
        required: true,
        defaultValue: '4900',
        description: 'Amount in smallest currency denomination (cents for USD)',
      },
      {
        name: 'currency',
        in: 'body',
        type: 'string',
        required: true,
        defaultValue: 'usd',
        description: 'Three-letter ISO-4217 currency code in lowercase',
      },
      {
        name: 'customer_id',
        in: 'body',
        type: 'string',
        required: true,
        defaultValue: 'cus_894f2b1a',
        description: 'Target customer vault reference identifier',
      },
      {
        name: 'Idempotency-Key',
        in: 'header',
        type: 'string',
        required: false,
        defaultValue: 'req_019a2b8e_idem',
        description: 'Unique client key preventing double dispatch on retry',
      },
    ],
    schemaModel: {
      title: 'ChargeCreateRequest',
      description: 'Specification schema for authorized transaction creation.',
      properties: [
        { name: 'amount', type: 'integer', format: 'int64', required: true, description: 'Amount in integer cents', example: '4900' },
        { name: 'currency', type: 'string', format: 'iso-4217', required: true, description: 'ISO currency format', example: '"usd"' },
        { name: 'customer_id', type: 'string', format: 'uuid', required: true, description: 'Identifier of customer entity', example: '"cus_894f2b1a"' },
        { name: 'capture_method', type: 'string', format: 'enum', required: false, description: 'automatic | manual', example: '"automatic"' },
        { name: 'metadata', type: 'object', required: false, description: 'Arbitrary key-value telemetry pairs', example: '{"order_id": "ord_9182"}' },
      ],
    },
    statusCode: 201,
    defaultResponse: {
      id: 'ch_948f2a1b9',
      object: 'charge',
      amount: 4900,
      currency: 'usd',
      status: 'succeeded',
      customer: 'cus_894f2b1a',
      captured: true,
      risk_score: 97,
      created: 1729158012,
    },
  },
  {
    id: 'get-charges-id',
    method: 'GET',
    path: '/v1/charges/{id}',
    tag: 'Payments',
    summary: 'Retrieve charge state',
    description: 'Fetches immutable receipt metadata, ledger balance, and verification logs for a transaction.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        defaultValue: 'ch_948f2a1b9',
        description: 'Unique transaction identifier (prefixed ch_)',
      },
      {
        name: 'expand',
        in: 'query',
        type: 'string',
        required: false,
        defaultValue: 'customer,dispute',
        description: 'Relations to hydrate in response graph',
      },
    ],
    schemaModel: {
      title: 'ChargeResponse',
      description: 'Canonical charge entity schema with ledger state.',
      properties: [
        { name: 'id', type: 'string', required: true, description: 'Globally unique charge ID', example: '"ch_948f2a1b9"' },
        { name: 'status', type: 'string', format: 'enum', required: true, description: 'succeeded | pending | failed', example: '"succeeded"' },
        { name: 'receipt_url', type: 'string', format: 'uri', required: true, description: 'Signed URL to PDF receipt', example: '"https://pay.atlas.dev/r/ch_948"' },
        { name: 'livemode', type: 'boolean', required: true, description: 'Live vs test mode sandbox switch', example: 'false' },
      ],
    },
    statusCode: 200,
    defaultResponse: {
      id: 'ch_948f2a1b9',
      status: 'settled',
      amount: 4900,
      fee_breakdown: { processing: 142, network: 28 },
      receipt_url: 'https://pay.atlas.dev/receipts/ch_948f2a1b9.pdf',
      settlement_window: 't+1',
    },
  },
  {
    id: 'post-webhooks',
    method: 'POST',
    path: '/v1/webhooks',
    tag: 'Events',
    summary: 'Register webhook subscriber',
    description: 'Registers an HTTPS destination to receive cryptographically signed HMAC-SHA256 event streams.',
    parameters: [
      {
        name: 'url',
        in: 'body',
        type: 'string',
        required: true,
        defaultValue: 'https://app.example.com/api/webhooks',
        description: 'Valid HTTPS endpoint destination',
      },
      {
        name: 'events',
        in: 'body',
        type: 'array',
        required: true,
        defaultValue: '["charge.succeeded", "charge.failed"]',
        description: 'Subscribed event topic array',
      },
    ],
    schemaModel: {
      title: 'WebhookSubscription',
      description: 'Webhook listener subscription registration schema.',
      properties: [
        { name: 'url', type: 'string', format: 'uri', required: true, description: 'Target webhook HTTPS destination', example: '"https://app.example.com/api/webhooks"' },
        { name: 'events', type: 'array', required: true, description: 'Array of subscribed event topics', example: '["charge.succeeded"]' },
        { name: 'secret_key', type: 'string', required: true, description: 'HMAC signature signing secret', example: '"whsec_83021f"' },
      ],
    },
    statusCode: 201,
    defaultResponse: {
      id: 'wh_01k9d7a2',
      url: 'https://app.example.com/api/webhooks',
      status: 'active',
      signing_secret: 'whsec_99af2810cd81fa',
      subscribed_events: ['charge.succeeded', 'charge.failed'],
    },
  },
  {
    id: 'get-customers-id',
    method: 'GET',
    path: '/v1/customers/{id}',
    tag: 'Customers',
    summary: 'Fetch customer ledger profile',
    description: 'Retrieves verified profile data, attached payment methods, and current account balance.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        defaultValue: 'cus_894f2b1a',
        description: 'Customer UUID or external identifier',
      },
    ],
    schemaModel: {
      title: 'CustomerProfile',
      description: 'Ledger identity and billing profile representation.',
      properties: [
        { name: 'id', type: 'string', required: true, description: 'Customer identifier', example: '"cus_894f2b1a"' },
        { name: 'email', type: 'string', format: 'email', required: true, description: 'Verified primary contact email', example: '"dev@atlas.dev"' },
        { name: 'balance', type: 'integer', required: true, description: 'Current ledger balance in cents', example: '0' },
      ],
    },
    statusCode: 200,
    defaultResponse: {
      id: 'cus_894f2b1a',
      email: 'engineering@atlas.dev',
      currency: 'usd',
      delinquent: false,
      active_payment_methods: 2,
    },
  },
  {
    id: 'delete-charges-id',
    method: 'DELETE',
    path: '/v1/charges/{id}',
    tag: 'Payments',
    summary: 'Void or refund charge',
    description: 'Cancels pending pre-authorizations or triggers automated merchant ledger refunding.',
    parameters: [
      {
        name: 'id',
        in: 'path',
        type: 'string',
        required: true,
        defaultValue: 'ch_948f2a1b9',
        description: 'Target charge identifier',
      },
    ],
    schemaModel: {
      title: 'ChargeRefund',
      description: 'Payload returned when a charge is reversed.',
      properties: [
        { name: 'id', type: 'string', required: true, description: 'Refund operation ID', example: '"re_39fa20"' },
        { name: 'charge_id', type: 'string', required: true, description: 'Original charge reference', example: '"ch_948f2a1b9"' },
        { name: 'status', type: 'string', required: true, description: 'Reversal confirmation status', example: '"reversed"' },
      ],
    },
    statusCode: 200,
    defaultResponse: {
      id: 're_8401bd9',
      charge_id: 'ch_948f2a1b9',
      status: 'reversed',
      amount_refunded: 4900,
    },
  },
];

export const HeroWorkspacePreview: React.FC = () => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('post-charges');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeCenterTab, setActiveCenterTab] = useState<'params' | 'schema' | 'curl'>('params');
  const [mobilePane, setMobilePane] = useState<'sidebar' | 'detail' | 'response'>('detail');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(14);
  const [copied, setCopied] = useState<boolean>(false);

  // Form parameters state for interactive simulation
  const [paramValues, setParamValues] = useState<Record<string, string>>({
    amount: '4900',
    currency: 'usd',
    customer_id: 'cus_894f2b1a',
    'Idempotency-Key': 'req_019a2b8e_idem',
    id: 'ch_948f2a1b9',
    expand: 'customer,dispute',
    url: 'https://app.example.com/api/webhooks',
  });

  const selectedEndpoint =
    DEMO_ENDPOINTS.find((ep) => ep.id === selectedEndpointId) || DEMO_ENDPOINTS[0];

  const filteredEndpoints = DEMO_ENDPOINTS.filter(
    (ep) =>
      ep.path.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleParamChange = (name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleDispatch = () => {
    setIsRunning(true);
    setTimeout(() => {
      setLatency(Math.floor(Math.random() * 8) + 11);
      setIsRunning(false);
      // Auto switch to response view on mobile
      setMobilePane('response');
    }, 280);
  };

  // Generate dynamic response reflecting param values
  const dynamicResponse = {
    ...selectedEndpoint.defaultResponse,
    ...(selectedEndpoint.id === 'post-charges'
      ? {
          amount: Number(paramValues.amount) || 4900,
          currency: paramValues.currency || 'usd',
          customer: paramValues.customer_id || 'cus_894f2b1a',
        }
      : {}),
    ...(selectedEndpoint.id === 'get-charges-id'
      ? { id: paramValues.id || 'ch_948f2a1b9' }
      : {}),
  };

  const curlCommand = `curl -X ${selectedEndpoint.method} "https://api.atlas.dev${selectedEndpoint.path}" \\
  -H "Authorization: Bearer atlas_demo_key_99" \\
  -H "Content-Type: application/json"${
    selectedEndpoint.method === 'POST'
      ? ` \\
  -d '${JSON.stringify(
    {
      amount: Number(paramValues.amount) || 4900,
      currency: paramValues.currency || 'usd',
      customer_id: paramValues.customer_id || 'cus_894f2b1a',
    },
    null,
    2
  )}'`
      : ''
  }`;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(dynamicResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-[#0E1726] border border-[#224870] shadow-[0_24px_60px_-15px_rgba(10,16,29,0.85)] overflow-hidden transition-all duration-300">
      {/* 1. TOP DEMO WORKSPACE BAR & STATUS */}
      <div className="px-4 py-3 bg-[#142034] border-b border-[#224870] flex flex-wrap items-center justify-between gap-3 select-none">
        {/* Left: Spec Title & Environment Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="h-4 w-px bg-[#224870]" />

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#F4F7FB] font-semibold">Atlas Core Banking Spec</span>
            <Badge variant="outline" className="text-[10px] text-[#4EA5D9] border-[#224870] hidden sm:inline-flex">
              OpenAPI 3.1.0
            </Badge>
          </div>
        </div>

        {/* Center / Right: Clear Demo Environment Pill */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A101D] border border-[#224870] text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#44CFCB] animate-pulse" />
            <span className="text-[#44CFCB] font-semibold tracking-wide">LIVE INTERACTIVE PREVIEW</span>
            <span className="text-[#627898]">•</span>
            <span className="text-[#9BB0CC] hidden sm:inline">DEMO DATA</span>
          </div>

          <a
            href="/workspace"
            className="hidden md:inline-flex items-center gap-1 text-xs text-[#4EA5D9] hover:text-[#44CFCB] font-medium transition-colors"
          >
            <span>Full Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Mobile pane selector tabs */}
      <div className="lg:hidden flex border-b border-[#224870] bg-[#0A101D] text-xs font-medium text-[#9BB0CC]">
        <button
          onClick={() => setMobilePane('sidebar')}
          className={`flex-1 py-2.5 text-center cursor-pointer border-b-2 ${
            mobilePane === 'sidebar'
              ? 'border-[#44CFCB] text-[#F4F7FB] bg-[#142034]/60'
              : 'border-transparent hover:text-[#F4F7FB]'
          }`}
        >
          Endpoints ({DEMO_ENDPOINTS.length})
        </button>
        <button
          onClick={() => setMobilePane('detail')}
          className={`flex-1 py-2.5 text-center cursor-pointer border-b-2 ${
            mobilePane === 'detail'
              ? 'border-[#44CFCB] text-[#F4F7FB] bg-[#142034]/60'
              : 'border-transparent hover:text-[#F4F7FB]'
          }`}
        >
          Endpoint & Schema
        </button>
        <button
          onClick={() => setMobilePane('response')}
          className={`flex-1 py-2.5 text-center cursor-pointer border-b-2 ${
            mobilePane === 'response'
              ? 'border-[#44CFCB] text-[#F4F7FB] bg-[#142034]/60'
              : 'border-transparent hover:text-[#F4F7FB]'
          }`}
        >
          Response ({selectedEndpoint.statusCode})
        </button>
      </div>

      {/* 2. THREE-PANEL WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px] text-left">
        {/* PANEL 1: ENDPOINTS SIDEBAR (3 Cols on Desktop) */}
        <aside
          className={`lg:col-span-3 border-r border-[#224870] bg-[#0A101D] p-3 flex-col justify-between ${
            mobilePane === 'sidebar' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#627898]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter endpoints..."
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-[#0E1726] border border-[#224870] text-xs font-mono text-[#F4F7FB] placeholder-[#627898] focus:outline-none focus:border-[#4EA5D9]"
              />
            </div>

            {/* Endpoints List */}
            <div className="space-y-1">
              <div className="px-2 py-1 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#9BB0CC]">
                <span>Contract Endpoints</span>
                <span className="text-[10px] text-[#4EA5D9]">{filteredEndpoints.length} Active</span>
              </div>

              {filteredEndpoints.map((ep) => {
                const isSelected = selectedEndpoint.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEndpointId(ep.id);
                      setMobilePane('detail');
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 group ${
                      isSelected
                        ? 'bg-[#18263D] border border-[#4EA5D9]/40 text-[#F4F7FB] shadow-sm'
                        : 'hover:bg-[#142034]/70 border border-transparent text-[#9BB0CC]'
                    }`}
                  >
                    <Badge variant={getMethodVariant(ep.method)} size="sm" className="shrink-0">
                      {ep.method}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-mono truncate ${
                          isSelected ? 'text-[#F4F7FB] font-semibold' : 'text-[#E2EAF4]'
                        }`}
                      >
                        {ep.path}
                      </p>
                      <p className="text-[10px] text-[#9BB0CC] truncate mt-0.5">
                        {ep.summary}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isSelected ? 'text-[#44CFCB] translate-x-0.5' : 'text-[#627898] opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy & Invariant Notice */}
          <div className="mt-4 p-2.5 rounded-xl bg-[#0E1726] border border-[#224870]/70 text-[11px] space-y-1 text-[#9BB0CC]">
            <div className="flex items-center gap-1.5 text-[#E2EAF4] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#44CFCB]" />
              <span>Zero Cloud Leakage</span>
            </div>
            <p className="text-[10px] text-[#9BB0CC] leading-relaxed">
              OpenAPI contract parsing executes in-browser via WebAssembly with zero telemetry exfiltration.
            </p>
          </div>
        </aside>

        {/* PANEL 2: ENDPOINT DETAIL & SCHEMA REFERENCE (5 Cols on Desktop) */}
        <section
          className={`lg:col-span-5 border-r border-[#224870] bg-[#0E1726] p-4 flex flex-col justify-between ${
            mobilePane === 'detail' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="space-y-4">
            {/* Endpoint Summary Header */}
            <div className="space-y-2 pb-3 border-b border-[#224870]/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono">
                  <Badge variant={getMethodVariant(selectedEndpoint.method)} size="md">
                    {selectedEndpoint.method}
                  </Badge>
                  <span className="text-xs sm:text-sm font-semibold text-[#F4F7FB]">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-[#9BB0CC] border-[#224870]">
                  {selectedEndpoint.tag}
                </Badge>
              </div>

              <p className="text-xs text-[#9BB0CC] leading-relaxed">
                {selectedEndpoint.description}
              </p>
            </div>

            {/* Sub-tab Navigation: Parameters vs Schema Reference vs cURL */}
            <div className="flex items-center gap-1 bg-[#0A101D] p-1 rounded-lg border border-[#224870]">
              <button
                onClick={() => setActiveCenterTab('params')}
                className={`flex-1 py-1 px-2.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeCenterTab === 'params'
                    ? 'bg-[#2A4494] text-[#F4F7FB] border border-[#4EA5D9]/40 shadow-xs'
                    : 'text-[#9BB0CC] hover:text-[#F4F7FB]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-[#4EA5D9]" />
                <span>Parameters ({selectedEndpoint.parameters.length})</span>
              </button>

              <button
                onClick={() => setActiveCenterTab('schema')}
                className={`flex-1 py-1 px-2.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeCenterTab === 'schema'
                    ? 'bg-[#2A4494] text-[#F4F7FB] border border-[#4EA5D9]/40 shadow-xs'
                    : 'text-[#9BB0CC] hover:text-[#F4F7FB]'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-[#44CFCB]" />
                <span>Schema Ref</span>
              </button>

              <button
                onClick={() => setActiveCenterTab('curl')}
                className={`flex-1 py-1 px-2.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeCenterTab === 'curl'
                    ? 'bg-[#2A4494] text-[#F4F7FB] border border-[#4EA5D9]/40 shadow-xs'
                    : 'text-[#9BB0CC] hover:text-[#F4F7FB]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-[#BAE6FD]" />
                <span>cURL</span>
              </button>
            </div>

            {/* SUB-VIEW 1: Interactive Parameters Form */}
            {activeCenterTab === 'params' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="text-[11px] font-semibold text-[#E2EAF4] flex items-center justify-between">
                  <span>Input Arguments & Headers</span>
                  <span className="text-[10px] text-[#44CFCB]">Interactive Mock Inputs</span>
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {selectedEndpoint.parameters.map((param) => (
                    <div
                      key={param.name}
                      className="p-2.5 rounded-xl bg-[#0A101D] border border-[#224870]/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#44CFCB] font-semibold">{param.name}</span>
                          <span className="text-[10px] text-[#9BB0CC] px-1 py-0.2 rounded bg-[#142034] border border-[#224870]">
                            {param.in}
                          </span>
                          <span className="text-[10px] text-[#4EA5D9]">{param.type}</span>
                        </div>
                        {param.required ? (
                          <span className="text-[10px] text-rose-400 font-sans font-medium">Required</span>
                        ) : (
                          <span className="text-[10px] text-[#627898] font-sans">Optional</span>
                        )}
                      </div>

                      <input
                        type="text"
                        value={paramValues[param.name] ?? param.defaultValue}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        className="w-full px-2.5 py-1 rounded bg-[#080D18] border border-[#224870] text-[#F4F7FB] text-xs font-mono focus:outline-none focus:border-[#4EA5D9]"
                        placeholder={param.defaultValue}
                      />
                      <p className="text-[10px] font-sans text-[#9BB0CC]">{param.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: Schema Reference Panel */}
            {activeCenterTab === 'schema' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#224870]/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-[#4EA5D9]" />
                    <span className="font-mono font-semibold text-[#F4F7FB]">
                      {selectedEndpoint.schemaModel.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#9BB0CC]">Type: Object</span>
                </div>

                <p className="text-[11px] text-[#9BB0CC] font-sans leading-normal">
                  {selectedEndpoint.schemaModel.description}
                </p>

                <div className="rounded-xl border border-[#224870] bg-[#0A101D] overflow-hidden font-mono text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-[#142034] text-[#9BB0CC] border-b border-[#224870] text-[10px] uppercase">
                      <tr>
                        <th className="py-1.5 px-2.5">Field</th>
                        <th className="py-1.5 px-2.5">Type</th>
                        <th className="py-1.5 px-2.5">Req</th>
                        <th className="py-1.5 px-2.5">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#224870]/40">
                      {selectedEndpoint.schemaModel.properties.map((prop) => (
                        <tr key={prop.name} className="hover:bg-[#142034]/40">
                          <td className="py-1.5 px-2.5 text-[#44CFCB] font-semibold">{prop.name}</td>
                          <td className="py-1.5 px-2.5 text-[#4EA5D9]">{prop.type}</td>
                          <td className="py-1.5 px-2.5">
                            {prop.required ? (
                              <span className="text-rose-400 text-[10px]">Yes</span>
                            ) : (
                              <span className="text-[#627898] text-[10px]">No</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2.5 text-[#9BB0CC] text-[10px]">{prop.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: cURL Snippet */}
            {activeCenterTab === 'curl' && (
              <div className="relative rounded-xl bg-[#080D18] border border-[#224870] p-3 font-mono text-xs">
                <pre className="text-[#BAE6FD] overflow-x-auto leading-relaxed text-[11px]">
                  {curlCommand}
                </pre>
              </div>
            )}
          </div>

          {/* Action Row: Dispatch Button */}
          <div className="pt-3 border-t border-[#224870]/60 flex items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-[#9BB0CC] hidden sm:inline">
              Host: https://api.atlas.dev
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDispatch}
              isLoading={isRunning}
              className="text-xs font-mono w-full sm:w-auto shadow-md shadow-[#2A4494]/30"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Dispatch Request</span>
            </Button>
          </div>
        </section>

        {/* PANEL 3: COMPACT RESPONSE PREVIEW (4 Cols on Desktop) */}
        <div
          className={`lg:col-span-4 bg-[#0A101D] p-4 flex-col justify-between space-y-3 ${
            mobilePane === 'response' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="space-y-3">
            {/* Response Telemetry Status Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#224870]/60">
              <div className="flex items-center gap-2">
                <Badge variant={selectedEndpoint.statusCode >= 200 && selectedEndpoint.statusCode < 300 ? 'success' : 'post'} size="sm">
                  {selectedEndpoint.statusCode} OK
                </Badge>
                <span className="text-[11px] font-mono text-[#9BB0CC]">application/json</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono">
                <Clock className="w-3 h-3 text-[#4EA5D9]" />
                <span className="text-[#44CFCB] font-semibold">{latency}ms</span>
              </div>
            </div>

            {/* Response Code Block with High Contrast Palette */}
            <div className="relative rounded-xl bg-[#080D18] border border-[#224870] p-3 text-xs font-mono">
              <div className="absolute top-2.5 right-2.5">
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 rounded bg-[#142034] border border-[#224870] hover:border-[#4EA5D9] text-[#9BB0CC] hover:text-[#F4F7FB] text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy JSON Response"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-[#44CFCB]" />
                      <span className="text-[#44CFCB]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#4EA5D9]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[10px] font-mono uppercase text-[#627898] mb-1.5 flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#44CFCB]" />
                <span>Response Payload</span>
              </div>

              <pre className="text-[#BAE6FD] overflow-x-auto leading-relaxed max-h-[300px] overflow-y-auto text-[11px]">
                {JSON.stringify(dynamicResponse, null, 2)}
              </pre>
            </div>
          </div>

          {/* Footer Callout inside Response Card */}
          <div className="pt-2 border-t border-[#224870]/60 flex items-center justify-between text-[11px] text-[#9BB0CC]">
            <span className="font-mono">In-Memory Engine</span>
            <a
              href="/workspace"
              className="text-[#4EA5D9] hover:text-[#44CFCB] font-medium transition-colors flex items-center gap-1"
            >
              <span>Explore full contract</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
