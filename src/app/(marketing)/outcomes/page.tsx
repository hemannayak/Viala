'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, RotateCcw, Package, ArrowUpRight, Heart, Trash2,
  ArrowRight, CheckCircle, Zap, Clock, Shield, ChevronRight
} from 'lucide-react';

// ─── Tab Data ─────────────────────────────────────────────────────────────────
const TABS = [
  {
    key: 'sell',
    label: 'Sell',
    icon: TrendingUp,
    accent: '#059669',
    accentLight: '#ECFDF5',
    accentBorder: '#A7F3D0',
    badge: 'Flash Sale',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
    screen: {
      title: 'Flash Sale Engine',
      medicine: 'Dolo 650mg Paracetamol',
      expiry: '85 Days',
      units: '850 units',
      action: 'Flash Sale Activated',
      price: '₹45.00 (−20% MRP)',
      recovery: '₹38,250',
      score: '76/100 Demand Score',
      image: '/screens/flash-sale.png',
    },
    workflow: [
      { step: 'Expiry alert at 90-day threshold', status: 'done' },
      { step: 'Demand scored across all branches', status: 'done' },
      { step: 'Repricing recommendation generated', status: 'done' },
      { step: 'Flash sale push activated at priority locations', status: 'active' },
    ],
    withoutViala: { label: 'Medicine expires unsold', loss: '₹48,000 lost (100%)' },
    withViala: { label: 'Flash sale clears stock', recovered: '₹38,250 recovered (80%)' },
    recoveryRate: '60–90%',
    speed: 'Fast',
    compliance: 'High',
  },
  {
    key: 'return',
    label: 'Return',
    icon: RotateCcw,
    accent: '#2563EB',
    accentLight: '#EFF6FF',
    accentBorder: '#BFDBFE',
    badge: 'Return to Vendor',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    screen: {
      title: 'Vendor Return Center',
      medicine: 'Amoxicillin 500mg',
      expiry: '18 Days Return Window',
      units: '240 eligible units',
      action: 'Return Approved — Cipla',
      price: 'Credit: ₹96,000 (80%)',
      recovery: '₹96,000',
      score: 'Window Closes in 18 Days',
      image: '/screens/vendor-return.png',
    },
    workflow: [
      { step: 'Return window opens (vendor contract matched)', status: 'done' },
      { step: 'Eligible units matched to open return slots', status: 'done' },
      { step: 'Return request auto-prepared & submitted', status: 'done' },
      { step: 'Credit applied to next purchase order', status: 'active' },
    ],
    withoutViala: { label: 'Return window missed', loss: '₹1,20,000 written off (100%)' },
    withViala: { label: 'Vendor credit recovered in time', recovered: '₹96,000 credited (80%)' },
    recoveryRate: '40–75%',
    speed: 'Medium',
    compliance: 'High',
  },
  {
    key: 'transfer',
    label: 'Transfer',
    icon: Package,
    accent: '#7C3AED',
    accentLight: '#F5F3FF',
    accentBorder: '#DDD6FE',
    badge: 'Branch Transfer',
    badgeBg: '#EDE9FE',
    badgeText: '#5B21B6',
    screen: {
      title: 'Branch Transfer Center',
      medicine: 'Metformin 850mg',
      expiry: 'Surplus at Mumbai Central',
      units: '500 → 430 units transferred',
      action: 'Transfer In Progress — Delhi North',
      price: 'Shortage prevented: ₹71,000',
      recovery: '₹84,000',
      score: 'ETA: 48 hours',
      image: '/screens/branch-transfer.png',
    },
    workflow: [
      { step: 'Surplus identified at Mumbai Central branch', status: 'done' },
      { step: 'Shortage detected at Delhi North branch', status: 'done' },
      { step: 'Transfer route optimised & approved', status: 'done' },
      { step: 'Delivery tracked end-to-end', status: 'active' },
    ],
    withoutViala: { label: 'Surplus expires, shortage persists', loss: '₹84,000 wasted + ₹71,000 shortage cost' },
    withViala: { label: 'Surplus moves to where it is needed', recovered: '₹84,000 recovered + shortage resolved' },
    recoveryRate: '85–95%',
    speed: 'Fast',
    compliance: 'High',
  },
  {
    key: 'redistribute',
    label: 'Redistribute',
    icon: ArrowUpRight,
    accent: '#B45309',
    accentLight: '#FFFBEB',
    accentBorder: '#FDE68A',
    badge: 'Network Redistribution',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    screen: {
      title: 'Network Intelligence Engine',
      medicine: 'Lisinopril 10mg (slow-mover)',
      expiry: 'Velocity: 12% below target',
      units: '600 units rebalanced across 4 regions',
      action: 'Redistribution Route Optimised',
      price: 'Sell-through improved +40%',
      recovery: '₹1.1L',
      score: 'Demand signal from 3 branches',
      image: '/screens/mission-control.png',
    },
    workflow: [
      { step: 'Velocity analysis run across all SKUs', status: 'done' },
      { step: 'Underperforming stock flagged by region', status: 'done' },
      { step: 'Redistribution route optimised', status: 'done' },
      { step: 'Shipment executed and tracked across network', status: 'active' },
    ],
    withoutViala: { label: 'Slow-movers accumulate and expire', loss: '₹1.1L in write-offs per quarter' },
    withViala: { label: 'Smart rebalancing to high-velocity regions', recovered: '40% better sell-through, ₹1.1L saved' },
    recoveryRate: '50–80%',
    speed: 'Fast',
    compliance: 'High',
  },
  {
    key: 'donate',
    label: 'Donate',
    icon: Heart,
    accent: '#DB2777',
    accentLight: '#FFF0F8',
    accentBorder: '#FBCFE8',
    badge: 'Donation',
    badgeBg: '#FCE7F3',
    badgeText: '#9D174D',
    screen: {
      title: 'Donation Workflow Center',
      medicine: 'Azithromycin 250mg',
      expiry: '22 Days left',
      units: '320 units matched to HelpAge India',
      action: 'NGO Match: 98% — Donation Approved',
      price: 'Tax benefit: ₹14,400 (80G)',
      recovery: '₹14,400 tax benefit',
      score: '640 patients served',
      image: '/screens/donation.png',
    },
    workflow: [
      { step: 'Donation eligibility confirmed (Schedule H)', status: 'done' },
      { step: 'Partner NGO matched by need & location', status: 'done' },
      { step: 'Compliance paperwork auto-generated', status: 'done' },
      { step: 'Impact certificate & 80G form issued', status: 'active' },
    ],
    withoutViala: { label: 'Viable medicine goes to waste', loss: '₹48,000 wasted + zero CSR benefit' },
    withViala: { label: 'NGO receives medicine, you receive credit', recovered: '₹14,400 tax benefit + CSR credit approved' },
    recoveryRate: 'Tax benefit',
    speed: 'Medium',
    compliance: 'Required',
  },
  {
    key: 'dispose',
    label: 'Dispose',
    icon: Trash2,
    accent: '#6B7280',
    accentLight: '#F9FAFB',
    accentBorder: '#E5E7EB',
    badge: 'Safe Disposal',
    badgeBg: '#F3F4F6',
    badgeText: '#374151',
    screen: {
      title: 'Compliance & Disposal Center',
      medicine: 'Gabapentin 300mg (Biohazard)',
      expiry: 'Expired — Certified Destruction',
      units: '80 units — EcoPharm Disposal',
      action: 'Chain of Custody Locked & Verified',
      price: 'SHA-256 audit hash stored',
      recovery: 'Zero financial loss risk',
      score: 'Schedule M Compliant',
      image: '/screens/compliance.png',
    },
    workflow: [
      { step: 'All upstream outcomes exhausted & logged', status: 'done' },
      { step: 'Destruction protocol selected by regulation type', status: 'done' },
      { step: 'Chain of custody documented with digital signatures', status: 'done' },
      { step: 'Audit record permanently sealed in ledger', status: 'active' },
    ],
    withoutViala: { label: 'Undocumented disposal = audit risk', loss: 'Regulatory fines up to ₹10L + license risk' },
    withViala: { label: 'Fully documented destruction on record', recovered: 'Zero audit risk + Schedule M compliant' },
    recoveryRate: '0% (compliance)',
    speed: 'Controlled',
    compliance: 'Required',
  },
];

