import React from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Container } from '@/components/ui/Container';
import {
  FileCode2,
  Search,
  Play,
  Network,
  BookmarkCheck,
  GitCompare,
} from 'lucide-react';

interface FeatureItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'feature-import',
    icon: FileCode2,
    tag: 'IMPORT & VALIDATION',
    title: 'OpenAPI Ingestion & Semantic Linting',
    description:
      'Parse OpenAPI 3.0, 3.1, and legacy Swagger 2.0 specs in milliseconds. Immediate validation catches missing parameters, orphaned endpoints, and unresolved $refs before deployment.',
  },
  {
    id: 'feature-search',
    icon: Search,
    tag: 'NAVIGATION ENGINE',
    title: 'Searchable Endpoint Documentation',
    description:
      'Lightning-fast fuzzy search across route paths, HTTP methods, tags, and request headers. Instant keyboard shortcuts keep developers in flow without scrolling.',
  },
  {
    id: 'feature-playground',
    icon: Play,
    tag: 'SANDBOX TESTING',
    title: 'Interactive API Request Playground',
    description:
      'Dispatch simulated mock requests directly in your browser with sub-15ms execution feedback. Inspect status codes, response headers, and formatted JSON payloads with one-click copying.',
  },
  {
    id: 'feature-topology',
    icon: Network,
    tag: 'RELATIONSHIP MESH',
    title: 'Visual Endpoint & Schema Relationships',
    description:
      'Reveal how routes bind to shared request models and nested response entities. Reference graphs clarify complex topologies across microservices and domain boundaries.',
  },
  {
    id: 'feature-environments',
    icon: BookmarkCheck,
    tag: 'WORKSPACE PERSISTENCE',
    title: 'Saved Requests & Variable Environments',
    description:
      'Switch between Local, Staging, and Production variable sets with encrypted in-browser storage. Save frequently used request presets and authentication headers with zero telemetry leaks.',
  },
  {
    id: 'feature-diff',
    icon: GitCompare,
    tag: 'CONTRACT AUDITING',
    title: 'Specification Version Comparison',
    description:
      'Detect breaking changes, removed parameters, and newly introduced endpoints between specification revisions. Compare staging vs production contracts to prevent client integration failures.',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section
      id="features"
      className="py-24 border-t border-[#224870]/60 relative bg-[#0A101D] scroll-mt-20"
    >
      <Container size="xl">
        <SectionHeading
          title="Engineered for High-Velocity API Development"
          description="Everything senior backend and infrastructure teams need to explore, simulate, and audit OpenAPI contracts with zero cloud dependencies."
        />

        {/* 6-Card Feature Grid - Clean Cards without Points */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group p-7 rounded-2xl bg-[#0E1726] border border-[#224870] hover:border-[#4EA5D9]/50 hover:bg-[#142034]/70 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#142034] border border-[#224870] flex items-center justify-center text-[#4EA5D9] group-hover:text-[#44CFCB] group-hover:border-[#44CFCB]/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono tracking-wider text-[#4EA5D9] font-semibold uppercase">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#F4F7FB] tracking-tight group-hover:text-white">
                    {feature.title}
                  </h3>

                  <p className="text-xs text-[#9BB0CC] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
