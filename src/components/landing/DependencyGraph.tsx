import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  type NodeProps,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowRight, FileCode2, Info } from 'lucide-react';

/* --------------------------------------------------------------------------
   Custom Node Types for OpenAPI Graph
   -------------------------------------------------------------------------- */

interface EndpointNodeData extends Record<string, unknown> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  operationId: string;
}

const EndpointNodeComponent: React.FC<NodeProps<Node<EndpointNodeData>>> = ({
  data,
  selected,
}) => {
  const methodColors: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    GET: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
    },
    POST: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/40',
    },
    PUT: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/40',
    },
    DELETE: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
    },
  };

  const style = methodColors[data.method] || methodColors.GET;

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-[#0E1726] border transition-all duration-150 min-w-[240px] shadow-lg ${
        selected
          ? 'border-[#44CFCB] ring-2 ring-[#44CFCB]/30 shadow-[#44CFCB]/20'
          : 'border-[#224870] hover:border-[#4EA5D9]/60'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-[#4EA5D9] !w-2.5 !h-2.5 !border-none"
      />
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${style.bg} ${style.text} ${style.border}`}
        >
          {data.method}
        </span>
        <span className="text-[10px] font-mono text-[#627898]">API Route</span>
      </div>
      <div className="font-mono text-xs font-semibold text-[#F4F7FB] truncate mb-1">
        {data.path}
      </div>
      <div className="text-[11px] text-[#9BB0CC] truncate">{data.summary}</div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-[#44CFCB] !w-2.5 !h-2.5 !border-none"
      />
    </div>
  );
};

interface SchemaNodeData extends Record<string, unknown> {
  schemaName: string;
  category: 'Request Schema' | 'Response Schema' | 'Data Entity';
  fields: Array<{ name: string; type: string; required?: boolean }>;
  refPath: string;
}

const SchemaNodeComponent: React.FC<NodeProps<Node<SchemaNodeData>>> = ({
  data,
  selected,
}) => {
  const categoryColors = {
    'Request Schema': 'text-[#BAE6FD] bg-[#142034] border-[#224870]',
    'Response Schema': 'text-[#44CFCB] bg-[#142034] border-[#224870]',
    'Data Entity': 'text-[#4EA5D9] bg-[#142034] border-[#224870]',
  };

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-[#0A101D] border transition-all duration-150 min-w-[230px] shadow-lg ${
        selected
          ? 'border-[#4EA5D9] ring-2 ring-[#4EA5D9]/30 shadow-[#4EA5D9]/20'
          : 'border-[#224870] hover:border-[#4EA5D9]/60'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-[#4EA5D9] !w-2.5 !h-2.5 !border-none"
      />
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${categoryColors[data.category]}`}
        >
          {data.category}
        </span>
        <FileCode2 className="w-3.5 h-3.5 text-[#627898]" />
      </div>
      <div className="font-mono text-xs font-bold text-[#F4F7FB] mb-2 flex items-center gap-1.5">
        <span className="text-[#44CFCB]">$ref:</span>
        <span>{data.schemaName}</span>
      </div>
      <div className="space-y-1 pt-1.5 border-t border-[#224870]/60">
        {data.fields.map((field) => (
          <div
            key={field.name}
            className="flex items-center justify-between font-mono text-[10px]"
          >
            <span
              className={
                field.required ? 'text-[#E2EAF4] font-medium' : 'text-[#9BB0CC]'
              }
            >
              {field.name}
              {field.required && (
                <span className="text-[#4EA5D9] ml-0.5">*</span>
              )}
            </span>
            <span className="text-[#627898]">{field.type}</span>
          </div>
        ))}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-[#44CFCB] !w-2.5 !h-2.5 !border-none"
      />
    </div>
  );
};

interface ErrorNodeData extends Record<string, unknown> {
  title: string;
  statusCode: string;
  fields: Array<{ name: string; type: string }>;
}

