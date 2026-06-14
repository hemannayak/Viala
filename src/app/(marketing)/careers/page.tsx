'use client';

import Link from 'next/link';
import { Briefcase, Mail, Send, Sparkles, MapPin, ArrowRight } from 'lucide-react';

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F5] text-[#0F172A]">
      {/* Hero */}
      <section className="relative bg-white border-b border-[#E8E5DF] py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] pointer-events-none opacity-25 select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.35) 0%, transparent 65%)', filter: 'blur(80px)' }} />

        <div className="container-tight relative z-10 text-center max-w-3xl">
          <span className="label-tag mb-6 inline-flex bg-emerald-50 text-emerald-700 border border-emerald-100/50">Careers</span>
          <h1 className="display-lg mb-6 leading-tight tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Join our mission to eliminate medicine waste.
          </h1>
          <p className="body-lg text-[#6B7280] max-w-2xl mx-auto">
            We are systems engineers, machine learning scientists, and operations professionals rebuilding the pharmaceutical lifecycle layer for Indian healthcare.
          </p>
        </div>
      </section>

      {/* No open roles alert */}
      <section className="py-20">
        <div className="container-tight max-w-2xl">
          <div className="bg-white rounded-2xl border border-[#E8E5DF] p-10 md:p-12 shadow-sm text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#FFFDF9]/60 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6 border border-amber-100/50">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-[#0F172A] mb-3" style={{ fontFamily: 'var(--font-jakarta)' }}>
                No Active Openings Right Now
              </h2>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-md mx-auto mb-8">
                We don't have any active job openings at the moment. However, we're always looking for exceptional minds to join our talent pool for future roles.
              </p>
              
              <div className="h-px bg-[#E8E5DF] w-full my-8" />
              
              <h3 className="text-sm font-bold text-[#0F172A] mb-4 uppercase tracking-wider font-mono">Join the Talent Pool</h3>
              <p className="text-xs text-[#525252] mb-6 max-w-sm mx-auto leading-relaxed">
                If you are passionate about AI supply chains, CDSCO compliance systems, or B2B SaaS architecture, drop your CV and a brief introduction at:
              </p>
              
              <a 
                href="mailto:careers@viala.app" 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0F172A] text-white hover:bg-emerald-600 transition-colors text-xs font-bold shadow-sm cursor-pointer"
              >
                <Mail className="w-4 h-4" /> careers@viala.app
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Culture pillars */}
      <section className="py-20 bg-white border-t border-b border-[#E8E5DF]">
        <div className="container-tight">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="label-tag mb-4 inline-flex">Life at VIALA</span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>How We Work Together</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "High Agency & Autonomy",
                desc: "We trust our team to own products end-to-end. We value builders who identify problems and deploy solutions autonomously."
              },
              {
                title: "Mission-Driven Focus",
                desc: "Every line of code and operation we run directly prevents safe, life-saving medicines from ending up in Indian landfills."
              },
              {
                title: "Rigorous Simplicity",
                desc: "We solve complex logistical and regulatory problems by building clean, beautifully designed, and highly stable software."
              }
            ].map(pillar => (
              <div key={pillar.title} className="p-6 rounded-xl bg-[#F8F7F5] border border-[#E8E5DF]">
                <h3 className="font-bold text-[#0F172A] mb-2 text-base" style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-[#F8F7F5] text-center">
        <div className="container-tight max-w-3xl">
          <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-[#0F172A] mb-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Want to learn more about the platform?
          </h2>
          <p className="text-sm text-[#6B7280] max-w-md mx-auto mb-8 leading-relaxed">
            See how Viala is automating inventory risk routing, vendor returns, and compliant donations for healthcare chains.
          </p>
          <Link href="/how-it-works" className="btn-primary inline-flex items-center gap-2">
            See How It Works <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
