import { ShieldCheck, Lock, Server, Eye, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

const PILLARS = [
  {
    icon: Lock,
    title: 'Encryption',
    desc: 'All data encrypted with AES-256 at rest. All data in transit protected by TLS 1.3. Keys managed via AWS KMS with automatic 90-day rotation.',
  },
  {
    icon: Server,
    title: 'Infrastructure',
    desc: 'Hosted on AWS Mumbai region (ap-south-1) for Indian data residency. Multi-AZ deployment with 99.9% uptime SLA. Automated daily backups with 30-day retention.',
  },
  {
    icon: Eye,
    title: 'Access Control',
    desc: 'Role-based access control (RBAC) with granular permissions per module, branch, and data type. SSO support via SAML 2.0 and OIDC. MFA enforced for all users.',
  },
  {
    icon: AlertTriangle,
    title: 'Vulnerability Management',
    desc: 'Continuous dependency scanning via Snyk. Quarterly third-party penetration tests. Responsible disclosure program with 24-hour acknowledgement SLA.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance',
    desc: 'SOC 2 Type II (in progress). ISO 27001 gap assessment completed. CDSCO compliance framework for pharmaceutical data handling. PDPB-aligned data practices.',
  },
  {
    icon: CheckCircle,
    title: 'Incident Response',
    desc: 'Dedicated security incident response team. Breach notification within 72 hours per regulatory requirements. Full post-incident transparency reports.',
  },
];

const CERTIFICATIONS = [
  { name: 'SOC 2 Type II', status: 'In Progress', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { name: 'ISO 27001', status: 'Gap Assessment Done', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'CDSCO Compliant', status: 'Certified', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { name: 'AWS Well-Architected', status: 'Reviewed', color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F5]">
      {/* Hero */}
      <section className="bg-[#0A0F1A] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, #34D399 0%, transparent 50%)' }} />
        <div className="container-tight relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest text-[#34D399] uppercase border border-[#34D399]/20 bg-[#34D399]/10 px-3 py-1.5 rounded-full mb-6">
              <ShieldCheck className="w-3.5 h-3.5" /> Security
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-5 leading-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Security is not a feature.<br />It's the foundation.
            </h1>
            <p className="text-[#94A3B8] text-lg leading-relaxed">
              VIALA handles sensitive pharmaceutical inventory and patient-adjacent data. We treat security with the same rigour as a hospital system — because our customers' compliance depends on it.
            </p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-white border-b border-[#E8E5DF] py-8">
        <div className="container-tight">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mr-2">Compliance Status</span>
            {CERTIFICATIONS.map(c => (
              <span key={c.name} className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${c.color}`}>
                <CheckCircle className="w-3.5 h-3.5" />
                {c.name}
                <span className="font-normal opacity-70">— {c.status}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Security Pillars */}
      <section className="py-20">
        <div className="container-tight">
          <div className="text-center mb-14">
            <h2 className="display-md mb-3">How we protect your data.</h2>
            <p className="body-lg text-[#6B7280] max-w-lg mx-auto">Six layers of security, built into every part of the VIALA platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILLARS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-[#E8E5DF] p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#D1FAE5] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#059669]" />
                </div>
                <h3 className="text-base font-black text-[#0F172A] mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>{title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="py-16 bg-white border-t border-[#E8E5DF]">
        <div className="container-tight max-w-[700px]">
          <div className="bg-[#0A0F1A] rounded-2xl p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#34D399]/15 border border-[#34D399]/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#34D399]" />
              </div>
              <div>
                <h3 className="text-lg font-black mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>Found a vulnerability?</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
                  We run a responsible disclosure programme. If you discover a security issue in VIALA, please report it privately. We'll acknowledge within 24 hours and remediate critical issues within 72 hours.
                </p>
                <a href="mailto:security@viala.app" className="inline-flex items-center gap-2 text-sm font-bold text-[#34D399] hover:gap-3 transition-all">
                  security@viala.app <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
