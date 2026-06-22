'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowUpRight, TrendingUp, RotateCcw, 
  Package, Heart, Trash2, ShieldCheck, Check
} from 'lucide-react';

// ─── Animation presets ───────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 80, damping: 20, delay: i * 0.08 },
  }),
};

// ─── Color palette (Warm cream + Forest Green + Emerald + Accent Gold) ───
const PALETTE = {
  surface: '#F7F6F3',     // Warm cream background
  surfaceAlt: '#FFFFFF',  // Clean white surfaces
  ink: '#0D2B1A',         // Deep forest green (almost black)
  inkLight: '#2D5A40',   // Mid forest green for subtext
  inkMuted: '#5C7A68',   // Muted green-grey for descriptions
  border: '#D9DDD5',      // Warm light border
  borderLight: '#EDF0EC', // Soft border light
  primary: '#0B4D2E',     // Brand Primary deep green
  emerald: '#059669',     // Brand accent green
  emeraldLight: '#ECFDF5',// Brand green light tint
  gold: '#C8970A',        // Warm accent gold
  goldLight: '#FEF3C7',   // Gold light tint
};



// ─── Ecosystem Marquee & Fading Message Strip ──────────
const ECOSYSTEM_LOGOS = [
  'Traditional Systems',
  'Pharmacy Management Systems',
  'Hospital Networks',
  'Supply Chain Platforms',
  'VIALA Platform'
];