const MATRIX = [
  { outcome: 'Sell', icon: TrendingUp, color: '#059669', recovery: '60–90%', speed: '⚡ Fast', compliance: '✅ Standard', best: 'Near-expiry FMCG' },
  { outcome: 'Return', icon: RotateCcw, color: '#2563EB', recovery: '40–75%', speed: '🕐 Medium', compliance: '✅ Standard', best: 'Distributor-tied stock' },
  { outcome: 'Transfer', icon: Package, color: '#7C3AED', recovery: '85–95%', speed: '⚡ Fast', compliance: '✅ Standard', best: 'Multi-branch chains' },
  { outcome: 'Redistribute', icon: ArrowUpRight, color: '#B45309', recovery: '50–80%', speed: '⚡ Fast', compliance: '✅ Standard', best: 'Overstocked slow-movers' },
  { outcome: 'Donate', icon: Heart, color: '#DB2777', recovery: 'Tax benefit', speed: '🕐 Medium', compliance: '📋 Schedule H', best: 'NGO / CSR mandates' },
  { outcome: 'Dispose', icon: Trash2, color: '#6B7280', recovery: '0% (protected)', speed: '🔒 Controlled', compliance: '📋 Required', best: 'Biohazard / expired' },
];

export default function OutcomesPage() {
  const [activeTab, setActiveTab] = useState('sell');
  const current = TABS.find(t => t.key === activeTab)!;

  return (
    <div className="flex flex-col bg-[#FAFAF8]">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="pt-24 pb-16 bg-white border-b border-[#E8E5DF]">
        <div className="container-tight text-center max-w-[680px] mx-auto">
          <span className="label-tag mb-5 inline-flex">The Six Outcomes</span>
          <h1 className="display-lg mb-5">
            Every medicine gets a<br />
            <span className="text-gradient-green">second chance.</span>
          </h1>
          <p className="text-[1.05rem] leading-relaxed text-[#6B7280] mb-10">
            VIALA evaluates each inventory lot against six recovery paths — and executes the one that recovers the most value, automatically.
          </p>

          {/* Live stats strip */}
          <div className="inline-flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold">
            {[
              { val: '₹2.4M+', label: 'Recovered monthly' },
              { val: '94%', label: 'Waste eliminated' },
              { val: '6', label: 'Recovery pathways' },
              { val: '<6 min', label: 'Decision time' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-[#059669] font-black text-base">{s.val}</span>
                <span className="text-[#9CA3AF]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE OUTCOME TABS ───────────────────────────── */}
      <section className="py-16 bg-[#FAFAF8]">
        <div className="container-tight">

          {/* Tab bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {TABS.map(tab => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border"
                  style={{
                    background: isActive ? tab.accent : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#6B7280',
                    borderColor: isActive ? tab.accent : '#E8E5DF',
                    boxShadow: isActive ? `0 4px 16px ${tab.accent}30` : 'none',
                  }}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
            >
              {/* LEFT — Product screen mockup */}
              <div
                className="rounded-2xl border overflow-hidden shadow-lg"
                style={{ borderColor: current.accentBorder }}
              >
                {/* Screen chrome bar */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-b"
                  style={{ background: current.accentLight, borderColor: current.accentBorder }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
                    <span
                      className="ml-3 text-[9px] font-mono font-medium px-2 py-0.5 rounded"
                      style={{ background: current.accentBorder, color: current.accent }}
                    >
                      viala.app/{current.key}-center
                    </span>
                  </div>
                  <span
                    className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse"
                    style={{ background: current.badgeBg, color: current.badgeText }}
                  >
                    {current.badge}
                  </span>
                </div>

                {/* Screenshot */}
                <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                  <Image
                    src={current.screen.image}
                    alt={`VIALA ${current.screen.title}`}
                    fill
                    className="object-cover object-top"
                  />
                </div>

                {/* Quick data strip */}
                <div className="px-4 py-3 border-t grid grid-cols-3 gap-3" style={{ borderColor: current.accentBorder, background: current.accentLight }}>
                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: current.accent }}>Medicine</div>
                    <div className="text-[11px] font-bold text-[#0F172A] leading-tight">{current.screen.medicine.split(' ').slice(0,2).join(' ')}</div>
                  </div>
                  <div className="text-center border-x" style={{ borderColor: current.accentBorder }}>
                    <div className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: current.accent }}>Recovery</div>
                    <div className="text-[11px] font-black leading-tight" style={{ color: current.accent }}>{current.screen.recovery}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: current.accent }}>Status</div>
                    <div className="text-[11px] font-bold text-[#0F172A] leading-tight">Active</div>
                  </div>
                </div>
              </div>

              {/* RIGHT — Workflow + Recovery comparison */}
              <div className="flex flex-col gap-5">

                {/* Workflow steps */}
                <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: current.accentLight }}>
                      <current.icon className="w-4 h-4" style={{ color: current.accent }} />
                    </div>
                    <h3 className="text-sm font-extrabold text-[#0F172A]">{current.screen.title} — How It Works</h3>
                  </div>
                  <div className="relative space-y-0">
                    {current.workflow.map((step, idx) => (
                      <div key={idx} className="flex gap-4 items-stretch">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black z-10"
                            style={{
                              background: step.status === 'active' ? current.accent : current.accentLight,
                              color: step.status === 'active' ? '#FFFFFF' : current.accent,
                              boxShadow: step.status === 'active' ? `0 0 0 3px ${current.accent}25` : 'none',
                            }}
                          >
                            {step.status === 'done' ? '✓' : idx + 1}
                          </div>
                          {idx < current.workflow.length - 1 && (
                            <div className="w-px flex-1 my-1" style={{ background: current.accentBorder }} />
                          )}
                        </div>
                        <div className="pb-4 pt-0.5 flex-1">
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: step.status === 'active' ? '#0F172A' : '#6B7280', fontWeight: step.status === 'active' ? '600' : '400' }}
                          >
                            {step.step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recovery Value Comparison */}
                <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-sm">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-4">Value Recovery — Before vs After</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Without VIALA */}
                    <div className="rounded-xl bg-[#FFF5F5] border border-red-100 p-4">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#EF4444] mb-3">Without VIALA</div>
                      <div className="text-sm text-[#6B7280] mb-3 leading-tight">{current.withoutViala.label}</div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-full h-1.5 rounded-full bg-red-100">
                          <div className="h-full w-0 rounded-full bg-red-400" />
                        </div>
                      </div>
                      <div className="text-sm font-black text-[#EF4444]">{current.withoutViala.loss}</div>
                    </div>

                    {/* With VIALA */}
                    <div className="rounded-xl border p-4" style={{ background: current.accentLight, borderColor: current.accentBorder }}>
                      <div className="text-[9px] font-bold uppercase tracking-wider mb-3" style={{ color: current.accent }}>With VIALA</div>
                      <div className="text-sm text-[#374151] mb-3 leading-tight">{current.withViala.label}</div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-full h-1.5 rounded-full bg-white">
                          <div className="h-full w-4/5 rounded-full transition-all" style={{ background: current.accent }} />
                        </div>
                      </div>
                      <div className="text-sm font-black" style={{ color: current.accent }}>{current.withViala.recovered}</div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/get-started"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-[1px] hover:shadow-lg"
                  style={{ background: current.accent }}
                >
                  See {current.label} in a Live Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── MISSION CONTROL SHOWCASE ──────────────────────────── */}
      <section className="py-0 bg-[#080F1A]">
        <div className="container-tight py-20">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#34D399] bg-[#064E3B]/40 px-3 py-1 rounded-full border border-[#059669]/30 mb-4">
              Mission Control
            </span>
            <h2 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.03em' }}>
              Every unit tracked.<br />Every decision logged. Live.
            </h2>
            <p className="text-[#94A3B8] text-sm max-w-[480px] mx-auto">
              One unified command center showing real-time inventory risk, recommended actions, and recoverable value — across your entire network.
            </p>
          </div>

          {/* Dashboard screenshot */}
          <div className="relative rounded-2xl overflow-hidden border border-[#1E293B] shadow-2xl">
            {/* Chrome bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-[#0F172A] border-b border-[#1E293B]">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
              <span className="text-[10px] font-mono text-[#94A3B8] ml-4">viala.app/mission-control</span>
              <span className="ml-auto text-[9px] font-mono font-bold text-[#34D399] bg-[#064E3B]/50 px-2 py-0.5 rounded animate-pulse">● LIVE</span>
            </div>
            <div className="relative w-full" style={{ aspectRatio: '16/7' }}>
              <Image
                src="/screens/mission-control.png"
                alt="VIALA Mission Control Dashboard"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Below screenshot — 4 callouts */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              { val: '₹2.4M', label: 'At-Risk Inventory Visible', color: '#F87171' },
              { val: '842', label: 'Units Expiring This Month', color: '#FBBF24' },
              { val: '₹1.8M', label: 'Recoverable Value Identified', color: '#34D399' },
              { val: '94%', label: 'AI Decision Rate', color: '#60A5FA' },
            ].map(s => (
              <div key={s.label} className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-4 text-center">
                <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.val}</div>
                <div className="text-[10px] text-[#94A3B8] leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUTCOME INTELLIGENCE MATRIX ───────────────────────── */}
      <section className="py-20 bg-white border-t border-[#E8E5DF]">
        <div className="container-tight">
          <div className="text-center mb-12">
            <span className="label-tag mb-4 inline-flex">Intelligence Matrix</span>
            <h2 className="display-md mb-3">The right outcome,<br />every time.</h2>
            <p className="text-[#6B7280] text-sm max-w-[480px] mx-auto">
              VIALA automatically selects the highest-value path based on expiry window, vendor contracts, branch demand, and regulatory status.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-5 bg-[#F8F7F5] border-b border-[#E8E5DF] px-6 py-3">
              {['Outcome', 'Recovery Rate', 'Speed', 'Compliance', 'Best For'].map(h => (
                <div key={h} className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{h}</div>
              ))}
            </div>

            {MATRIX.map((row, i) => (
              <div
                key={row.outcome}
                className="grid grid-cols-5 px-6 py-4 border-b last:border-0 items-center hover:bg-[#FAFAF8] transition-colors"
                style={{ borderColor: '#F0EDE8', background: i % 2 === 0 ? '#FFFFFF' : '#FDFDFC' }}
              >
                {/* Outcome */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${row.color}15` }}
                  >
                    <row.icon className="w-3.5 h-3.5" style={{ color: row.color }} />
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">{row.outcome}</span>
                </div>

                {/* Recovery */}
                <div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${row.color}15`, color: row.color }}
                  >
                    {row.recovery}
                  </span>
                </div>

                {/* Speed */}
                <div className="text-sm text-[#374151]">{row.speed}</div>

                {/* Compliance */}
                <div className="text-sm text-[#374151]">{row.compliance}</div>

                {/* Best For */}
                <div className="text-xs text-[#6B7280]">{row.best}</div>
              </div>
            ))}
          </div>

          <p className="text-center text-[10px] text-[#9CA3AF] mt-4">
            VIALA evaluates all six outcomes simultaneously and recommends the optimal path within seconds.
          </p>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container-tight text-center max-w-[600px] mx-auto">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#34D399] mb-6">
            <Zap className="w-4 h-4" />
            Every day you wait, inventory loses value.
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4" style={{ fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.03em' }}>
            See exactly how much your<br />organisation can recover.
          </h2>
          <p className="text-[#94A3B8] text-sm mb-8">
            Our team will run a live simulation on your product mix and show you projected recoveries before you sign anything.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/get-started"
              className="px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-[1px] hover:shadow-xl"
              style={{ background: '#059669' }}
            >
              Book a Live Demo <ArrowRight className="inline w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/pricing"
              className="px-7 py-3.5 rounded-xl text-sm font-bold text-[#CBD5E1] bg-[#1E293B] border border-[#334155] transition-all hover:bg-[#273549]"
            >
              Calculate Your ROI <ChevronRight className="inline w-4 h-4 ml-0.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
