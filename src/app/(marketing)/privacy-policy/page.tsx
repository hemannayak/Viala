'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Mail, FileText, ArrowRight, CheckCircle, Clock } from 'lucide-react';

const SECTIONS = [
  { id: 'who-we-are', title: '1. Who We Are' },
  { id: 'data-collect', title: '2. What Data We Collect' },
  { id: 'data-use', title: '3. How We Use Your Data' },
  { id: 'data-storage', title: '4. Data Storage & Residency' },
  { id: 'data-retention', title: '5. Data Retention' },
  { id: 'third-party', title: '6. Third-Party Processors' },
  { id: 'your-rights', title: '7. Your Rights' },
  { id: 'cookies', title: '8. Cookies' },
  { id: 'security', title: '9. Security' },
  { id: 'policy-changes', title: '10. Changes to This Policy' },
  { id: 'contact', title: '11. Contact' },
];

export default function PrivacyPolicyPage() {
  const updated = 'June 1, 2026';
  const [activeSection, setActiveSection] = useState('who-we-are');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#F8F7F5] text-[#0F172A]">
      {/* Hero */}
      <section className="bg-white border-b border-[#E8E5DF] py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] pointer-events-none opacity-20 select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.3) 0%, transparent 65%)', filter: 'blur(80px)' }} />

        <div className="container-tight relative z-10 max-w-[1000px]">
          <span className="label-tag mb-4 inline-flex bg-emerald-50 text-emerald-700 border border-emerald-100/50">Legal & Security</span>
          <h1 className="display-lg mb-4 leading-tight tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Privacy Policy
          </h1>
          <div className="flex items-center gap-4 text-xs font-semibold text-[#6B7280]">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last updated: {updated}</span>
            <span>·</span>
            <span>Effective: {updated}</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-16">
        <div className="container-tight max-w-[1000px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Sticky Sidebar Index */}
            <aside className="lg:col-span-4 sticky top-24 hidden lg:block space-y-6">
              <div className="bg-white rounded-xl border border-[#E8E5DF] p-6 shadow-sm">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF] mb-4 font-mono">
                  Document Sections
                </h3>
                <nav className="space-y-1">
                  {SECTIONS.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`block px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                        activeSection === section.id
                          ? 'bg-emerald-50 text-[#059669] border-l-2 border-[#059669]'
                          : 'text-[#6B7280] hover:text-[#0F172A] hover:bg-[#F8F7F5]'
                      }`}
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Security info card */}
              <div className="bg-[#040C0A] text-white rounded-xl p-5 shadow-md relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                <Shield className="w-6 h-6 text-emerald-400 mb-3" />
                <h4 className="text-sm font-bold mb-1">Cryptographic Security</h4>
                <p className="text-[11px] text-[#8E9F9A] leading-relaxed mb-4">
                  We use industry-grade AES-256 encryption at rest and TLS 1.3 in transit.
                </p>
                <Link href="/security" className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1">
                  View Security Profile <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </aside>

            {/* Right Column: Legible Content Area */}
            <div className="lg:col-span-8 space-y-12">
              {/* Plain English Summary Box */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200/50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-800 uppercase tracking-wider font-mono mb-2">
                      Plain English Summary
                    </h3>
                    <p className="text-sm text-emerald-700 leading-relaxed font-medium">
                      VIALA collects only the data required to deliver our inventory lifecycle service. We never sell your data. All database records reside on secure servers in India (AWS ap-south-1). You retain ownership and can request complete account deletion at any time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Segregated Content Sections */}
              <div className="bg-white rounded-2xl border border-[#E8E5DF] p-8 md:p-12 shadow-sm space-y-12 leading-relaxed">
                
                {/* 1. Who We Are */}
                <section id="who-we-are" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    1. Who We Are
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    VIALA Technologies Pvt. Ltd. ("VIALA", "we", "our", "us") operates the pharmaceutical inventory lifecycle management platform. Our registered office is located in India. 
                  </p>
                  <p className="text-sm text-[#4B5563]">
                    If you have any questions about this Privacy Policy, your personal data, or data practices, please reach out to our Data Protection Officer at: <a href="mailto:privacy@viala.app" className="text-emerald-600 font-bold hover:underline">privacy@viala.app</a>.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 2. What Data We Collect */}
                <section id="data-collect" className="scroll-mt-24 space-y-6">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    2. What Data We Collect
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    We collect several types of information to provide, secure, and improve our services:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#F8F7F5] border border-[#E8E5DF]/60">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1 font-mono">Account Information</h4>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        Full name, email address, corporate phone number, organization name, registered business details, and billing coordinates submitted when setting up your account.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F7F5] border border-[#E8E5DF]/60">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1 font-mono">Inventory & Operational Data</h4>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        Medicine names, SKU identifiers, batch numbers, manufacture & expiry dates, unit quantities, cost prices, distributor information, and outcome logs uploaded by your team.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F7F5] border border-[#E8E5DF]/60">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1 font-mono">Usage Data</h4>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        IP addresses, web browser metadata, system activity, error logs, and navigation patterns recorded automatically during system use to optimize interface speeds.
                      </p>
                    </div>
                  </div>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 3. How We Use Your Data */}
                <section id="data-use" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    3. How We Use Your Data
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    We process your data strictly under standard B2B contractual agreements and applicable Indian healthcare directives:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-[#4B5563]">
                    <li>Operating core inventory dashboards and running the Expiry Risk Engine.</li>
                    <li>Generating real-time alerts for smart transfers and returns.</li>
                    <li>Structuring signed documentation logs for NGO donation handovers.</li>
                    <li>Verifying system integrity, fraud prevention, and security logs.</li>
                    <li>Fulfilling legal reporting requirements as mandated by state drug controllers.</li>
                  </ul>
                  <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4 mt-2">
                    <p className="text-xs text-amber-800 leading-relaxed font-semibold">
                      ⚠️ AI Training Clause: We do NOT use your private inventory records or organization metrics to train third-party shared AI models.
                    </p>
                  </div>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 4. Data Storage & Residency */}
                <section id="data-storage" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    4. Data Storage & Residency
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    In strict alignment with data sovereignty expectations in India:
                  </p>
                  <p className="text-sm text-[#4B5563] font-semibold text-[#059669]">
                    ● All primary database tables, document assets, and application storage files reside on AWS Mumbai (ap-south-1) servers within the physical boundaries of India.
                  </p>
                  <p className="text-sm text-[#4B5563]">
                    We do not move personal data outside of India without your prior authorization or contract instructions.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 5. Data Retention */}
                <section id="data-retention" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    5. Data Retention
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    We retain account databases for the active duration of your subscription plus 12 months. Upon contract termination or cancellation, we completely erase, overwrite, or anonymize organization records within 60 days of written instruction.
                  </p>
                  <p className="text-sm text-[#4B5563]">
                    Please note that compliance records (e.g. batch destruction notes and CDSCO-compliant disposal logs) may be retained up to the legally required timeline (typically 5 to 7 years) to fulfill regulatory audit expectations.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 6. Third-Party Processors */}
                <section id="third-party" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    6. Third-Party Processors
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    We partner with select infrastructure and service sub-processors under strict confidentiality guidelines. This includes AWS (for web hosting), Stripe (for processing subscription payments), and Resend (for sending email notifications). We maintain updated Data Processing Agreements (DPAs) with each partner.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 7. Your Rights */}
                <section id="your-rights" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    7. Your Rights
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    Under Indian digital data privacy regulations and contract defaults, you hold complete control over your data, including the right to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-[#4B5563]">
                    <li>Request full access or data extracts in CSV/JSON format.</li>
                    <li>Update or modify incorrect organization records.</li>
                    <li>Request erasure of personal information ("right to be forgotten").</li>
                    <li>Restrict or object to processing parameters.</li>
                  </ul>
                  <p className="text-sm text-[#4B5563]">
                    Submit your requests to <a href="mailto:privacy@viala.app" className="text-emerald-600 font-bold hover:underline">privacy@viala.app</a>. We process all standard requests within 30 days.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 8. Cookies */}
                <section id="cookies" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    8. Cookies
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    We use cookies and active storage features to keep session credentials active, track preferences, and run interface analytics. You can adjust and restrict these preferences anytime through our interactive <a href="/cookie-policy" className="text-emerald-600 font-bold hover:underline">Cookie Policy settings</a>.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 9. Security */}
                <section id="security" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    9. Security
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    We are dedicated to safeguarding critical inventory records. Viala enforces role-based access control (RBAC), end-to-end encryption in transit (TLS 1.3), and encryption at rest (AES-256). Read our full structural outline on the <a href="/security" className="text-emerald-600 font-bold hover:underline">Security details page</a>.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 10. Changes to This Policy */}
                <section id="policy-changes" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    10. Changes to This Policy
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    We may update this policy periodically to align with regulatory adjustments or product revisions. We will notify you via dashboard notifications or direct email at least 30 days before any material changes take effect.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 11. Contact */}
                <section id="contact" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    11. Contact Us
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    If you have questions regarding these privacy parameters or need to coordinate a data extraction, contact VIALA Technologies Pvt. Ltd. at:
                  </p>
                  <div className="p-5 bg-[#F8F7F5] rounded-xl border border-[#E8E5DF] text-xs space-y-2">
                    <p className="font-bold text-[#0F172A]">VIALA Technologies Pvt. Ltd.</p>
                    <p className="text-[#6B7280]">Attn: Privacy Officer & Data Custodian</p>
                    <p className="text-[#6B7280]">Email: <a href="mailto:privacy@viala.app" className="text-emerald-600 hover:underline">privacy@viala.app</a></p>
                  </div>
                </section>

              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
