'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, Zap, Shield, Activity, TrendingUp, Clock,
  PieChart, LineChart as LineIcon, Users, Building2, MapPin, Search, Server, Settings, FileText, Lock
} from 'lucide-react';

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatCounter({ value, duration = 1800 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  let prefix = '', suffix = '', target = 0, decimals = 0;
  if (value.startsWith('₹')) { prefix = '₹'; const r = value.slice(1); if (r.endsWith('L')) { suffix = 'L'; target = parseFloat(r); decimals = 0; } else { target = parseInt(r.replace(/,/g, '')); } }
  else if (value.endsWith('x')) { suffix = 'x'; target = parseFloat(value); decimals = 0; }
  else if (value.endsWith('%')) { suffix = '%'; target = parseFloat(value); decimals = 0; }
  else { target = parseInt(value.replace(/,/g, '')); }

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const t0 = performance.now(); let id: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1), ease = p * (2 - p);
      setCount(ease * target);
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [started, target, duration]);

  return <span ref={ref}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}

// ─── Number Animation Hook ────────────────────────────────────────────────────
function useAnimatedValue(targetValue: number, duration = 400) {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const previousValueRef = useRef(targetValue);

  useEffect(() => {
    const startValue = previousValueRef.current;
    if (startValue === targetValue) return;

    const startTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress);
      const nextValue = startValue + (targetValue - startValue) * ease;
      setCurrentValue(nextValue);
      if (progress < 1) frameId = requestAnimationFrame(animate);
      else previousValueRef.current = targetValue;
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, duration]);

  return currentValue;
}

const formatRupees = (valueInCrores: number) => {
  if (valueInCrores < 1) return `₹${(valueInCrores * 100).toFixed(1)} Lakhs`;
  return `₹${valueInCrores.toFixed(2)} Crores`;
};