const ErrorNodeComponent: React.FC<NodeProps<Node<ErrorNodeData>>> = ({
  data,
  selected,
}) => (
  <div
    className={`px-4 py-3 rounded-xl bg-[#0F1420] border transition-all duration-150 min-w-[210px] shadow-lg ${
      selected
        ? 'border-rose-500 ring-2 ring-rose-500/30'
        : 'border-rose-900/40 hover:border-rose-500/60'
    }`}
  >
    <Handle
      type="target"
      position={Position.Left}
      className="!bg-rose-400 !w-2.5 !h-2.5 !border-none"
    />
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
        {data.statusCode}
      </span>
      <span className="text-[10px] font-mono text-rose-300/60">
        Error Contract
      </span>
    </div>
    <div className="font-mono text-xs font-bold text-[#F4F7FB] mb-1">
      {data.title}
    </div>
    <div className="space-y-1 pt-1.5 border-t border-rose-900/40">
      {data.fields.map((f) => (
        <div
          key={f.name}
          className="flex items-center justify-between font-mono text-[10px]"
        >
          <span className="text-rose-200/80">{f.name}</span>
          <span className="text-rose-400/60">{f.type}</span>
        </div>
      ))}
    </div>
  </div>
);

/* --------------------------------------------------------------------------
   Graph Mock Topology Data
   -------------------------------------------------------------------------- */

