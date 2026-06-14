'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Mail, FileText, ArrowRight, CheckCircle, Clock } from 'lucide-react';

const SECTIONS = [
  { id: 'agreement', title: '1. Agreement to Terms' },
  { id: 'eligibility', title: '2. Eligibility' },
  { id: 'accounts', title: '3. Account Responsibilities' },
  { id: 'acceptable-use', title: '4. Acceptable Use' },
  { id: 'payment', title: '5. Subscription & Payment' },
  { id: 'sla', title: '6. Service Level Agreement' },
  { id: 'intellectual-property', title: '7. Intellectual Property' },
  { id: 'confidentiality', title: '8. Confidentiality' },
  { id: 'liability', title: '9. Limitation of Liability' },
  { id: 'termination', title: '10. Termination' },
  { id: 'governing-law', title: '11. Governing Law' },
  { id: 'changes', title: '12. Changes to Terms' },
  { id: 'contact', title: '13. Contact' },
];

export default function TermsOfServicePage() {
  const updated = 'June 1, 2026';
  const [activeSection, setActiveSection] = useState('agreement');

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] pointer-events-none opacity-25 select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 65%)', filter: 'blur(80px)' }} />

        <div className="container-tight relative z-10 max-w-[1000px]">
          <span className="label-tag mb-4 inline-flex bg-blue-50 text-blue-700 border border-blue-100/50">Legal & Operations</span>
          <h1 className="display-lg mb-4 leading-tight tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Terms of Service
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
                          ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                          : 'text-[#6B7280] hover:text-[#0F172A] hover:bg-[#F8F7F5]'
                      }`}
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Service support card */}
              <div className="bg-[#040C0A] text-white rounded-xl p-5 shadow-md relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                <FileText className="w-6 h-6 text-blue-400 mb-3" />
                <h4 className="text-sm font-bold mb-1">Standard B2B SLA</h4>
                <p className="text-[11px] text-[#8E9F9A] leading-relaxed mb-4">
                  We commit to 99.9% uptime for core platform modules and APIs.
                </p>
                <Link href="/pricing" className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                  View Subscriptions <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </aside>

            {/* Right Column: Legible Content Area */}
            <div className="lg:col-span-8 space-y-12">
              {/* Plain English Summary Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-white border border-blue-200/50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-blue-800 uppercase tracking-wider font-mono mb-2">
                      Plain English Summary
                    </h3>
                    <p className="text-sm text-blue-700 leading-relaxed font-medium">
                      By accessing VIALA, you agree to run it lawfully for your own organization, keep credentials safe, and pay subscription invoices on schedule. We back our B2B service with a 99.9% availability SLA. Either party can terminate active subscriptions with a 30-day notice.
                    </p>
                  </div>
                </div>
              </div>

              {/* Segregated Content Sections */}
              <div className="bg-white rounded-2xl border border-[#E8E5DF] p-8 md:p-12 shadow-sm space-y-12 leading-relaxed">
                
                {/* 1. Agreement to Terms */}
                <section id="agreement" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    1. Agreement to Terms
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    These Terms of Service ("Terms") represent a legally binding agreement made between you, whether personally or on behalf of an entity ("you", "customer"), and VIALA Technologies Pvt. Ltd. ("VIALA", "we", "our", "us"), concerning your access to and use of our web application, APIs, and associated inventory services.
                  </p>
                  <p className="text-sm text-[#4B5563]">
                    By creating an enterprise profile, completing an integration setup, or using the platform, you acknowledge that you have read, understood, and agree to be bound by all of these Terms.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 2. Eligibility */}
                <section id="eligibility" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    2. Eligibility
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    You must be at least 18 years of age and hold active legal authority to bind your company or organization to these Terms. 
                  </p>
                  <p className="text-sm text-[#4B5563]">
                    Our services are tailored solely for registered healthcare entities, pharmacies, hospital systems, medicine distributors, and certified non-governmental organizations (NGOs) operating within India.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 3. Account Responsibilities */}
                <section id="accounts" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    3. Account Responsibilities
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    To maintain secure platform credentials:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-[#4B5563]">
                    <li>Ensure all information provided during organizational setup is accurate and complete.</li>
                    <li>Keep user login credentials confidential and secure. Notify us immediately of unauthorized entries.</li>
                    <li>You are entirely responsible for all actions and inventory modifications performed under your workspace.</li>
                    <li>Do not share account licenses across independent hospital networks or unauthorized entities.</li>
                  </ul>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 4. Acceptable Use */}
                <section id="acceptable-use" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    4. Acceptable Use
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    You agree not to use the VIALA system to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-[#4B5563]">
                    <li>Reverse-engineer, decompile, or attempt to extract source algorithms of the Expiry Risk Engine.</li>
                    <li>Upload data belonging to organizations that have not contracted Viala licenses.</li>
                    <li>Introduce malware, scripts, or automated load testing that disrupts platform systems.</li>
                    <li>Coordinate any illegal pharmaceutical trade or violate the Drugs and Cosmetics Act of India.</li>
                  </ul>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 5. Subscription & Payment */}
                <section id="payment" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    5. Subscription & Payment
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    Subscription fees are billed monthly or annually in Indian Rupees (INR). Payments are due on the invoice date. Unresolved invoices remaining overdue for more than 7 days may result in temporary account suspension.
                  </p>
                  <p className="text-sm text-[#4B5563]">
                    New accounts may be eligible for a 14-day evaluation trial with no credit card requirement.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 6. Service Level Agreement */}
                <section id="sla" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    6. Service Level Agreement (SLA)
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    We provide a 99.9% uptime commitment for core API endpoints and inventory sync systems, evaluated monthly. Maintenance periods requiring brief windows of service downtime will be communicated to administrators at least 48 hours in advance.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 7. Intellectual Property */}
                <section id="intellectual-property" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    7. Intellectual Property
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    All application code, proprietary design assets, mathematical predictive weights, and custom SVG dashboard components are owned exclusively by VIALA Technologies Pvt. Ltd. 
                  </p>
                  <p className="text-sm text-[#4B5563]">
                    Your input inventory records, batch tracking numbers, and branch outcomes remain exclusively your proprietary data.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 8. Confidentiality */}
                <section id="confidentiality" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    8. Confidentiality
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    Both parties agree to treat internal corporate information, engineering details, and contract pricing structures as confidential. Neither party will disclose proprietary insights to third parties without prior written consent.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 9. Limitation of Liability */}
                <section id="liability" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    9. Limitation of Liability
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    To the maximum extent permitted by applicable Indian law, VIALA's total liability for any claim arising from system use is capped at the fees paid to VIALA in the 3 months immediately preceding the event. We are not liable for indirect, consequential, or punitive damages.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 10. Termination */}
                <section id="termination" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    10. Termination
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    Either party can terminate active subscription agreements by delivering a 30-day written notice. We reserve the right to suspend or terminate service access immediately for material contract breach, unpaid invoice intervals exceeding 14 days, or illegal activities. 
                  </p>
                  <p className="text-sm text-[#4B5563]">
                    Upon termination, we provide standard data exports and completely purge workspace data within 60 days.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 11. Governing Law */}
                <section id="governing-law" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    11. Governing Law
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    These Terms, and any dispute arising out of or in connection with them, are governed by the laws of India. Any legal action or proceeding shall be brought exclusively in the courts located in Bangalore, Karnataka.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 12. Changes to Terms */}
                <section id="changes" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    12. Changes to Terms
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    We may update these terms to reflect new platform modules or legal parameters. We will communicate any material modifications via email or dashboard notification at least 30 days before they take effect. Continued use of VIALA following the effective date constitutes agreement to the updated terms.
                  </p>
                </section>

                <hr className="border-[#E8E5DF]" />

                {/* 13. Contact */}
                <section id="contact" className="scroll-mt-24 space-y-4">
                  <h2 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    13. Contact
                  </h2>
                  <p className="text-sm text-[#4B5563]">
                    If you have questions regarding these terms, contract parameters, or custom enterprise terms of service, reach out to VIALA Technologies Pvt. Ltd. at:
                  </p>
                  <div className="p-5 bg-[#F8F7F5] rounded-xl border border-[#E8E5DF] text-xs space-y-2">
                    <p className="font-bold text-[#0F172A]">VIALA Technologies Pvt. Ltd.</p>
                    <p className="text-[#6B7280]">Legal Operations & Support</p>
                    <p className="text-[#6B7280]">Email: <a href="mailto:legal@viala.app" className="text-blue-600 hover:underline">legal@viala.app</a></p>
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
