import React from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const tiers = [
    {
      name: 'Developer Community',
      badge: 'Free & Open Source',
      price: '$0',
      period: 'forever',
      description: 'Zero setup, 100% local in-browser parsing for individual developers and contract authors.',
      features: [
        'OpenAPI 3.0 & 3.1 contract parsing',
        'Interactive mock request runner',
        'Visual API dependency topology',
        'Zero cloud tracking or data leaks',
        'Local JSON/YAML file & URL importing',
        'cURL code generation with 1-click copy',
      ],
      ctaText: 'Start Exploring',
      ctaHref: '/workspace',
      variant: 'secondary' as const,
      popular: false,
    },
    {
      name: 'Engineered Teams',
      badge: 'Most Popular',
      price: '$29',
      period: 'per seat / month',
      description: 'Shared contract governance, automated CI/CD breaking change checks, and synced workspaces.',
      features: [
        'Everything in Developer Community',
        'Automated CI/CD contract diffing',
        'Breaking change alert pipelines',
        'Live schema mock servers & webhooks',
        'Team workspace synchronization',
        'Priority SLA & Discord developer channel',
      ],
      ctaText: 'Get Started with Teams',
      ctaHref: '/workspace',
      variant: 'primary' as const,
      popular: true,
    },
    {
      name: 'Enterprise Mesh',
      badge: 'Air-Gapped & Custom',
      price: 'Custom',
      period: 'billed annually',
      description: 'Dedicated air-gapped on-premise deployments for highly regulated enterprise architectures.',
      features: [
        'Air-gapped on-premise installation',
        'SAML 2.0 / Okta SSO & SCIM directory sync',
        'Custom enterprise schema validators',
        'Dedicated Technical Account Manager',
        'Audit logging & compliance exports',
        '99.99% uptime guarantee SLA',
      ],
      ctaText: 'Contact Enterprise',
      ctaHref: '/workspace',
      variant: 'outline' as const,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 border-t border-[#224870]/60 relative bg-[#080C16]">
      <Container size="xl" className="space-y-16">
        <SectionHeading
          eyebrow="Transparent Licensing"
          title="Engineered for local developers, scaled for teams."
          description="Start exploring OpenAPI contracts locally for free with zero telemetry. Upgrade when your team needs automated contract governance."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                tier.popular
                  ? 'bg-[#0E1726] border-2 border-[#4EA5D9] shadow-[0_15px_40px_-15px_rgba(42,68,148,0.4)] md:-translate-y-2'
                  : 'bg-[#0A101D] border border-[#224870] hover:border-[#4EA5D9]/60'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#2A4494] to-[#4EA5D9] text-[#F4F7FB] text-[11px] font-mono font-semibold tracking-wider uppercase shadow-sm">
                  {tier.badge}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#F4F7FB]">{tier.name}</h3>
                    {!tier.popular && (
                      <Badge variant="outline" className="text-[10px] text-[#4EA5D9] border-[#224870]">
                        {tier.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#9BB0CC] mt-2 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="pt-2 flex items-baseline gap-1.5 border-t border-[#224870]/60">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#F4F7FB] tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-xs text-[#9BB0CC] font-mono">/ {tier.period}</span>
                </div>

                <ul className="space-y-2.5 pt-3 border-t border-[#224870]/60 text-xs text-[#E2EAF4]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#44CFCB] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <a href={tier.ctaHref} className="block w-full">
                  <Button
                    variant={tier.variant}
                    size="md"
                    className="w-full justify-center text-xs font-semibold"
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Security / Privacy Assurance Banner */}
        <div className="p-4 rounded-xl bg-[#0E1726] border border-[#224870] flex flex-wrap items-center justify-between gap-4 text-xs text-[#9BB0CC]">
          <div className="flex items-center gap-2 text-[#F4F7FB] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#44CFCB]" />
            <span>Local Execution Guarantee:</span>
            <span className="text-[#9BB0CC] font-normal">
              Your API contracts and authorization keys never touch our servers.
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#4EA5D9]">
            <Zap className="w-3.5 h-3.5 text-[#44CFCB]" />
            <span>Sub-5ms WASM Parser</span>
          </div>
        </div>
      </Container>
    </section>
  );
};