const INITIAL_NODES: Node[] = [
  {
    id: 'ep-post-charge',
    type: 'endpoint',
    position: { x: 30, y: 70 },
    data: {
      method: 'POST',
      path: '/v1/charges',
      summary: 'Authorize payment intent',
      description:
        'Creates a single-use charge intent against an authorized card or bank payment token.',
      operationId: 'createCharge',
    },
  },
  {
    id: 'ep-get-charge',
    type: 'endpoint',
    position: { x: 30, y: 260 },
    data: {
      method: 'GET',
      path: '/v1/charges/{id}',
      summary: 'Retrieve charge state',
      description:
        'Fetches the verified settlement status, receipts, and ledger audit log.',
      operationId: 'getChargeById',
    },
  },
  {
    id: 'schema-charge-request',
    type: 'schema',
    position: { x: 380, y: 20 },
    data: {
      schemaName: 'CreateChargeRequest',
      category: 'Request Schema',
      refPath: '#/components/schemas/CreateChargeRequest',
      fields: [
        { name: 'amount', type: 'integer', required: true },
        { name: 'currency', type: 'string(ISO-4217)', required: true },
        { name: 'customer_id', type: 'string(uuid)', required: false },
        { name: 'idempotency_key', type: 'string', required: false },
      ],
    },
  },
  {
    id: 'schema-charge-entity',
    type: 'schema',
    position: { x: 380, y: 200 },
    data: {
      schemaName: 'ChargeEntity',
      category: 'Response Schema',
      refPath: '#/components/schemas/ChargeEntity',
      fields: [
        { name: 'id', type: 'string(ch_*)', required: true },
        { name: 'status', type: 'enum(settled|held)', required: true },
        { name: 'amount', type: 'integer', required: true },
        { name: 'receipt_url', type: 'string(uri)', required: true },
      ],
    },
  },
  {
    id: 'schema-error',
    type: 'error',
    position: { x: 380, y: 400 },
    data: {
      title: 'ApiErrorResponse',
      statusCode: '400 / 422',
      fields: [
        { name: 'code', type: 'string' },
        { name: 'message', type: 'string' },
        { name: 'param', type: 'string' },
      ],
    },
  },
  {
    id: 'schema-customer',
    type: 'schema',
    position: { x: 740, y: 140 },
    data: {
      schemaName: 'CustomerProfile',
      category: 'Data Entity',
      refPath: '#/components/schemas/CustomerProfile',
      fields: [
        { name: 'customer_id', type: 'string(uuid)', required: true },
        { name: 'email', type: 'string(email)', required: true },
        { name: 'verified_tier', type: 'integer', required: true },
        { name: 'default_card', type: 'object', required: false },
      ],
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  {
    id: 'e-post-to-req',
    source: 'ep-post-charge',
    target: 'schema-charge-request',
    label: 'requestBody ($ref)',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#4EA5D9', strokeWidth: 1.75 },
    labelStyle: {
      fill: '#BAE6FD',
      fontWeight: 600,
      fontSize: 10,
      fontFamily: 'monospace',
    },
    labelBgStyle: {
      fill: '#142034',
      fillOpacity: 0.95,
      stroke: '#224870',
      rx: 4,
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4EA5D9' },
  },
  {
    id: 'e-post-to-res',
    source: 'ep-post-charge',
    target: 'schema-charge-entity',
    label: '201 Created ($ref)',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#44CFCB', strokeWidth: 1.75 },
    labelStyle: {
      fill: '#44CFCB',
      fontWeight: 600,
      fontSize: 10,
      fontFamily: 'monospace',
    },
    labelBgStyle: {
      fill: '#142034',
      fillOpacity: 0.95,
      stroke: '#224870',
      rx: 4,
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#44CFCB' },
  },
  {
    id: 'e-post-to-err',
    source: 'ep-post-charge',
    target: 'schema-error',
    label: '400 / 422 ($ref)',
    type: 'smoothstep',
    style: { stroke: '#f43f5e', strokeWidth: 1.5, strokeDasharray: '4 4' },
    labelStyle: {
      fill: '#fda4af',
      fontWeight: 600,
      fontSize: 10,
      fontFamily: 'monospace',
    },
    labelBgStyle: {
      fill: '#1F1218',
      fillOpacity: 0.95,
      stroke: '#9f1239',
      rx: 4,
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' },
  },
  {
    id: 'e-get-to-res',
    source: 'ep-get-charge',
    target: 'schema-charge-entity',
    label: '200 OK ($ref)',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#44CFCB', strokeWidth: 1.75 },
    labelStyle: {
      fill: '#44CFCB',
      fontWeight: 600,
      fontSize: 10,
      fontFamily: 'monospace',
    },
    labelBgStyle: {
      fill: '#142034',
      fillOpacity: 0.95,
      stroke: '#224870',
      rx: 4,
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#44CFCB' },
  },
  {
    id: 'e-charge-to-cust',
    source: 'schema-charge-entity',
    target: 'schema-customer',
    label: 'customer ($ref)',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#4EA5D9', strokeWidth: 1.75 },
    labelStyle: {
      fill: '#BAE6FD',
      fontWeight: 600,
      fontSize: 10,
      fontFamily: 'monospace',
    },
    labelBgStyle: {
      fill: '#142034',
      fillOpacity: 0.95,
      stroke: '#224870',
      rx: 4,
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#4EA5D9' },
  },
];

/* --------------------------------------------------------------------------
   Main Component
   -------------------------------------------------------------------------- */

export const DependencyGraph: React.FC = () => {
  const nodeTypes = useMemo(
    () => ({
      endpoint: EndpointNodeComponent,
      schema: SchemaNodeComponent,
      error: ErrorNodeComponent,
    }),
    []
  );

  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, , onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    'schema-charge-entity'
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || nodes[0],
    [nodes, selectedNodeId]
  );

  // Connected edges count for selected node
  const connectedEdgesCount = useMemo(
    () =>
      edges.filter(
        (e) => e.source === selectedNodeId || e.target === selectedNodeId
      ).length,
    [edges, selectedNodeId]
  );

  return (
    <section
      id="graph"
      className="py-24 border-t border-[#224870]/60 relative bg-[#080C16] scroll-mt-20"
    >
      <Container size="xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionHeading
            title="Visual API Dependency & Reference Graph"
            description="Explore actual OpenAPI reference links ($ref) connecting route handlers to request bodies, response entities, and shared data schemas in real time."
          />
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <a href="/workspace">
              <Button
                variant="primary"
                size="sm"
                className="text-xs font-semibold"
              >
                <span>Open in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Graph Canvas Container with Fixed Size */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Main Flow Canvas - Fixed Size, No Adjusting Overlays */}
          <div className="lg:col-span-3 rounded-2xl bg-[#0A101D] border border-[#224870] shadow-2xl overflow-hidden relative flex flex-col h-[480px]">
            {/* Top Toolbar */}
            <div className="px-4 py-2.5 bg-[#0E1726] border-b border-[#224870] flex items-center justify-between text-xs text-[#9BB0CC]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#44CFCB] animate-pulse" />
                <span className="font-mono text-[11px] text-[#F4F7FB] font-semibold">
                  LIVE CONTRACT MESH:
                </span>
                <span className="font-mono text-[11px] text-[#4EA5D9]">
                  Atlas Payment Infrastructure v3.1.0
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                <span className="text-[#44CFCB]">Interactive Topology</span>
              </div>
            </div>

            {/* React Flow Canvas - Fixed Size & Locked from accidental drag/zoom/viewport adjustments */}
            <div className="flex-1 w-full relative">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                nodesDraggable={false}
                nodesConnectable={false}
                nodesFocusable={false}
                edgesFocusable={false}
                elementsSelectable={true}
                panOnDrag={false}
                panOnScroll={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                selectNodesOnDrag={false}
                selectionOnDrag={false}
                preventScrolling={false}
                zoomActivationKeyCode={null}
                panActivationKeyCode={null}
                deleteKeyCode={null}
                multiSelectionKeyCode={null}
                proOptions={{ hideAttribution: true }}
                className="bg-[#070B14]"
              >
                <Background color="#142034" gap={20} size={1.5} />
              </ReactFlow>
            </div>

            {/* Bottom Legend */}
            <div className="px-4 py-2 bg-[#0E1726]/90 border-t border-[#224870]/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#9BB0CC]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#2A4494] border border-[#4EA5D9]/40" />
                  <span>API Route</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#142034] border border-[#44CFCB]" />
                  <span>Request / Response Schema</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/20 border border-rose-500/40" />
                  <span>Error Contract</span>
                </div>
              </div>
              <span className="text-[#4EA5D9]">
                Click any node to inspect parameters
              </span>
            </div>
          </div>

          {/* Side Node Detail Inspector - Fixed Size Matching Canvas */}
          <div className="rounded-2xl bg-[#0E1726] border border-[#224870] p-6 flex flex-col justify-between shadow-xl h-[480px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#224870]/60 shrink-0">
              <span className="font-mono text-xs font-semibold text-[#44CFCB] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>NODE INSPECTOR</span>
              </span>
              <span className="text-[10px] font-mono text-[#627898]">
                {connectedEdgesCount} reference
                {connectedEdgesCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4 min-h-0 pr-1">
              {selectedNode.type === 'endpoint'
                ? (() => {
                    const data = selectedNode.data as EndpointNodeData;
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={data.method === 'POST' ? 'post' : 'get'}
                          >
                            {data.method}
                          </Badge>
                          <span className="font-mono text-xs font-bold text-[#F4F7FB]">
                            {data.path}
                          </span>
                        </div>
                        <p className="text-xs text-[#9BB0CC] leading-relaxed">
                          {data.description}
                        </p>
                        <div className="p-3 rounded-lg bg-[#0A101D] border border-[#224870] space-y-1.5 text-xs font-mono">
                          <div className="text-[10px] text-[#627898] uppercase">
                            Operation ID
                          </div>
                          <div className="text-[#44CFCB]">
                            {data.operationId}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                : selectedNode.type === 'schema'
                  ? (() => {
                      const data = selectedNode.data as SchemaNodeData;
                      return (
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] font-mono text-[#4EA5D9] uppercase font-semibold">
                              {data.category}
                            </span>
                            <h4 className="font-mono text-sm font-bold text-[#F4F7FB] mt-0.5">
                              {data.schemaName}
                            </h4>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#0A101D] border border-[#224870] font-mono text-[10px] text-[#9BB0CC] truncate">
                            {data.refPath}
                          </div>
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-mono font-semibold text-[#E2EAF4]">
                              Documented Properties:
                            </div>
                            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                              {data.fields.map((f) => (
                                <div
                                  key={f.name}
                                  className="p-2 rounded bg-[#0A101D] border border-[#224870]/60 flex items-center justify-between text-xs font-mono"
                                >
                                  <span
                                    className={
                                      f.required
                                        ? 'text-[#F4F7FB] font-semibold'
                                        : 'text-[#9BB0CC]'
                                    }
                                  >
                                    {f.name}
                                    {f.required && (
                                      <span className="text-[#4EA5D9] ml-1">
                                        *
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[11px] text-[#44CFCB]">
                                    {f.type}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  : (() => {
                      const data = selectedNode.data as ErrorNodeData;
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              {data.statusCode}
                            </span>
                            <span className="font-mono text-xs font-bold text-[#F4F7FB]">
                              {data.title}
                            </span>
                          </div>
                          <p className="text-xs text-[#9BB0CC]">
                            RFC-7807 compliant error envelope returned when
                            request validation or authorization fails.
                          </p>
                          <div className="space-y-1">
                            {data.fields.map((f) => (
                              <div
                                key={f.name}
                                className="p-2 rounded bg-[#0A101D] border border-rose-900/40 flex items-center justify-between text-xs font-mono"
                              >
                                <span className="text-rose-200">{f.name}</span>
                                <span className="text-rose-400/80">
                                  {f.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
