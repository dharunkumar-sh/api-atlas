import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Check, Shield, Cpu } from 'lucide-react';

const COMPARISONS = [
  {
    feature: 'Contract Privacy',
    atlas: '100% In-Memory / Local Processing',
    legacy: 'Uploaded to third-party cloud analytics',
  },
  {
    feature: 'Spec Compatibility',
    atlas: 'OpenAPI 3.1, 3.0 & Swagger 2.0 (YAML/JSON)',
    legacy: 'Strictly OpenAPI 3.0 or paid plugin required',
  },
  {
    feature: 'Client Runtime Footprint',
    atlas: 'Ultra-lean client bundle (< 50KB)',
    legacy: 'Monolithic multi-megabyte bundle',
  },
  {
    feature: 'Path Syntax Auditing',
    atlas: 'Built-in semantic validation engine',
    legacy: 'Fails silently during runtime execution',
  },
  {
    feature: 'Standalone Portability',
    atlas: 'Self-hosted with zero external DB needed',
    legacy: 'Complex cloud account & backend cluster',
  },
];

export const ArchitectureSection: React.FC = () => {
  return (
    <section
      id="architecture"
      className="py-24 border-t border-atlas-denim/60 relative bg-atlas-space"
    >
      <Container size="xl">
        <SectionHeading
          title="Engineered lean. Isolated by design."
          description="A modern high-performance engine designed for zero cloud reliance, strict airgap privacy, and sub-second feedback."
        />

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Architecture comparison table (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0E1726] border border-atlas-denim overflow-hidden">
            <div className="p-4 bg-[#142034] border-b border-atlas-denim flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[#F4F7FB]">
                API ATLAS vs LEGACY CLOUD EXPLORERS
              </span>
              <Badge
                variant="outline"
                className="text-[10px] font-mono text-[#4EA5D9] border-[#224870]"
              >
                Phase 1 Specs
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0A101D] text-[#9BB0CC] border-b border-[#224870]/60">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Capability</th>
                    <th className="py-3 px-4 font-semibold text-[#4EA5D9]">
                      API Atlas
                    </th>
                    <th className="py-3 px-4 font-semibold text-[#627898]">
                      Legacy Tools
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#224870]/40">
                  {COMPARISONS.map((row) => (
                    <tr key={row.feature} className="hover:bg-[#142034]/40">
                      <td className="py-3 px-4 text-[#F4F7FB] font-sans font-medium">
                        {row.feature}
                      </td>
                      <td className="py-3 px-4 text-[#44CFCB] flex items-center gap-1.5 font-semibold">
                        <Check className="w-3.5 h-3.5 shrink-0 text-[#44CFCB]" />
                        <span>{row.atlas}</span>
                      </td>
                      <td className="py-3 px-4 text-[#9BB0CC]">
                        <span>{row.legacy}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Engine metrics card (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0E1726] border border-[#224870] space-y-6">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#44CFCB]" />
              <h3 className="text-sm font-semibold text-[#F4F7FB] font-mono uppercase tracking-wider">
                Telemetry & Runtime Profile
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0A101D] border border-[#224870]/70">
                <span className="text-[11px] text-[#9BB0CC] block font-mono">
                  Cold Parser Latency
                </span>
                <span className="text-xl font-bold font-mono text-[#44CFCB] mt-1 block">
                  &lt; 15ms
                </span>
                <span className="text-[10px] text-[#627898] block mt-1">
                  1,000+ line schemas
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A101D] border border-[#224870]/70">
                <span className="text-[11px] text-[#9BB0CC] block font-mono">
                  External Data Out
                </span>
                <span className="text-xl font-bold font-mono text-[#4EA5D9] mt-1 block">
                  0 Bytes
                </span>
                <span className="text-[10px] text-[#627898] block mt-1">
                  Strict local airgap
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A101D] border border-[#224870]/70">
                <span className="text-[11px] text-[#9BB0CC] block font-mono">
                  Process Memory RSS
                </span>
                <span className="text-xl font-bold font-mono text-[#44CFCB] mt-1 block">
                  &lt; 32 MB
                </span>
                <span className="text-[10px] text-[#627898] block mt-1">
                  Lightweight footprint
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0A101D] border border-[#224870]/70">
                <span className="text-[11px] text-[#9BB0CC] block font-mono">
                  Validation Strictness
                </span>
                <span className="text-xl font-bold font-mono text-[#FBBF24] mt-1 block">
                  Strict Auditing
                </span>
                <span className="text-[10px] text-[#627898] block mt-1">
                  Type-safe boundaries
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#142034] border border-[#224870] text-xs text-[#E2EAF4] flex items-start gap-3">
              <Shield className="w-4 h-4 text-[#44CFCB] shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px] text-[#9BB0CC]">
                API Atlas runs as a self-contained local service. No
                credentials, tokens, or headers are ever uploaded to cloud
                telemetry hubs.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