function EcosystemMarquee() {
  const [showIntegrationText, setShowIntegrationText] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowIntegrationText(prev => !prev);
    }, 8000); // Toggle every 8 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white border-t border-b border-[#D9DDD5] overflow-hidden relative h-16 sm:h-20 flex items-center select-none">
      <AnimatePresence mode="wait">
        {!showIntegrationText ? (
          <motion.div
            key="marquee"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex items-center"
          >
            {/* Edge masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            {/* Marquee track */}
            <div className="animate-marquee flex gap-12 sm:gap-24 items-center pr-24 whitespace-nowrap">
              {[...ECOSYSTEM_LOGOS, ...ECOSYSTEM_LOGOS, ...ECOSYSTEM_LOGOS].map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="flex-shrink-0 text-xs sm:text-sm font-semibold tracking-wider text-[#5C7A68] uppercase font-mono flex items-center gap-2"
                >
                  <span>{name}</span>
                  {i % ECOSYSTEM_LOGOS.length !== ECOSYSTEM_LOGOS.length - 1 && (
                    <span className="text-[#D9DDD5] ml-4 sm:ml-12">↓</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="integration-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center px-4 flex justify-center items-center gap-3 font-mono text-xs sm:text-sm font-bold text-[#0B4D2E]"
          >
            <span className="px-3 py-1 rounded bg-[#EDF0EC] text-[#5C7A68]">Traditional Systems</span>
            <span className="text-[#059669] animate-pulse">──►</span>
            <span className="px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm font-sans flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              VIALA Intelligence Layer
            </span>
            <span className="text-xs text-[#5C7A68] hidden md:inline ml-2">(Sits above and orchestrates, does not replace)</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Data: Recovery Outcomes ─────────────────────────
const OUTCOMES = [
  {
    title: 'Sold',
    icon: TrendingUp,
    color: '#059669',
    lightBg: '#ECFDF5',
    problem: 'Near-expiry stock faces absolute write-off at the shelf.',
    action: 'Surface at-risk units on secondary priority commercial channels.',
    outcome: 'Quick clearance to highest-demand regional pharmacies.',
    bizValue: 'Recover immediate margin value before total write-off.',
  },
  {
    title: 'Returned',
    icon: RotateCcw,
    color: '#0D9488',
    lightBg: '#F0FDFA',
    problem: 'Missed vendor policy windows trigger zero-refund expirations.',
    action: 'Auto-scan supply contracts and flag active return windows.',
    outcome: 'Generate pre-filled vendor credit requests in seconds.',
    bizValue: 'Recapture up to 100% cost value directly from distributors.',
  },
  {
    title: 'Transferred',
    icon: Package,
    color: '#15803D',
    lightBg: '#F0FDF4',
    problem: 'Excess stock expires in Hub A while Hub B emergency purchases.',
    action: 'Match local surplus batches to active branch stock deficits.',
    outcome: 'Coordinate regional logistics and lock delivery routes.',
    bizValue: 'Maximize stock utilization across multi-location networks.',
  },
  {
    title: 'Redistributed',
    icon: ArrowUpRight,
    color: '#B45309',
    lightBg: '#FFFBEB',
    problem: 'Medications stagnate on shelves due to changes in regional demand.',
    action: 'Forecast and relocate inventory from low to high velocity hubs.',
    outcome: 'Update branch inventory ledger to optimize turnover.',
    bizValue: 'Increase sell-through rates without ordering new shipments.',
  },
  {
    title: 'Donated',
    icon: Heart,
    color: '#65A30D',
    lightBg: '#F7FEE7',
    problem: 'Unsold inventory expires with zero value and environmental cost.',
    action: 'Match expiring medicine to certified local NGOs and clinics.',
    outcome: 'Auto-generate CDSCO Schedule M compliance & tax receipts.',
    bizValue: 'Receive verified corporate social impact credits and write-offs.',
  },
  {
    title: 'Safely Disposed',
    icon: Trash2,
    color: '#4B5563',
    lightBg: '#F9FAFB',
    problem: 'Chemical waste leads to heavy environmental & legal compliance risks.',
    action: 'Schedule eco-certified biomedical destruction pickup.',
    outcome: 'Lock immutable chain-of-custody logs in the system.',
    bizValue: 'Eliminate compliance audit penalties and liability risk.',
  },
];

// ─── Data: Journey Outcomes (Section 4.5) ─────────────
const JOURNEY_OUTCOMES = [
  {
    title: 'Sold',
    icon: TrendingUp,
    color: '#059669',
    lightBg: '#ECFDF5',
    valueStatement: 'Ensures medicines reach patients through normal healthcare operations.'
  },
  {
    title: 'Returned',
    icon: RotateCcw,
    color: '#0D9488',
    lightBg: '#F0FDFA',
    valueStatement: 'Recovers value through vendor return programs before eligibility windows close.'
  },
  {
    title: 'Transferred',
    icon: Package,
    color: '#15803D',
    lightBg: '#F0FDF4',
    valueStatement: 'Moves inventory to locations with greater demand.'
  },
  {
    title: 'Redistributed',
    icon: ArrowUpRight,
    color: '#B45309',
    lightBg: '#FFFBEB',
    valueStatement: 'Supports future network-wide utilization opportunities.'
  },
  {
    title: 'Donated',
    icon: Heart,
    color: '#65A30D',
    lightBg: '#F7FEE7',
    valueStatement: 'Provides a responsible pathway for eligible medicines when appropriate and compliant.'
  },
  {
    title: 'Safely Disposed',
    icon: Trash2,
    color: '#4B5563',
    lightBg: '#F9FAFB',
    valueStatement: 'Ensures documented and compliant end-of-life handling.'
  }
];

// ─── Data: Testimonials ──────────────────────────────
const TESTIMONIALS = [
  {
    quote: "VIALA sits above our existing PMS, giving us immediate visibility we never thought possible. In 90 days, we saved over ₹18 Lakhs in written-off stock across 20 locations, with zero setup disruption.",
    role: "Director of Pharmacy Operations",
    org: "Regional Pharmacy Chain",
    outcome: "Recovered ₹18 Lakhs in 90 Days",
  },
  {
    quote: "Manually tracking expiry policies was costing our team hundreds of hours. VIALA completely automated our distributor returns and branch rebalancing. The system paid for itself within the first 35 days.",
    role: "Chief Operating Officer",
    org: "Multi-Specialty Hospital Network",
    outcome: "94% Waste Reduction",
  },
  {
    quote: "For enterprise networks, compliance and traceability are non-negotiable. VIALA gives us fully signed audit trails and Schedule M logs for every single transfer and donation automatically.",
    role: "Head of Supply Chain & Compliance",
    org: "National Healthcare Distribution Group",
    outcome: "100% Audit Readiness",
  },
];

// ─── Data: Simulation Steps (Viala vs User action) ───
const SIMULATION_DATA = [
  { // 0: Sold
    step1Viala: "Predictive scan identifies Chennai surplus (Batch AMX-453, 240 units) expiring in 45 days. Assesses local sales velocity as zero.",
    step1User: "None. System records ₹1,20,000 write-off liability alert on dashboard.",
    step2Viala: "B2B clearing engine requests bids from verified regional distributors for clearance. Bids topped at ₹450 per unit.",
    step2User: "Inspect clearance offer and review net recovery value recommendation.",
    step3Viala: "Updates PMS inventory ledger, generates invoice details, and routes courier dispatch alerts.",
    step3User: "Click 'Approve Sale' to dispatch stock and claim ₹90,000 cash recovery.",
    reclaimedValue: "₹90,000 value recovered before write-off"
  },
  { // 1: Returned
    step1Viala: "Monitors Cipla supplier agreement deadlines against AMX-453 batch onboarding records.",
    step1User: "None. System tracks return eligibility windows autonomously.",
    step2Viala: "Identifies that full credit return window closes in exactly 15 days (30-day pre-expiry supplier deadline).",
    step2User: "Review pre-scored return task recommendation on dashboard alert.",
    step3Viala: "Generates return invoice draft, pre-fills CDSCO supplier claim ledger, and files credit claim records.",
    step3User: "Click 'Approve Return' to release credit billing manifest.",
    reclaimedValue: "₹96,000 credit claims compiled"
  },
  { // 2: Transferred
    step1Viala: "Identifies Hyderabad branch has excess supply of AMX-453 facing expiry. Predicts stock write-off in 45 days.",
    step1User: "None. Cross-branch surplus levels are tracked automatically.",
    step2Viala: "Matches local surplus to Mumbai depot showing active stock shortage (+180% velocity spike) and buying deficit.",
    step2User: "Review automated relocation task showing net margin saved.",
    step3Viala: "Pre-fills inter-branch stock logistics forms and logs Schedule M safe transfer ledger.",
    step3User: "Click 'Approve Transfer' to dispatch regional courier and balance network.",
    reclaimedValue: "100% margin saved via transfer"
  },
  { // 3: Redistributed
    step1Viala: "Monitors central storage levels and calculates regional velocity patterns across networks.",
    step1User: "None. VIALA tracks national depot stock allocations in background.",
    step2Viala: "Recommends reallocating 500 units to Pune depot where sales velocity is 3x higher, maximizing sell-through chance.",
    step2User: "Open relocation ledger review on the dashboard.",
    step3Viala: "Updates warehouse records and plans automated logistics depot transfer routing.",
    step3User: "Click 'Approve Reallocation' to shift stock and secure margin turnover.",
    reclaimedValue: "Shortage prevented in network"
  },
  { // 4: Donated
    step1Viala: "Scans stock with zero return or transfer eligibility with expiry in 45 days.",
    step1User: "None. System isolates zero-refund liability stock.",
    step2Viala: "Matches batch specifications to active local NGO clinic requirements (e.g. HelpAge India) seeking immediate supplies.",
    step2User: "Review CSR donation matching recommendation and compliance details.",
    step3Viala: "Compiles CDSCO Schedule M compliance logs, logs donation dispatch, and compiles CSR tax credit receipt.",
    step3User: "Click 'Approve Donation' to dispatch charity supplies and claim CSR credits.",
    reclaimedValue: "CSR tax deduction match"
  },
  { // 5: Safely Disposed
    step1Viala: "Flags expired or damaged stock representing regulatory audit and contamination liability.",
    step1User: "None. VIALA automatically quarantines unusable stock.",
    step2Viala: "Applies Pollution Control destruction guidelines and matches local authorized destruction pickup SLA policies.",
    step2User: "Review disposal order queue and certified destruction details.",
    step3Viala: "Prepares destruction manifest, files disposal compliance logs, and seals immutable ledger.",
    step3User: "Click 'Approve Disposal' to schedule pickup. VIALA records certified waste logs.",
    reclaimedValue: "CDSCO-compliant destruction log"
  }
];

export default function HomePage() {
  // Hero dashboard demo states
  const [demoState, setDemoState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeOutcomeIndex, setActiveOutcomeIndex] = useState(1); // Default to Return
  const [activeJourneyIndex, setActiveJourneyIndex] = useState(2); // Default to Transferred (index 2)
  const [isJourneyHovered, setIsJourneyHovered] = useState(false);

  // Auto-cycle through the lifecycle journey steps every 2 seconds when not hovered
  useEffect(() => {
    if (isJourneyHovered) return;
    const timer = setInterval(() => {
      setActiveJourneyIndex((prev) => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(timer);
  }, [isJourneyHovered]);

  // ROI Calculator states
  const [branches, setBranches] = useState<number>(20);
  const [monthlyLoss, setMonthlyLoss] = useState<number>(85000); // Loss per branch

  const annualBaselineLoss = branches * monthlyLoss * 12;
  const projectedRecovery = annualBaselineLoss * 0.82; // 82% average recovery rate
  
  // Custom subscription pricing model
  const monthlySubscription = branches <= 5 
    ? 12000 
    : branches <= 25 
    ? 28000 
    : 28000 + (branches - 25) * 1000;
  
  const annualSubscription = monthlySubscription * 12 * 0.8; // 20% annual savings
  const netSavings = projectedRecovery - annualSubscription;
  const roiMultiplier = Math.floor(projectedRecovery / annualSubscription);

  // Recommended plan label based on locations
  const recommendedTier = branches === 1 ? 'Starter' : branches <= 25 ? 'Growth' : 'Enterprise';

  const startHeroDemo = () => {
    if (demoState !== 'idle') return;
    setDemoState('running');
    setTimeout(() => {
      setDemoState('completed');
    }, 1800);
  };

  const resetHeroDemo = () => {
    setDemoState('idle');
  };

  return (
    <div className="flex flex-col overflow-x-hidden min-h-screen" style={{ background: PALETTE.surface }}>
      
      {/* ══════════════════════════════════════════════════════
          SECTION 1: HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-24 pb-16 bg-[#F7F6F3]">
        {/* Premium thin line grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(to right, ${PALETTE.border} 1px, transparent 1px),
            linear-gradient(to bottom, ${PALETTE.border} 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 65% 65% at 50% 25%, #000 50%, transparent 95%)',
          opacity: 0.45,
        }} />

        <div className="container-tight relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 text-[0.72rem] font-bold px-3 py-1.5 rounded-full border bg-white border-[#D9DDD5] text-[#2D5A40] shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                  Enterprise-Grade Medicine Lifecycle Recovery
                </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.08] text-[#0D2B1A]"
              >
                Medicine shouldn&apos;t expire <br />
                <span className="text-[#059669]">without a second chance.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg mt-6 text-[#5C7A68] leading-relaxed max-w-[520px]"
              >
                VIALA continuously identifies at-risk medicines and helps healthcare organizations recover value before it is lost.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <Link href="/get-started" className="btn-primary justify-center">
                  Request Early Access
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#problem-recovery" className="btn-secondary justify-center">
                  See How It Works
                </a>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-5 text-[10px] font-semibold text-[#5C7A68] tracking-wide uppercase font-mono"
              >
                HIPAA Aligned · CDSCO Compliant · Sits Above Existing PMS/ERP
              </motion.p>
            </div>

            {/* Right Column: Premium Dashboard Screenshot Mockup */}
            <div className="lg:col-span-6 w-full mt-8 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, type: 'spring', stiffness: 50 }}
                className="w-full rounded-2xl border bg-white shadow-2xl overflow-hidden"
                style={{ borderColor: PALETTE.border }}
              >
                {/* Browser style header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#EDF0EC] border-b" style={{ borderColor: PALETTE.border }}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#5C7A68] bg-white px-4 py-1 rounded border border-[#D9DDD5] shadow-inner">
                    viala.app/mission-control
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                    <span className="text-[9px] font-bold text-[#0B4D2E] font-mono">LIVE SYNC</span>
                  </div>
                </div>

                {/* Dashboard UI Content */}
                <div className="p-5 flex flex-col gap-4">
                  {/* Console Header Bar */}
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: PALETTE.borderLight }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                      <span className="text-[10px] font-black text-[#0D2B1A] tracking-wider uppercase font-mono">VIALA Mission Control</span>
                    </div>
                    <span className="text-[9px] text-[#5C7A68] font-bold font-mono bg-[#EDF0EC] px-2.5 py-0.5 rounded border border-[#D9DDD5]">
                      NETWORK ACTIVE
                    </span>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-5 gap-2 text-center bg-[#F7F6F3] p-3 rounded-xl border border-[#D9DDD5]">
                    {[
                      { label: 'At-Risk SKUs', val: '12', color: 'text-amber-700' },
                      { label: 'Recoverable', val: '₹1.2L', color: 'text-[#059669] font-black' },
                      { label: 'Vendor Returns', val: '4', color: 'text-[#0D2B1A]' },
                      { label: 'Donations', val: '2', color: 'text-[#0D2B1A]' },
                      { label: 'Transfer Alert', val: '1', color: 'text-amber-700' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col justify-center">
                        <span className="text-[8px] text-[#5C7A68] uppercase font-bold tracking-tight leading-none mb-1">{item.label}</span>
                        <span className={`text-xs sm:text-sm font-extrabold ${item.color}`}>{item.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Action Demonstration */}
                  <div className="border border-[#D9DDD5] rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: PALETTE.borderLight }}>
                      <div>
                        <div className="text-[9px] font-mono text-[#5C7A68] uppercase tracking-wider">At-Risk Batch Scanner</div>
                        <div className="text-xs font-black text-[#0D2B1A] mt-0.5">Amoxicillin 500mg (Batch AMX-453)</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                          28 Days Left
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] mb-4">
                      <div className="flex flex-col">
                        <span className="text-[#5C7A68] text-[8px] uppercase font-bold">Current Depot</span>
                        <span className="font-semibold text-[#0D2B1A]">Delhi Hub (Surplus)</span>
                      </div>
                      <div className="text-[#059669] font-bold">──►</div>
                      <div className="flex flex-col text-right">
                        <span className="text-[#5C7A68] text-[8px] uppercase font-bold">Target Depot</span>
                        <span className="font-semibold text-[#0D2B1A]">Mumbai branch (Shortage)</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: PALETTE.borderLight }}>
                      <div className="text-left">
                        <span className="text-[8px] text-[#5C7A68] uppercase block">Value Recovery Potential</span>
                        <span className="text-xs font-black text-[#059669]">₹48,000 credit (100% saved)</span>
                      </div>
                      
                      {demoState === 'idle' && (
                        <button
                          onClick={startHeroDemo}
                          className="px-3 py-1.5 bg-[#0B4D2E] hover:bg-[#083D22] text-white text-[10px] font-bold rounded-lg transition-all shadow-sm"
                        >
                          Approve Transfer
                        </button>
                      )}
                      {demoState === 'running' && (
                        <button
                          disabled
                          className="px-3 py-1.5 bg-[#059669]/80 text-white text-[10px] font-bold rounded-lg cursor-not-allowed flex items-center gap-1.5"
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-white border-t-transparent animate-spin inline-block" />
                          Processing...
                        </button>
                      )}
                      {demoState === 'completed' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={resetHeroDemo}
                            className="text-[9px] font-bold text-[#5C7A68] hover:underline"
                          >
                            Reset
                          </button>
                          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Approved
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weekly Waste Saved area chart */}
                  <div className="border border-[#D9DDD5] rounded-xl p-4 bg-[#0D2B1A] text-white shadow-sm flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500/10 text-[#34D399] border border-emerald-500/20 text-[8px] font-bold font-mono px-2 py-0.5 rounded-bl-lg">
                      COMPLIANCE ACTIVE
                    </div>
                    <div>
                      <div className="text-[8px] text-[#5C7A68] uppercase font-bold tracking-wider">Weekly Recovery Margin</div>
                      <div className="text-base font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                        ₹1,83,500 
                        <span className="text-[9px] text-[#34D399] font-bold">+24% vs baseline</span>
                      </div>
                    </div>
                    <div className="relative w-full h-14 overflow-hidden mt-1">
                      <svg className="w-full h-full" viewBox="0 0 300 60" fill="none" preserveAspectRatio="none">
                        <path d="M0,45 Q30,30 60,35 T120,20 T180,30 T240,15 T300,5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M0,45 Q30,30 60,35 T120,20 T180,30 T240,15 T300,5" fill="url(#heroChartGlow)" opacity="0.1" />
                        <defs>
                          <linearGradient id="heroChartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#059669" />
                            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 2: POSITIONING & ECOSYSTEM ── */}
      <section className="py-16 bg-white border-t border-b border-[#D9DDD5] relative z-20">
        <div className="container-tight text-center max-w-[840px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#0D2B1A] leading-relaxed px-4">
              &ldquo;VIALA doesn&apos;t replace your pharmacy software.<br className="hidden sm:inline" />
              It tells you what to do <span className="text-[#059669]">before</span> inventory loses value.&rdquo;
            </h2>
            
            <div className="h-px bg-[#EDF0EC] my-8 max-w-[400px] mx-auto" />
            
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-bold text-[#5C7A68] uppercase tracking-wider font-mono">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#059669] stroke-[3]" /> Pharmacy Chains</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#059669] stroke-[3]" /> Hospital Networks</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#059669] stroke-[3]" /> Distributors</span>
            </div>
          </motion.div>
        </div>
      </section>

      <EcosystemMarquee />

      {/* ── SECTION 3: TRADITIONAL CHAOS VS VIALA RECOVERY ── */}
      <section id="problem-recovery" className="py-24 bg-[#F7F6F3] border-b border-[#D9DDD5]">
        <div className="container-tight">
          
          <div className="text-center max-w-[620px] mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-3">
              Operational Urgency
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D2B1A]">
              Traditional Chaos vs. VIALA Recovery
            </h2>
            <p className="mt-3 text-base text-[#5C7A68] leading-relaxed">
              Traditional inventory systems track quantities but fail to prevent write-offs. VIALA continuously forecasts expiry risk and automates value recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Challenges (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-center gap-6">
              {[
                {
                  title: "Static Systems Fail",
                  desc: "Your PMS registers quantity but cannot track distributor refund deadlines, inter-branch deficits, or NGO donation compliance."
                },
                {
                  title: "Fragmented Branch Operations",
                  desc: "While one branch throws away oncology stock, another branch 10 km away makes emergency market purchases of that exact SKU."
                },
                {
                  title: "Strict Compliance Pressures",
                  desc: "CDSCO and Pollution Control Boards are heavily auditing disposal. Manual spreadsheets lack a verifiable, signed audit ledger."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-[#D9DDD5] p-5 rounded-xl text-left shadow-sm">
                  <h4 className="text-sm font-bold text-[#0D2B1A] mb-1.5">{item.title}</h4>
                  <p className="text-xs text-[#5C7A68] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Right Column: Comparative Grid (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
              {/* Before VIALA */}
              <div className="bg-white border border-[#D9DDD5] rounded-2xl p-6 flex flex-col justify-between text-left shadow-sm">
                <div>
                  <span className="text-[8px] font-bold text-[#717171] bg-[#EDF0EC] px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-4">
                    Before VIALA
                  </span>
                  <h4 className="text-base font-bold text-[#0D2B1A] mb-4">Manual Shelf Audits</h4>
                  <ul className="space-y-3 text-xs text-[#5C7A68]">
                    <li className="flex gap-2 items-start"><span className="text-rose-500 font-bold">✕</span> Expiries found too late</li>
                    <li className="flex gap-2 items-start"><span className="text-rose-500 font-bold">✕</span> Missed distributor returns</li>
                    <li className="flex gap-2 items-start"><span className="text-rose-500 font-bold">✕</span> Stagnant stock written off</li>
                    <li className="flex gap-2 items-start"><span className="text-rose-500 font-bold">✕</span> Zero inter-branch visibility</li>
                  </ul>
                </div>
                <div className="pt-6 border-t border-[#EDF0EC] mt-6">
                  <span className="text-[9px] uppercase font-bold text-[#5C7A68] tracking-wider block">Est. Annual Loss</span>
                  <span className="text-xl font-mono font-black text-rose-600">₹40 Lakhs+</span>
                </div>
              </div>

              {/* Powered by VIALA */}
              <div className="bg-white border-2 border-[#059669] rounded-2xl p-6 flex flex-col justify-between text-left shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#059669] text-white text-[7px] font-bold uppercase tracking-wider px-2 py-0.5">
                  RECOMMENDED
                </div>
                <div>
                  <span className="text-[8px] font-bold text-white bg-[#059669] px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-4">
                    With VIALA
                  </span>
                  <h4 className="text-base font-bold text-[#0D2B1A] mb-4">Automated Recovery</h4>
                  <ul className="space-y-3 text-xs text-[#0D2B1A]">
                    <li className="flex gap-2 items-start"><span className="text-emerald-600 font-bold">✓</span> Continuous expiry forecasting</li>
                    <li className="flex gap-2 items-start"><span className="text-emerald-600 font-bold">✓</span> Pre-filled distributor claims</li>
                    <li className="flex gap-2 items-start"><span className="text-emerald-600 font-bold">✓</span> Active branch shortage matching</li>
                    <li className="flex gap-2 items-start"><span className="text-emerald-600 font-bold">✓</span> Signed CDSCO Schedule M logs</li>
                  </ul>
                </div>
                <div className="pt-6 border-t border-[#EDF0EC] mt-6">
                  <span className="text-[9px] uppercase font-bold text-[#5C7A68] tracking-wider block">Recovered Value</span>
                  <span className="text-xl font-mono font-black text-[#059669]">₹1.2 Crore+</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 4: OUTCOMES CONTROL ENGINE ── */}
      <section className="py-24 bg-white border-b border-[#D9DDD5]">
        <div className="container-tight">
          
          <div className="text-center max-w-[620px] mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-3">
              Outcomes Control Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D2B1A]">
              Six Channels. One Highest-Value Target.
            </h2>
            <p className="mt-3 text-base text-[#5C7A68] leading-relaxed">
              VIALA evaluates return policies, regional supply, and regulatory compliance to direct every batch to its single highest-value recovery channel.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Grid: Clickable Outcomes (5 cols) */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
              {OUTCOMES.map((o, idx) => {
                const isActive = activeOutcomeIndex === idx;
                const IconComponent = o.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveOutcomeIndex(idx);
                      if (demoState === 'completed') {
                        setDemoState('idle');
                      }
                    }}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                      isActive 
                        ? 'bg-[#0D2B1A] text-white border-[#0D2B1A] shadow-md ring-2 ring-[#059669]/20' 
                        : 'bg-[#F7F6F3] text-[#0D2B1A] border-[#D9DDD5] hover:bg-[#EDF0EC]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : o.lightBg }}
                      >
                        <IconComponent className="w-4 h-4" style={{ color: isActive ? '#34D399' : o.color }} />
                      </div>
                      <span className={`text-[8px] font-mono font-bold ${isActive ? 'text-[#34D399]' : 'text-[#5C7A68]'}`}>
                        CH-0{idx+1}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-black block leading-tight">{o.title}</span>
                      <span className={`text-[9px] mt-1 block leading-tight ${isActive ? 'text-white/60' : 'text-[#5C7A68]'}`}>
                        {o.bizValue.split(' ')[0]} {o.bizValue.split(' ').slice(1, 3).join(' ')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Interactive Journey Simulation (7 cols) */}
            <div className="lg:col-span-7 bg-[#F7F6F3] border border-[#D9DDD5] rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[380px]">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 mb-6 border-[#D9DDD5]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                  <span className="text-[9px] font-mono font-bold text-[#5C7A68]">
                    SKU SIMULATION: AMX-453
                  </span>
                </div>
                <span className="text-[8px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono">
                  {OUTCOMES[activeOutcomeIndex].title.toUpperCase()} ROUTE
                </span>
              </div>

              {/* Journey Steps */}
              <div className="space-y-5">
                {/* Step 1: Risk Flagged */}
                <div className="flex gap-3 items-start text-left">
                  <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-700 text-[10px] font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-bold uppercase text-[#0D2B1A] tracking-wide">Risk Flagged</h4>
                    <div className="mt-2 space-y-1.5 text-xs">
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mr-2 font-mono">
                          VIALA Action
                        </span>
                        <span className="text-[#5C7A68]">{SIMULATION_DATA[activeOutcomeIndex].step1Viala}</span>
                      </div>
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-[#EDF0EC] text-[#5C7A68] border border-[#D9DDD5] mr-2 font-mono">
                          Your Command
                        </span>
                        <span className="text-[#0D2B1A] font-semibold">{SIMULATION_DATA[activeOutcomeIndex].step1User}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Orchestration Analysis */}
                <div className="flex gap-3 items-start text-left">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 text-emerald-700 text-[10px] font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-bold uppercase text-[#0D2B1A] tracking-wide">Orchestration Analysis</h4>
                    <div className="mt-2 space-y-1.5 text-xs">
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mr-2 font-mono">
                          VIALA Action
                        </span>
                        <span className="text-[#5C7A68]">{SIMULATION_DATA[activeOutcomeIndex].step2Viala}</span>
                      </div>
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-[#EDF0EC] text-[#5C7A68] border border-[#D9DDD5] mr-2 font-mono">
                          Your Command
                        </span>
                        <span className="text-[#0D2B1A] font-semibold">{SIMULATION_DATA[activeOutcomeIndex].step2User}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Outcome Executed */}
                <div className="flex gap-3 items-start text-left">
                  <div className="w-6 h-6 rounded-full bg-[#0D2B1A] flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[11px] font-bold uppercase text-[#0B4D2E] tracking-wide">Outcome Executed</h4>
                    <div className="mt-2 space-y-1.5 text-xs">
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mr-2 font-mono">
                          VIALA Action
                        </span>
                        <span className="text-[#5C7A68]">{SIMULATION_DATA[activeOutcomeIndex].step3Viala}</span>
                      </div>
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-[#EDF0EC] text-[#5C7A68] border border-[#D9DDD5] mr-2 font-mono">
                          Your Command
                        </span>
                        <span className="text-[#0D2B1A] font-semibold">{SIMULATION_DATA[activeOutcomeIndex].step3User}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Outcome Summary */}
              <div className="border-t border-[#D9DDD5] pt-4 mt-6 flex justify-between items-center text-xs">
                <span className="text-[#5C7A68] font-bold">Orchestrated Outcome:</span>
                <span className="font-mono font-black text-[#059669] text-xs sm:text-sm uppercase">
                  {SIMULATION_DATA[activeOutcomeIndex].reclaimedValue}
                </span>
              </div>

            </div>

          </div>

          <div className="mt-8 text-center">
            <Link href="/outcomes" className="inline-flex items-center gap-2 text-xs font-bold text-[#0B4D2E] hover:underline">
              Review detailed dashboard screenshot guides
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ── SECTION 4.5: MEDICINE LIFECYCLE & LONG-TERM VISION ── */}
      <section className="py-24 bg-[#FAF9F6] border-b border-[#D9DDD5]">
        <div className="container-tight">
          
          {/* Header */}
          <div className="text-center max-w-[680px] mx-auto mb-16">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#5C7A68] block mb-3 font-mono">
              THE FUTURE OF MEDICINE LIFECYCLE MANAGEMENT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D2B1A]">
              Every Medicine Deserves Its Best Possible Outcome.
            </h2>
            <p className="mt-4 text-base text-[#5C7A68] leading-relaxed">
              Not every medicine follows the same path. Some are sold, returned, or transferred. Others are redistributed, donated, or safely disposed. VIALA helps healthcare organizations identify the most appropriate outcome based on risk, value, utilization, compliance requirements, and operational context.
            </p>
          </div>

          {/* Interactive Visual Journey & Details Card */}
          <div 
            className="max-w-[800px] mx-auto bg-white border border-[#D9DDD5] rounded-2xl p-6 sm:p-8 shadow-sm mb-16"
            onMouseEnter={() => setIsJourneyHovered(true)}
            onMouseLeave={() => setIsJourneyHovered(false)}
          >
            {/* Visual Header */}
            <div className="text-center mb-6">
              <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase bg-[#F7F6F3] border border-[#D9DDD5] px-2.5 py-1 rounded">
                INTELLIGENT DECISION PATHWAY
              </span>
            </div>

            {/* SVG Tree/Flow visualization */}
            <div className="w-full flex justify-center py-4 select-none">
              <div className="w-full max-w-[500px] relative">
                {/* Responsive SVG Container */}
                <svg viewBox="0 0 500 240" className="w-full h-auto overflow-visible">
                  {/* Define marker and glows */}
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 2 L 10 5 L 0 8 z" fill="#D9DDD5" />
                    </marker>
                    <marker
                      id="arrow-active"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 2 L 10 5 L 0 8 z" fill="#059669" />
                    </marker>
                  </defs>

                  {/* Connecting line: Medicine Batch to VIALA Decision Layer */}
                  <line 
                    x1="250" 
                    y1="43" 
                    x2="250" 
                    y2="82" 
                    stroke="#D9DDD5" 
                    strokeWidth="2" 
                    markerEnd="url(#arrow)"
                  />

                  {/* Branching lines from VIALA Decision Layer to Outcomes */}
                  {[40, 124, 208, 292, 376, 460].map((targetX, idx) => {
                    const isActive = activeJourneyIndex === idx;
                    const controlY1 = 140;
                    const controlY2 = 155;
                    const pathD = `M 250,118 C 250,${controlY1} ${targetX},${controlY2} ${targetX},177`;
                    
                    return (
                      <path
                        key={idx}
                        d={pathD}
                        fill="none"
                        stroke={isActive ? '#059669' : '#EDF0EC'}
                        strokeWidth={isActive ? '3' : '1.5'}
                        className="transition-all duration-300"
                        markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                      />
                    );
                  })}

                  {/* Node: Medicine Batch (Root) */}
                  <g transform="translate(250, 25)">
                    <rect 
                      x="-70" 
                      y="-18" 
                      width="140" 
                      height="36" 
                      rx="8" 
                      fill="#F7F6F3" 
                      stroke="#D9DDD5" 
                      strokeWidth="1.5" 
                    />
                    <text 
                      textAnchor="middle" 
                      y="4" 
                      className="text-[10px] font-mono font-bold fill-[#0D2B1A] uppercase tracking-wider"
                    >
                      Medicine Batch
                    </text>
                  </g>

                  {/* Node: VIALA Decision Layer */}
                  <g transform="translate(250, 100)">
                    <rect 
                      x="-80" 
                      y="-18" 
                      width="160" 
                      height="36" 
                      rx="8" 
                      fill="#0D2B1A" 
                      stroke="#059669" 
                      strokeWidth="1.5" 
                    />
                    <text 
                      textAnchor="middle" 
                      y="4" 
                      className="text-[11px] font-bold fill-white tracking-widest font-mono"
                    >
                      VIALA DECISION
                    </text>
                  </g>

                  {/* Node targets for outcomes */}
                  {JOURNEY_OUTCOMES.map((o, idx) => {
                    const targetX = 40 + idx * 84;
                    const isActive = activeJourneyIndex === idx;
                    const Icon = o.icon;
                    return (
                      <g 
                        key={idx} 
                        transform={`translate(${targetX}, 195)`}
                        className="cursor-pointer"
                        onClick={() => setActiveJourneyIndex(idx)}
                        onMouseEnter={() => setActiveJourneyIndex(idx)}
                      >
                        {/* Interactive circle */}
                        <circle 
                          r="18" 
                          fill={isActive ? o.lightBg : '#FFFFFF'} 
                          stroke={isActive ? o.color : '#D9DDD5'} 
                          strokeWidth={isActive ? '2' : '1.5'} 
                          className="transition-all duration-200"
                        />
                        {/* Icon */}
                        <g transform="translate(-8, -8)" className="pointer-events-none">
                          <Icon 
                            width={16}
                            height={16}
                            className="transition-colors duration-200" 
                            style={{ color: isActive ? o.color : '#5C7A68' }}
                          />
                        </g>
                        {/* Label text */}
                        <text 
                          textAnchor="middle" 
                          y="32" 
                          className={`text-[8.5px] font-bold tracking-tight select-none transition-colors duration-200 ${
                            isActive ? 'fill-[#0D2B1A] font-black' : 'fill-[#5C7A68]'
                          }`}
                        >
                          {o.title}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Selected Outcome details statement card */}
            <div className="mt-8 border-t border-[#EDF0EC] pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#5C7A68] block mb-1 font-mono">
                  Selected Lifecycle Outcome
                </span>
                <span 
                  className="text-lg font-black font-sans block"
                  style={{ color: JOURNEY_OUTCOMES[activeJourneyIndex].color }}
                >
                  {JOURNEY_OUTCOMES[activeJourneyIndex].title}
                </span>
              </div>
              <div className="flex-1 max-w-[480px] bg-[#F7F6F3] border border-[#D9DDD5] rounded-xl p-4 text-xs font-semibold text-[#0D2B1A] leading-relaxed">
                {JOURNEY_OUTCOMES[activeJourneyIndex].valueStatement}
              </div>
            </div>
          </div>

          {/* Core Metric Strip */}
          <div className="max-w-[800px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-b border-[#D9DDD5] py-8 mb-20">
            <div>
              <span className="text-3xl font-black text-[#0D2B1A] block font-mono">6</span>
              <span className="text-[10px] uppercase font-bold text-[#5C7A68] tracking-wider mt-1 block">
                Possible Outcomes
              </span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#0D2B1A] block font-mono">1</span>
              <span className="text-[10px] uppercase font-bold text-[#5C7A68] tracking-wider mt-1 block">
                Intelligence Layer
              </span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-[#0D2B1A] block font-mono leading-none md:pt-1">Continuous</span>
              <span className="text-[10px] uppercase font-bold text-[#5C7A68] tracking-wider mt-1 block">
                Visibility
              </span>
            </div>
            <div>
              <span className="text-3xl font-black text-[#059669] block font-mono">100%</span>
              <span className="text-[10px] uppercase font-bold text-[#5C7A68] tracking-wider mt-1 block">
                Traceability
              </span>
            </div>
          </div>

          {/* Quote & Future Platform Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-[850px] mx-auto">
            {/* Left: Mission Highlight Quote */}
            <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-2xl p-8 flex flex-col justify-center border-l-4 border-l-[#0B4D2E]">
              <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block mb-4">
                Our Commitment
              </span>
              <p className="text-lg sm:text-xl font-serif italic text-[#0D2B1A] leading-relaxed">
                &ldquo;Every medicine represents value, care, and opportunity. VIALA helps healthcare organizations ensure medicines have every reasonable opportunity to create impact before becoming waste.&rdquo;
              </p>
            </div>

            {/* Right: Future Platform Vision Card */}
            <div className="bg-[#0D2B1A] border border-[#0D2B1A] rounded-2xl p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-xl">
              {/* Decorative subtle background pattern/gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/20 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-lg font-bold text-white font-sans">
                    Future Platform Vision
                  </h3>
                  <span className="text-[8px] font-mono font-extrabold text-emerald-300 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded uppercase tracking-wider">
                    Future Ecosystem Vision
                  </span>
                </div>
                
                <ul className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                  {[
                    'Healthcare Networks',
                    'Hospital Collaboration',
                    'Medicine Recovery Networks',
                    'Responsible Redistribution',
                    'Community Health Programs',
                    'NGO Partnerships'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 text-[10px] text-white/50 font-mono relative z-10 uppercase tracking-wider">
                Viala Ecosystem Expansion Roadmap
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 5: ROI, TESTIMONIALS & IMPACT ── */}
      <section className="py-24 bg-[#F7F6F3]">
        <div className="container-tight">
          
          <div className="text-center max-w-[620px] mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-3">
              ROI & Proof
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D2B1A]">
              Calculate Your Recovery Potential
            </h2>
            <p className="mt-3 text-base text-[#5C7A68] leading-relaxed">
              Slide to configure your network parameters and instantly see projected recovery metrics and verified operational testimonials.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-[1140px] mx-auto">
            
            {/* Left: Calculators (6 cols) */}
            <div className="lg:col-span-6 bg-white border border-[#D9DDD5] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#0D2B1A]">Locations / Branches</span>
                    <span className="text-sm font-mono font-extrabold text-[#059669]">{branches} Branches</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={branches}
                    onChange={(e) => setBranches(parseInt(e.target.value))}
                    className="w-full accent-[#059669] h-1.5 bg-[#EDF0EC] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-[#5C7A68] mt-1 font-mono font-semibold">
                    <span>1</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#0D2B1A]">Est. Expiry Loss / Branch / Month</span>
                    <span className="text-sm font-mono font-extrabold text-[#059669]">₹{(monthlyLoss/1000).toFixed(0)}K</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="5000"
                    value={monthlyLoss}
                    onChange={(e) => setMonthlyLoss(parseInt(e.target.value))}
                    className="w-full accent-[#059669] h-1.5 bg-[#EDF0EC] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-[#5C7A68] mt-1 font-mono font-semibold">
                    <span>₹10K</span>
                    <span>₹2.5L</span>
                    <span>₹5L</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0D2B1A] text-white p-5 rounded-xl space-y-3 font-semibold relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
                    <span className="text-[10px] text-white/60">Annual Baseline Loss:</span>
                    <span className="text-xs font-mono text-rose-300">₹{(annualBaselineLoss/100000).toFixed(1)} Lakhs</span>
                  </div>
                  
                  <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
                    <span className="text-[10px] text-white/60">Projected Value Recovered:</span>
                    <span className="text-sm font-mono font-extrabold text-[#34D399]">₹{(projectedRecovery/100000).toFixed(1)} Lakhs</span>
                  </div>

                  <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
                    <span className="text-[10px] text-white/60">Net Value Saved:</span>
                    <span className="text-base font-mono font-black text-white">₹{(netSavings/100000).toFixed(1)} Lakhs</span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-white/60">Recommended Plan:</span>
                    <span className="text-xs font-bold text-[#FEF3C7] bg-[#FEF3C7]/10 px-2 py-0.5 rounded border border-[#FEF3C7]/20 uppercase">
                      {recommendedTier} Plan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Metrics & Testimonials Dashboard (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between gap-6">
              
              {/* Stat Strip */}
              <div className="bg-[#0A0A0A] text-white border border-[#1F2937] rounded-2xl p-5 grid grid-cols-3 gap-2 text-center shadow-lg">
                {[
                  { val: '94%', label: 'Waste Eliminated' },
                  { val: '6 min', label: 'Decision Speed' },
                  { val: `${roiMultiplier}x+`, label: 'Estimated ROI' }
                ].map((s, i) => (
                  <div key={i} className="p-1">
                    <div className="text-lg font-mono font-black text-[#34D399]">{s.val}</div>
                    <div className="text-[8px] uppercase font-bold text-white/60 tracking-wider mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Verified Testimonial block */}
              <div className="bg-white border border-[#D9DDD5] rounded-2xl p-6 flex flex-col justify-between flex-1 text-left relative shadow-sm">
                <div>
                  <div className="text-[#059669] text-xl font-serif leading-none mb-3">&ldquo;</div>
                  <p className="text-xs text-[#0D2B1A] leading-relaxed mb-6 font-medium italic">
                    {TESTIMONIALS[branches <= 5 ? 0 : branches <= 25 ? 1 : 2].quote}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#EDF0EC] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-[#0D2B1A]">
                      {TESTIMONIALS[branches <= 5 ? 0 : branches <= 25 ? 1 : 2].role}
                    </div>
                    <div className="text-[9px] text-[#5C7A68] mt-0.5">
                      {TESTIMONIALS[branches <= 5 ? 0 : branches <= 25 ? 1 : 2].org}
                    </div>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {TESTIMONIALS[branches <= 5 ? 0 : branches <= 25 ? 1 : 2].outcome}
                  </span>
                </div>
              </div>

              {/* Value Recovery Chart */}
              <div className="bg-[#131924] border border-[#1A2535] rounded-2xl p-4 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono text-white/50 uppercase tracking-wider">Value Recovery Growth</span>
                  <span className="text-[9px] text-[#34D399] font-bold">6 MONTH ACCUMULATION</span>
                </div>
                <div className="relative w-full h-12 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 500 120" fill="none" preserveAspectRatio="none">
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#1A2535" strokeDasharray="3 3" />
                    <path d="M0,110 L80,95 L160,82 L240,65 L320,35 L400,20 L500,5" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M0,110 L80,95 L160,82 L240,65 L320,35 L400,20 L500,5 L500,120 L0,120 Z" fill="url(#roiChartGlow)" opacity="0.1" />
                    <defs>
                      <linearGradient id="roiChartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 6: COMPLIANCE & TRUST ── */}
      <section className="py-12 bg-white border-t border-b border-[#D9DDD5]">
        <div className="container-tight flex flex-wrap gap-6 sm:gap-12 justify-around items-center text-center">
          {[
            { tag: 'HIPAA', label: 'Aligned Architecture', desc: 'Secure database registers' },
            { tag: 'SOC 2 Ready', label: 'Audit Trail Ready', desc: 'Immutable action histories' },
            { tag: 'CDSCO Safe', label: 'Schedule M Compliant', desc: 'National regulatory logs' },
            { tag: 'AES-256', label: 'Data Encryption', desc: 'Zero patient health data storage' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-sm font-extrabold text-[#0D2B1A] font-mono tracking-wider">{item.tag}</span>
              <span className="text-[11px] font-bold text-[#0B4D2E] mt-0.5">{item.label}</span>
              <span className="text-[9px] text-[#5C7A68] mt-0.5">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 7: FINAL CTA ── */}
      <section className="py-24 bg-[#0B4D2E] text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B4D2E]/10 to-transparent pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="container-tight relative z-10 max-w-[680px] mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Stop losing medicine value. <br className="hidden sm:inline" />
            <span className="text-[#34D399]">Start recovering it.</span>
          </h2>
          
          <p className="text-sm text-white/70 leading-relaxed mt-6 max-w-[500px] mx-auto">
            Join early adopters recovering lakhs in written-off inventory. Start your VIALA implementation in under 14 days.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/get-started" className="btn-accent justify-center px-8 py-3.5 shadow-lg shadow-emerald-500/10">
              Request Early Access
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/get-started" className="btn-secondary text-white border-white/20 hover:border-white/50 hover:bg-white/5 justify-center px-8 py-3.5">
              Schedule Consultation
            </Link>
          </div>

          <div className="mt-8 text-[10px] text-[#5C7A68] font-mono">
            SECURE AUDITS · ZERO PMS DISRUPTION · CDSCO SAFE
          </div>
        </div>
      </section>

    </div>
  );
}