// ─── Donut Chart Component ──────────────────────────────────────────────────
function BreakdownDonutChart() {
  const data = [
    { label: 'Returns', pct: 42, color: '#2563EB' },
    { label: 'Transfers', pct: 28, color: '#7C3AED' },
    { label: 'Redistribute', pct: 15, color: '#059669' },
    { label: 'Donations', pct: 10, color: '#D97706' },
    { label: 'Disposal', pct: 5, color: '#6B7280' },
  ];
  let currentOffset = 0; const radius = 50, circumference = 2 * Math.PI * radius;
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          {data.map((d, i) => {
            const sd = `${(d.pct / 100) * circumference} ${circumference}`, so = -currentOffset;
            currentOffset += (d.pct / 100) * circumference;
            return (
              <motion.circle key={d.label} cx="60" cy="60" r={radius} fill="transparent" stroke={d.color} strokeWidth="16"
                strokeDasharray={sd} strokeDashoffset={so} initial={{ opacity: 0, strokeDasharray: `0 ${circumference}` }}
                whileInView={{ opacity: 1, strokeDasharray: sd }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-[#6B7280]">Recovery</span>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {data.map(d => (
          <div key={d.label} className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: d.color }} /><span className="font-semibold text-[#374151]">{d.label}</span></div>
            <span className="text-[#6B7280] font-mono">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cost vs Recovery Visual ────────────────────────────────────────────────
function CostVsRecoveryBar() {
  return (
    <div className="bg-[#0A0A0A] rounded-[24px] p-8 lg:p-12 relative overflow-hidden my-20">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 0%, #059669 0%, transparent 60%)' }} />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>The ROI is undeniable.</h2>
          <p className="text-[#9CA3AF] text-sm">Average 12-month performance for a 25-location chain.</p>
        </div>
        
        <div className="space-y-8">
          <div>
            <div className="flex justify-between text-sm font-bold text-white mb-2">
              <span>Annual Subscription Cost</span>
              <span className="font-mono text-[#9CA3AF]">₹3.36 Lakhs</span>
            </div>
            <div className="w-full bg-[#1F2937] h-8 rounded-lg overflow-hidden">
              <motion.div className="h-full bg-[#4B5563] rounded-lg" initial={{ width: 0 }} whileInView={{ width: '4%' }} viewport={{ once: true }} transition={{ duration: 1 }} />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-bold text-white mb-2">
              <span>Recovered Value (Net New Revenue)</span>
              <span className="font-mono text-[#34D399]">₹4.33 Crores</span>
            </div>
            <div className="w-full bg-[#1F2937] h-8 rounded-lg overflow-hidden">
              <motion.div className="h-full bg-[#059669] rounded-lg relative overflow-hidden" initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ duration: 1.5, ease: 'easeOut' }}>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Recovery Timeline ──────────────────────────────────────────────────────
function RecoveryTimeline() {
  const steps = [
    { time: 'Week 1', title: 'Inventory Sync', desc: 'PMS/ERP data ingested automatically.' },
    { time: 'Week 2', title: 'Risk Identified', desc: 'AI highlights all stock expiring in 90 days.' },
    { time: 'Week 3', title: 'First Action', desc: 'Flash sales and network transfers initiated.' },
    { time: 'Month 2', title: 'Vendor Credits', desc: 'Returns processed and credits received.' },
    { time: 'Month 3', title: 'Positive ROI', desc: 'Recovered value surpasses subscription cost.' },
  ];
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-black text-[#0F172A] mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>Time to Value</h2>
        <p className="text-[#6B7280] text-sm">How quickly customers see returns.</p>
      </div>
      <div className="relative max-w-4xl mx-auto">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#E8E5DF] -translate-y-1/2 hidden md:block" />
        <div className="absolute top-1/2 left-0 h-1 bg-[#059669] -translate-y-1/2 hidden md:block" style={{ width: '100%' }} />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.time} className="relative z-10 flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <div className="w-10 h-10 rounded-full bg-white border-4 border-[#059669] flex items-center justify-center flex-shrink-0 md:mb-4 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-1">{s.time}</div>
                <div className="text-sm font-bold text-[#0F172A] mb-1">{s.title}</div>
                <div className="text-xs text-[#6B7280] leading-relaxed">{s.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────
export default function PricingPage() {
  const [branches, setBranches] = useState<number>(25);
  const [inventoryVal, setInventoryVal] = useState<number>(5.5);
  const [monthlyTx, setMonthlyTx] = useState<number>(500);

  const baselineLoss = (inventoryVal * 12) * 0.08;
  const recoveryVal = baselineLoss * 0.82;
  const subFee = branches === 1 ? 0.0096 : branches <= 25 ? 0.0336 : 0.0336 + (branches - 25) * 0.0012;
  const netSavings = recoveryVal - subFee;

  const animatedBaseline = useAnimatedValue(baselineLoss);
  const animatedRecovery = useAnimatedValue(recoveryVal);
  const animatedNet = useAnimatedValue(netSavings);

  const recommendedTier = branches === 1 ? 'Starter' : branches <= 25 ? 'Growth' : 'Enterprise';

  return (
    <div className="flex flex-col bg-[#FAFAF8] min-h-screen">
      
      {/* ── 1. HERO & LIVE ROI SNAPSHOT ───────────────────────────────────── */}
      <section className="pt-24 pb-16 border-b border-[#E8E5DF] bg-white">
        <div className="container-tight text-center max-w-[800px] mx-auto">
          <span className="label-tag mb-6 inline-flex border-[#059669] text-[#059669] bg-[#F0FDF4]">Pricing & ROI</span>
          <h1 className="text-5xl md:text-6xl font-black text-[#0F172A] mb-6 tracking-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Transparent Pricing.<br />
            <span className="text-[#059669]">Serious ROI.</span>
          </h1>
          <p className="text-lg text-[#6B7280] mb-12 max-w-[600px] mx-auto">
            VIALA is priced to guarantee a massive return. You aren't buying software — you are recovering lost revenue.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#0A0A0A] border border-[#1F2937] shadow-xl text-white">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest text-[#9CA3AF] bg-[#1F2937] px-3 py-1 rounded-b-lg">Average Customer Results</div>
            {[
              { label: 'Recovered Annually', val: '₹24L', color: '#34D399' },
              { label: 'Subscription ROI', val: '8x', color: '#60A5FA' },
              { label: 'Waste Reduction', val: '94%', color: '#A78BFA' },
              { label: 'Decision Time', val: '6 min', color: '#FCD34D' },
            ].map((s, i) => (
              <motion.div key={s.label} className="p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i*0.1 }}>
                <div className="text-3xl font-black mb-1" style={{ color: s.color }}><StatCounter value={s.val} /></div>
                <div className="text-[10px] uppercase font-bold text-[#9CA3AF] tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. PRICING CARDS UPGRADE ──────────────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F5]">
        <div className="container-tight">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Starter */}
            <div className="bg-white rounded-2xl p-8 border border-[#E8E5DF] shadow-sm flex flex-col">
              <div className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-3">Starter</div>
              <h3 className="text-2xl font-black text-[#0F172A] mb-1">Contact Sales</h3>
              <p className="text-sm text-[#6B7280] mb-6">Starting from ₹8,000/mo</p>
              
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] mb-6 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#6B7280]">Typical Recovery:</span>
                  <span className="font-black text-[#0F172A]">₹4L–₹12L/yr</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#6B7280]">Average ROI:</span>
                  <span className="font-black text-[#059669]">6x</span>
                </div>
              </div>

              <div className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider mb-3">Ideal For</div>
              <p className="text-sm text-[#4B5563] mb-6 border-b border-[#E8E5DF] pb-6">Single-location pharmacies looking to automate expiry alerts and vendor returns.</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                {['Up to 1 location', 'Expiry tracking & alerts', 'Basic Decision Engine', 'Vendor return workflows'].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#4B5563]"><CheckCircle className="w-4 h-4 text-[#9CA3AF] mt-0.5 flex-shrink-0" /> {f}</li>
                ))}
              </ul>
              <Link href="/get-started" className="w-full block text-center py-3 rounded-lg text-sm font-bold bg-[#F3F4F6] text-[#0F172A] hover:bg-[#E5E7EB] transition-colors">Talk to Sales</Link>
            </div>

            {/* Growth */}
            <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#1F2937] shadow-xl flex flex-col relative transform scale-105 z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#059669] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">Most Customers Choose This</div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#34D399] mb-3">Growth</div>
              <h3 className="text-2xl font-black text-white mb-1">Contact Sales</h3>
              <p className="text-sm text-[#9CA3AF] mb-6">Starting from ₹28,000/mo</p>
              
              <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] mb-6 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#059669]/20 text-[#34D399] text-[9px] font-bold px-2 py-1 rounded-bl-lg">Payback ~40 Days</div>
                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="font-bold text-[#9CA3AF]">Typical Recovery:</span>
                  <span className="font-black text-white">₹25L–₹1.2Cr/yr</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#9CA3AF]">Average ROI:</span>
                  <span className="font-black text-[#34D399]">10x</span>
                </div>
              </div>

              <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-3">Ideal For</div>
              <p className="text-sm text-[#D1D5DB] mb-6 border-b border-[#374151] pb-6">Chains of 2–25 locations needing branch transfers, full lifecycle routing, and compliance.</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                {['Up to 25 locations', 'Full Lifecycle Engine', 'Branch transfers & redistribution', 'Donation workflows', 'Compliance audit trail'].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#D1D5DB]"><CheckCircle className="w-4 h-4 text-[#34D399] mt-0.5 flex-shrink-0" /> {f}</li>
                ))}
              </ul>
              <Link href="/get-started" className="w-full block text-center py-3 rounded-lg text-sm font-bold bg-[#059669] text-white hover:bg-[#047857] shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all">Request a Demo</Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl p-8 border border-[#E8E5DF] shadow-sm flex flex-col">
              <div className="text-xs font-bold uppercase tracking-widest text-[#6B7280] mb-3">Enterprise</div>
              <h3 className="text-2xl font-black text-[#0F172A] mb-1">Custom</h3>
              <p className="text-sm text-[#6B7280] mb-6">Volume pricing available</p>
              
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] mb-6 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#6B7280]">Typical Recovery:</span>
                  <span className="font-black text-[#0F172A]">₹2Cr+</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#6B7280]">Implementation:</span>
                  <span className="font-black text-[#2563EB]">Dedicated Team</span>
                </div>
              </div>

              <div className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider mb-3">Ideal For</div>
              <p className="text-sm text-[#4B5563] mb-6 border-b border-[#E8E5DF] pb-6">Hospital networks and massive retail chains requiring deep ERP integrations and SOC2 compliance.</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                {['Unlimited locations', 'Network Intelligence Engine', 'Custom ERP/PMS integration', 'Dedicated implementation manager', 'SOC 2 & HIPAA docs'].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#4B5563]"><CheckCircle className="w-4 h-4 text-[#9CA3AF] mt-0.5 flex-shrink-0" /> {f}</li>
                ))}
              </ul>
              <Link href="/get-started" className="w-full block text-center py-3 rounded-lg text-sm font-bold bg-[#F3F4F6] text-[#0F172A] hover:bg-[#E5E7EB] transition-colors">Contact Enterprise Team</Link>
            </div>
          </div>
          
          {/* ── 3. TIMELINE ─────────────────────────────────────────────────── */}
          <RecoveryTimeline />
        </div>
      </section>

      {/* ── 4 & 5. ENHANCED ROI CALCULATOR ────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-[#E8E5DF]">
        <div className="container-tight max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="display-md text-[#0F172A] mb-3">Calculate Your Specific ROI</h2>
            <p className="text-[#6B7280] text-sm">See exactly how much revenue VIALA can rescue based on your scale.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-[#E8E5DF] rounded-[24px] shadow-sm overflow-hidden">
            
            {/* Input Controls */}
            <div className="lg:col-span-5 p-8 border-b lg:border-b-0 lg:border-r border-[#E8E5DF] bg-[#FAFAF8] space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  <span>Locations</span>
                  <span className="text-[#059669] font-mono">{branches}</span>
                </div>
                <input type="range" min="1" max="150" value={branches} onChange={e => setBranches(Number(e.target.value))} className="w-full h-2 bg-[#E8E5DF] rounded-lg appearance-none cursor-pointer accent-[#059669]" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  <span>Monthly Inventory Value</span>
                  <span className="text-[#059669] font-mono">₹{inventoryVal.toFixed(1)} Cr</span>
                </div>
                <input type="range" min="0.5" max="25" step="0.5" value={inventoryVal} onChange={e => setInventoryVal(Number(e.target.value))} className="w-full h-2 bg-[#E8E5DF] rounded-lg appearance-none cursor-pointer accent-[#059669]" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  <span>Monthly Transactions</span>
                  <span className="text-[#059669] font-mono">{monthlyTx}</span>
                </div>
                <input type="range" min="50" max="2500" step="50" value={monthlyTx} onChange={e => setMonthlyTx(Number(e.target.value))} className="w-full h-2 bg-[#E8E5DF] rounded-lg appearance-none cursor-pointer accent-[#059669]" />
              </div>

              {/* AI Recommendation Card */}
              <div className="p-5 rounded-xl bg-white border border-[#E8E5DF] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#059669]" />
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">
                  <Activity className="w-3 h-3 text-[#059669]" /> AI Recommendation
                </div>
                <div className="flex justify-between items-end mb-2">
                  <div className="text-lg font-black text-[#0F172A]">{recommendedTier} Plan</div>
                  <div className="text-[10px] font-bold bg-[#F0FDF4] text-[#059669] px-2 py-1 rounded">Best Fit</div>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Based on your {branches} location{branches>1?'s':''} and volume, this plan maximizes ROI through {branches>1?'network transfers and automated vendor returns':'automated vendor return workflows'}.
                </p>
              </div>
            </div>

            {/* Results Dashboard */}
            <div className="lg:col-span-7 p-8 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 border border-[#FCA5A5] bg-[#FEF2F2] rounded-xl relative overflow-hidden">
                  <div className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider mb-1">Baseline Expiry Waste</div>
                  <div className="text-2xl font-black text-[#991B1B] font-mono">{formatRupees(animatedBaseline)}</div>
                  <div className="text-[10px] text-[#EF4444] mt-1">Status Quo (8% Loss)</div>
                </div>
                <div className="p-4 border border-[#A7F3D0] bg-[#F0FDF4] rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)] relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10"><Zap className="w-20 h-20 text-[#059669]" /></div>
                  <div className="text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-1 relative z-10">Projected Recovery</div>
                  <div className="text-3xl font-black text-[#065F46] font-mono relative z-10">{formatRupees(animatedRecovery)}</div>
                  <div className="text-[10px] font-bold text-[#059669] mt-1 relative z-10">Net Savings: {formatRupees(animatedNet)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-4">Estimated Value Breakdown</div>
                  <BreakdownDonutChart />
                </div>
                <div className="flex flex-col gap-4 justify-center">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9]">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#2563EB]" /><span className="text-xs font-bold text-[#4B5563]">Payback Period</span></div>
                    <span className="text-sm font-black text-[#0F172A]">{branches <= 25 ? '~28 Days' : '~45 Days'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#F1F5F9]">
                    <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#059669]" /><span className="text-xs font-bold text-[#4B5563]">Forecast Confidence</span></div>
                    <span className="text-sm font-black text-[#059669]">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. COST VS RECOVERY VISUAL ─────────────────────────────────────── */}
      <section className="container-tight">
        <CostVsRecoveryBar />
      </section>

      {/* ── 6. CUSTOMER ROI STORIES ────────────────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F5] border-y border-[#E8E5DF]">
        <div className="container-tight">
          <div className="text-center mb-12">
            <h2 className="display-md text-[#0F172A] mb-3">Real organizations. Real revenue.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#E8E5DF] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center"><Building2 className="w-5 h-5 text-[#2563EB]" /></div>
                <div>
                  <h3 className="font-bold text-[#0F172A]">Maharashtra Pharmacy Chain</h3>
                  <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">34 Locations</div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#E8E5DF]">
                <div><div className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider mb-1">Before VIALA</div><div className="text-lg font-bold text-[#991B1B]">₹82L Annual Waste</div></div>
                <ArrowRight className="w-5 h-5 text-[#D1D5DB]" />
                <div className="text-right"><div className="text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-1">After VIALA</div><div className="text-lg font-bold text-[#065F46]">₹6L Annual Waste</div></div>
              </div>
              <div className="bg-[#F0FDF4] rounded-xl p-4 border border-[#A7F3D0] flex justify-between items-center">
                <span className="text-sm font-bold text-[#065F46]">Net Recovered Revenue</span>
                <span className="text-2xl font-black text-[#059669]">₹78 Lakhs</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#E8E5DF] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center"><Building2 className="w-5 h-5 text-[#7C3AED]" /></div>
                <div>
                  <h3 className="font-bold text-[#0F172A]">Tamil Nadu Hospital Network</h3>
                  <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">1200 Beds</div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-[#E8E5DF]">
                <div><div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Compliance Target</div><div className="text-lg font-bold text-[#374151]">100% Audit Readiness</div></div>
                <ArrowRight className="w-5 h-5 text-[#D1D5DB]" />
                <div className="text-right"><div className="text-[10px] font-bold text-[#059669] uppercase tracking-wider mb-1">Audit Failures</div><div className="text-lg font-bold text-[#065F46]">Zero</div></div>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] flex justify-between items-center">
                <span className="text-sm font-bold text-[#0F172A]">Net Recovered Revenue</span>
                <span className="text-2xl font-black text-[#2563EB]">₹1.2 Crores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8 & 10. ENTERPRISE FEATURES & PROCUREMENT ───────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-tight">
          <div className="text-center mb-16">
            <span className="label-tag mb-4 inline-flex">Enterprise Standard</span>
            <h2 className="display-md text-[#0F172A] mb-3">Included with every plan.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { title: 'AI Lifecycle Engine', icon: Activity, desc: 'Automated 90-day expiry detection and outcome routing.' },
              { title: 'Compliance Reporting', icon: FileText, desc: 'Signed, hashed audit trails for disposal and donations.' },
              { title: 'Network Intelligence', icon: Search, desc: 'Real-time visibility across all your pharmacy locations.' },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-xl border border-[#E8E5DF] hover:shadow-md transition-shadow">
                <f.icon className="w-6 h-6 text-[#059669] mb-4" />
                <h4 className="text-base font-bold text-[#0F172A] mb-2">{f.title}</h4>
                <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-[#E8E5DF] pt-16">
            {/* Procurement block */}
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-[#2563EB]" /> Procurement Friendly</h3>
              <div className="space-y-4">
                {['Free Data Migration Included', 'Dedicated Implementation Manager', 'Team Training & Onboarding', 'No Hidden Transaction Fees'].map(p => (
                  <div key={p} className="flex items-center gap-3 p-4 rounded-lg bg-[#F8F7F5] border border-[#E8E5DF]">
                    <CheckCircle className="w-5 h-5 text-[#059669]" />
                    <span className="text-sm font-bold text-[#374151]">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Security block */}
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-[#059669]" /> Enterprise Security</h3>
              <div className="grid grid-cols-2 gap-4">
                {['SOC2 Ready', 'HIPAA Aligned', 'AES-256 Encryption', 'RBAC Controls', 'Immutable Audit Logs', '99.9% Uptime SLA'].map(s => (
                  <div key={s} className="p-4 text-center rounded-lg border border-[#E8E5DF] flex flex-col items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. INTERACTIVE COMPARISON TABLE ────────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F5] border-t border-[#E8E5DF]">
        <div className="container-tight">
          <h2 className="text-center display-md mb-12">Compare features in detail.</h2>
          <div className="rounded-[16px] border overflow-hidden bg-white border-[#E4E0D9] shadow-sm">
            <div className="grid grid-cols-4 border-b border-[#E4E0D9]">
              <div className="p-5 text-sm font-semibold text-[#0D0D0D]">Capabilities</div>
              <div className="p-5 text-center text-sm font-bold text-[#6B7280]">Starter</div>
              <div className="p-5 text-center text-sm font-bold text-[#059669]">Growth</div>
              <div className="p-5 text-center text-sm font-bold text-[#0D0D0D]">Enterprise</div>
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-4 border-b last:border-0 border-[#F2F0ED] hover:bg-[#F8FAFC] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}`}>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm text-[#404040] font-medium">{row.feature}</span>
                  {(row.feature.includes('Audit') || row.feature.includes('dashboard')) && (
                    <span className="text-[9px] font-bold bg-[#E2E8F0] text-[#475569] px-2 py-1 rounded cursor-pointer hover:bg-[#CBD5E1]">PREVIEW</span>
                  )}
                </div>
                {[row.starter, row.growth, row.enterprise].map((val, j) => (
                  <div key={j} className="p-4 flex items-center justify-center">
                    {val === true ? <CheckCircle className="w-4 h-4 text-[#059669]" /> : val === false ? <span className="text-[#D1D5DB]">—</span> : (
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-[#FEF3C7] text-[#B45309]">{val}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. FINAL CTA ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A] border-t border-[#1F2937] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 100%, #059669 0%, transparent 60%)' }} />
        <div className="container-tight text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6" style={{ fontFamily: 'var(--font-jakarta)' }}>See Your Recovery Potential.</h2>
          <p className="text-lg text-[#9CA3AF] mb-10 max-w-[600px] mx-auto">
            Most VIALA customers recover <strong className="text-white">8–12x their subscription cost</strong> within the first 12 months. Let our experts run a live simulation on your data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/get-started" className="px-8 py-4 rounded-xl text-sm font-bold bg-[#059669] text-white hover:bg-[#047857] shadow-[0_0_30px_rgba(5,150,105,0.4)] transition-all flex items-center gap-2">
              Book Assessment <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/outcomes" className="px-8 py-4 rounded-xl text-sm font-bold border border-[#374151] text-white bg-[#1F2937]/50 hover:bg-[#1F2937] transition-all">
              Explore Product Workflows
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const COMPARE = [
  { feature: 'Expiry tracking & alerts', starter: true, growth: true, enterprise: true },
  { feature: 'Decision Engine recommendations', starter: 'Basic', growth: true, enterprise: true },
  { feature: 'Vendor return automation', starter: true, growth: true, enterprise: true },
  { feature: 'Branch-to-branch transfers', starter: false, growth: true, enterprise: true },
  { feature: 'Network redistribution', starter: false, growth: true, enterprise: true },
  { feature: 'Donation workflow & certificates', starter: false, growth: true, enterprise: true },
  { feature: 'Compliance audit trail', starter: 'Basic', growth: true, enterprise: true },
  { feature: 'Mission Control dashboard', starter: false, growth: true, enterprise: true },
  { feature: 'Custom PMS/ERP integration', starter: false, growth: false, enterprise: true },
  { feature: 'SOC2 / HIPAA documentation', starter: false, growth: false, enterprise: true },
  { feature: 'Dedicated implementation manager', starter: false, growth: false, enterprise: true },
];
