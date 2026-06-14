'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Heart, ShieldCheck, Activity, Award, ArrowRight, 
  Users, Building, Zap, CheckCircle2, TrendingUp, Sparkles
} from 'lucide-react';

// ─── Animated counter on scroll ───────────────────────────────────────────────
function StatCounter({ value, duration = 1800 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  let prefix = '', suffix = '', target = 0, decimals = 0;
  if (value.startsWith('₹')) {
    prefix = '₹';
    const r = value.slice(1);
    if (r.endsWith('M+')) {
      suffix = 'M+';
      target = parseFloat(r);
      decimals = 1;
    } else if (r.endsWith('Cr+')) {
      suffix = ' Cr+';
      target = parseFloat(r);
      decimals = 1;
    } else {
      target = parseInt(r.replace(/,/g, ''));
    }
  } else if (value.endsWith('%')) {
    suffix = '%';
    target = parseInt(value);
  } else if (value.endsWith('+')) {
    suffix = '+';
    target = parseInt(value.slice(0, -1));
  } else {
    target = parseInt(value.replace(/,/g, ''));
  }

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setStarted(true);
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const t0 = performance.now();
    let id: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = p * (2 - p);
      setCount(ease * target);
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [started, target, duration]);

  const fmt = () => {
    if (decimals > 0) return `${prefix}${count.toFixed(decimals)}${suffix}`;
    return `${prefix}${Math.floor(count).toLocaleString('en-IN')}${suffix}`;
  };
  return <span ref={ref}>{fmt()}</span>;
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F8F7F5] text-[#0F172A]">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative bg-white border-b border-[#E8E5DF] py-24 md:py-32 overflow-hidden">
        {/* Soft background mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] pointer-events-none opacity-20 select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.4) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        
        <div className="container-tight relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="label-tag mb-6 inline-flex bg-emerald-50 text-emerald-700 border border-emerald-100/50">Our Mission</span>
            <h1 className="display-lg mb-6 leading-tight tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Making every single medicine matter.
            </h1>
            <p className="body-lg text-[#525252] max-w-2xl mx-auto mb-10">
              Viala is building the intelligent lifecycle infrastructure for India's pharmaceutical ecosystem, preventing waste and ensuring life-saving drugs reach patients before it's too late.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/get-started" className="btn-primary flex items-center gap-2">
                Join our network <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/how-it-works" className="px-5 py-3 text-sm font-semibold rounded-[10px] border border-[#E8E5DF] hover:bg-[#F3F4F6] transition-all bg-white text-[#404040]">
                See the platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Challenge Section ────────────────────────────────────────── */}
      <section className="py-20 bg-white border-b border-[#E8E5DF]">
        <div className="container-tight">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-[10px] font-black tracking-widest text-[#B45309] uppercase font-mono bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">The Problem</span>
              <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] mt-4 mb-6 leading-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
                India's ₹15,000 Crore inventory blindspot.
              </h2>
              <p className="text-[#4B5563] leading-relaxed mb-6">
                Every year, billions in critical healthcare capital are written off because of near-expiry stocks, fragmented tracking, and convoluted return processes. 
              </p>
              <p className="text-[#4B5563] leading-relaxed">
                Meanwhile, vital medicines go out of stock in regional clinics just hours away. Viala replaces reactive inventory management with dynamic lifecycle orchestration.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Fragmented Supply Networks",
                  desc: "Branches operate as disconnected islands. Near-expiry items expire on shelves while neighboring clinics face stockouts."
                },
                {
                  title: "Manual Vendor Audits",
                  desc: "Filing return claims and managing credit notes manually takes weeks and leaves substantial credits unrecovered."
                },
                {
                  title: "NGO Coordination Gaps",
                  desc: "Donating near-expiry medicines is legally risky and operationally complex, leading pharmacies to simply dispose of safe stock."
                },
                {
                  title: "Non-Compliant Disposal",
                  desc: "Improper waste destruction poses massive environmental and public health concerns. Audit trails are rarely CDSCO-ready."
                }
              ].map((item, index) => (
                <div key={index} className="bg-[#F8F7F5] rounded-xl border border-[#E8E5DF] p-6 transition-all duration-300 hover:border-emerald-600/20 hover:shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xs mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-2 text-base" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values / Pillars Section ─────────────────────────────────────── */}
      <section className="py-20">
        <div className="container-tight">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="label-tag mb-4 inline-flex">How We Build</span>
            <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>Our Core Pillars</h2>
            <p className="text-[#6B7280] mt-2">The engineering principles and values guiding our product decisions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Intelligence First",
                desc: "We build predictive ML models to track batch velocity, letting healthcare networks route medicine to where it is needed most."
              },
              {
                icon: ShieldCheck,
                title: "Absolute Integrity",
                desc: "We ensure compliance-grade tracking. Every action, signed consent form, and donation certificate is auditable and tamper-proof."
              },
              {
                icon: Heart,
                title: "Community Focused",
                desc: "By partnering with trusted NGOs across India, we rescue eligible batch surplus and direct them to underprivileged communities."
              }
            ].map((pillar, i) => (
              <div key={pillar.title} className="bg-white rounded-xl border border-[#E8E5DF] p-8 shadow-sm flex flex-col items-start transition-all hover:border-[#059669]/30 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#0F172A] mb-3" style={{ fontFamily: 'var(--font-jakarta)' }}>{pillar.title}</h3>
                <p className="text-sm text-[#525252] leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Impact Statistics ───────────────────────────────────────────── */}
      <section className="py-20 bg-[#040C0A] text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none opacity-30 select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.4) 0%, transparent 65%)', filter: 'blur(70px)' }} />
        
        <div className="container-tight relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Capital Recovered", value: "₹4.19M" },
              { label: "Active Cities", value: "8+" },
              { label: "Rescue Network Partners", value: "45+" },
              { label: "Waste Reduction", value: "92%" }
            ].map((stat, idx) => (
              <div key={idx} className="p-4">
                <div className="text-3xl md:text-5xl font-black text-emerald-400 mb-2 font-mono">
                  <StatCounter value={stat.value} />
                </div>
                <div className="text-xs md:text-sm text-[#8E9F9A] uppercase tracking-wider font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Leadership Team / Team Grid ─────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-b border-[#E8E5DF]">
        <div className="container-tight">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="label-tag mb-4 inline-flex">The Team</span>
            <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>Behind the Platform</h2>
            <p className="text-[#6B7280] mt-2">A group of systems architects, pharmaceutical operations experts, and AI researchers working to solve medicine waste.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Aniket Sharma",
                role: "Co-Founder & CEO",
                bg: "Operations, Pharmacy Supply Chain",
                desc: "Ex-Operations director at leading Indian healthcare chain. Driven to build transparent supply ecosystems."
              },
              {
                name: "Dr. Priya Deshmukh",
                role: "Chief Scientific Officer",
                bg: "Healthcare Compliance & Regulation",
                desc: "Advising on state drug authorities and CDSCO compliance standards. Former clinical trial lead."
              },
              {
                name: "Rohan Varma",
                role: "VP of Engineering",
                bg: "Distributed Systems & Machine Learning",
                desc: "Ex-senior engineer at scale. Passionate about applying AI routing trees to physical medicine distribution."
              }
            ].map((member, i) => (
              <div key={member.name} className="bg-[#F8F7F5] rounded-xl border border-[#E8E5DF] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black font-mono">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>{member.name}</h3>
                      <span className="text-xs font-semibold text-emerald-600">{member.role}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">
                    Focus: {member.bg}
                  </div>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    {member.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─────────────────────────────────────────────────── */}
      <section className="py-20 text-center bg-[#F8F7F5]">
        <div className="container-tight">
          <div className="bg-white rounded-2xl border border-[#E8E5DF] p-10 md:p-16 max-w-3xl mx-auto shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none opacity-50" />
            <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#0F172A] mb-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Let's eliminate medicine expiration together.
            </h2>
            <p className="text-sm text-[#6B7280] leading-relaxed max-w-xl mx-auto mb-8">
              Whether you are an enterprise pharmacy chain, a stand-alone hospital network, or a registered NGO, Viala helps rescue your value and save lives.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/get-started" className="btn-primary">
                Get Started
              </Link>
              <Link href="/pricing" className="text-sm font-bold text-[#0F172A] hover:text-[#059669] transition-colors">
                View Pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
