'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Linkedin, Send, Sparkles, CheckCircle2, Globe, MapPin } from 'lucide-react';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formState.name && formState.email && formState.message) {
      setSubmitted(true);
      setTimeout(() => {
        setFormState({ name: '', email: '', message: '' });
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F7F5] text-[#0F172A]">
      {/* Hero */}
      <section className="relative bg-white border-b border-[#E8E5DF] py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] pointer-events-none opacity-25 select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.35) 0%, transparent 65%)', filter: 'blur(80px)' }} />

        <div className="container-tight relative z-10 max-w-3xl text-center">
          <span className="label-tag mb-6 inline-flex bg-emerald-50 text-emerald-700 border border-emerald-100/50">Contact Us</span>
          <h1 className="display-lg mb-6 leading-tight tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
            We'd love to hear from you.
          </h1>
          <p className="body-lg text-[#6B7280] max-w-2xl mx-auto">
            Get in touch to request a demo, discuss an enterprise partnership, or join our community network.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-20">
        <div className="container-tight">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Contact info + LinkedIn Profile Widget */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-xl font-black text-[#0F172A] mb-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
                  Contact Information
                </h2>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
                  Fill out the contact form, connect with our team via email, or reach out directly through our professional network.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E5DF] flex items-center justify-center text-[#059669]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>hello@viala.app</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E5DF] flex items-center justify-center text-[#059669]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>Mumbai Central, Mumbai, MH, India</span>
                  </div>
                </div>
              </div>

              {/* LinkedIn Profile Widget */}
              <div className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-600/20">
                {/* LinkedIn header style background banner */}
                <div className="h-24 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 relative flex items-end px-6 py-3">
                  <div className="absolute top-3 right-4 bg-white/20 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Linkedin className="w-3.5 h-3.5 fill-current" /> PROFILE
                  </div>
                </div>

                {/* Profile content */}
                <div className="p-6 pt-0 relative">
                  {/* Avatar overlapping header */}
                  <div className="w-16 h-16 rounded-xl bg-white border-2 border-white shadow-md flex items-center justify-center -mt-8 mb-4 overflow-hidden">
                    <div className="bg-emerald-600 text-white font-black text-xl font-sans w-full h-full flex items-center justify-center">
                      V
                    </div>
                  </div>

                  <h3 className="text-base font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    VIALA
                  </h3>
                  <p className="text-xs text-blue-600 font-semibold mb-1">
                    AI Lifecycle Layer for Healthcare
                  </p>
                  <p className="text-[11px] text-[#6B7280] leading-relaxed mb-4">
                    Providing real-time batch auditing, smart branch transfers, automated vendor claims, and CDSCO-compliant donations.
                  </p>
                  
                  {/* LinkedIn Stats */}
                  <div className="flex gap-4 text-[10px] text-[#9CA3AF] font-bold font-mono mb-6">
                    <div>1,240+ FOLLOWERS</div>
                    <div>·</div>
                    <div>10+ EMPLOYEES</div>
                  </div>

                  <a 
                    href="https://www.linkedin.com/company/viala" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0077B5] hover:bg-[#006297] text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <Linkedin className="w-4 h-4 fill-current" /> Connect on LinkedIn
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E5DF] p-8 md:p-10 shadow-sm relative">
              {submitted ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100/50">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    Message Sent Successfully!
                  </h3>
                  <p className="text-sm text-[#6B7280] max-w-sm mx-auto">
                    Thank you for reaching out. A representative from Viala will connect with you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-lg font-black text-[#0F172A] mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    Send a Message
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#525252] mb-2 font-mono">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={e => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Anish Patel"
                      className="w-full px-4 py-3 rounded-lg border border-[#E8E5DF] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#525252] mb-2 font-mono">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={e => setFormState({ ...formState, email: e.target.value })}
                      placeholder="e.g. anish@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-[#E8E5DF] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#525252] mb-2 font-mono">
                      How can we help?
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formState.message}
                      onChange={e => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Tell us about your organization and requirements..."
                      className="w-full px-4 py-3 rounded-lg border border-[#E8E5DF] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#0F172A] hover:bg-emerald-600 text-white font-bold text-sm transition-colors shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Trust Footer banner */}
      <section className="py-12 bg-white border-t border-b border-[#E8E5DF]">
        <div className="container-tight flex flex-wrap items-center justify-around gap-6 text-center">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest font-mono">SOC 2 TYPE II</h4>
            <p className="text-xs font-semibold text-[#0F172A]">Certified Enterprise Infrastructure</p>
          </div>
          <div className="h-8 w-px bg-[#E8E5DF] hidden md:block" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest font-mono">CDSCO COMPLIANCE</h4>
            <p className="text-xs font-semibold text-[#0F172A]">Standardised Audit Trail Outputs</p>
          </div>
          <div className="h-8 w-px bg-[#E8E5DF] hidden md:block" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest font-mono">SLA ASSURED</h4>
            <p className="text-xs font-semibold text-[#0F172A]">99.9% API & Webhook Availability</p>
          </div>
        </div>
      </section>
    </main>
  );
}
