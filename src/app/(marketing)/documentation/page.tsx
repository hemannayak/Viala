import { BookOpen, Code2, Terminal, Puzzle, ShieldCheck, Zap, GitBranch, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const SECTIONS = [
  {
    icon: Zap,
    title: 'Getting Started',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    items: [
      { title: 'Quick Start Guide', desc: 'Set up VIALA for your pharmacy in under 10 minutes.', href: '#quickstart' },
      { title: 'Platform Overview', desc: 'Understand the core modules and how they connect.', href: '#overview' },
      { title: 'First Inventory Import', desc: 'Import your existing inventory via CSV or ERP sync.', href: '#import' },
    ],
  },
  {
    icon: Code2,
    title: 'API Reference',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    items: [
      { title: 'REST API Overview', desc: 'Authentication, rate limits, and base URLs.', href: '#api' },
      { title: 'Inventory Endpoints', desc: 'CRUD operations for stock, batches, and expiry data.', href: '#inventory-api' },
      { title: 'Webhook Events', desc: 'Real-time event streams for risk alerts and outcomes.', href: '#webhooks' },
    ],
  },
  {
    icon: Puzzle,
    title: 'Integrations',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    items: [
      { title: 'ERP Systems (SAP, Oracle, Tally)', desc: 'Bi-directional sync with your existing ERP.', href: '#erp' },
      { title: 'POS & Billing Systems', desc: 'Connect dispensing data to lifecycle tracking.', href: '#pos' },
      { title: 'Government Portals', desc: 'Auto-file disposal reports to CDSCO and State Drug authorities.', href: '#gov' },
    ],
  },
  {
    icon: GitBranch,
    title: 'Workflows',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    items: [
      { title: 'Expiry Risk Engine', desc: "How VIALA's 90-day risk detection model works.", href: '#risk' },
      { title: 'Outcome Routing Logic', desc: 'The decision tree: sell, transfer, return, donate, or dispose.', href: '#routing' },
      { title: 'Compliance Audit Trail', desc: 'Every action, signed and timestamped. CDSCO-ready.', href: '#audit' },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Security & Compliance',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    items: [
      { title: 'Data Encryption', desc: 'AES-256 at rest, TLS 1.3 in transit.', href: '#encryption' },
      { title: 'Access Control & RBAC', desc: 'Role-based permissions at location and module level.', href: '#rbac' },
      { title: 'SOC 2 Type II Overview', desc: 'Our compliance posture and audit certifications.', href: '#soc2' },
    ],
  },
  {
    icon: Terminal,
    title: 'SDKs & Tools',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    items: [
      { title: 'JavaScript / TypeScript SDK', desc: 'NPM package for web and Node.js integrations.', href: '#js-sdk' },
      { title: 'Python SDK', desc: 'PyPI package for data pipelines and analytics workflows.', href: '#python-sdk' },
      { title: 'CSV Import Templates', desc: 'Standardised templates for bulk inventory onboarding.', href: '#templates' },
    ],
  },
];

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F5]">
      {/* Hero */}
      <section className="bg-white border-b border-[#E8E5DF] py-20">
        <div className="container-tight">
          <div className="max-w-2xl">
            <span className="label-tag mb-4 inline-flex">Documentation</span>
            <h1 className="display-lg mb-4">Build with VIALA.</h1>
            <p className="body-lg text-[#6B7280]">
              Guides, API references, and integration docs for developers, IT teams, and enterprise operators.
            </p>
          </div>

          {/* Search bar */}
          <div className="mt-8 max-w-lg">
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="search"
                placeholder="Search documentation…"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[#E8E5DF] bg-white text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] text-sm shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="bg-white border-b border-[#E8E5DF] py-4">
        <div className="container-tight">
          <div className="flex gap-4 overflow-x-auto">
            {['Quick Start', 'API Reference', 'Integrations', 'Webhooks', 'SDKs', 'Changelog'].map(link => (
              <a key={link} href="#" className="text-sm font-semibold text-[#6B7280] hover:text-[#059669] whitespace-nowrap py-1 border-b-2 border-transparent hover:border-[#059669] transition-all">
                {link}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16">
        <div className="container-tight">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTIONS.map(({ icon: Icon, title, color, bg, border, items }) => (
              <div key={title} className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden shadow-sm">
                <div className="p-5 border-b border-[#F3F4F6]">
                  <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <h2 className="text-base font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>{title}</h2>
                </div>
                <div className="divide-y divide-[#F3F4F6]">
                  {items.map(item => (
                    <a key={item.title} href={item.href} className="flex items-start gap-3 p-4 hover:bg-[#F8F7F5] transition-colors group">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-[#0F172A] group-hover:text-[#059669] transition-colors mb-0.5">{item.title}</div>
                        <div className="text-xs text-[#6B7280] leading-relaxed">{item.desc}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#059669] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Changelog callout */}
          <div className="mt-10 rounded-xl border border-[#E8E5DF] bg-white p-6 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-bold text-[#059669] uppercase tracking-wider mb-1">Latest</div>
              <div className="text-base font-bold text-[#0F172A]">VIALA Platform v2.4 — Changelog</div>
              <div className="text-sm text-[#6B7280] mt-0.5">Batch risk model improvements, ERP sync v2, and new disposal API endpoints.</div>
            </div>
            <a href="#changelog" className="flex items-center gap-2 text-sm font-bold text-[#059669] hover:gap-3 transition-all whitespace-nowrap ml-6">
              View changelog <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
