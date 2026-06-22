'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ScanLine, Brain, Zap, Flag, BarChart3,
  Shield, Lock, Users, Activity, Leaf, ChevronRight,
  Database, TrendingUp, Layers, ArrowDown
} from 'lucide-react';

// ─── Interactive Medicine Journey Data (Section 2) ───────────────────────────
const JOURNEY_STAGES = [
  {
    label: 'Intake Sync',
    stage: 'Batch Intake',
    title: 'Amoxicillin Batch AX-342 Registered',
    icon: Database,
    color: '#059669',
    badge: 'API SYNCED',
    meta: '120 Days To Expiry • Value: ₹1,50,000',
    detail: 'Amoxicillin batch AX-342 is cataloged via ERP integration. VIALA automatically pulls distributor returns policies, purchase costs, and regional demand calendars into its background scoring engine.',
    stateLabel: 'INTAKE RECORD ACTIVE'
  },
  {
    label: 'Risk Detected',
    stage: 'Risk Identified',
    title: 'Regional Demand Dip Identified',
    icon: Brain,
    color: '#2563EB',
    badge: 'RISK FLAGGED',
    meta: '90 Days To Expiry • Expiry Probability: High',
    detail: 'VIALA registers a 45% decline in regional prescription velocities for Amoxicillin. The local pharmacy branch is projected to experience a surplus, creating an active risk of a 100% write-off.',
    stateLabel: 'CRITICAL WINDOW OPEN'
  },
  {
    label: 'Engine Scoring',
    stage: 'Decision Engine',
    title: 'Background Option Evaluation',
    icon: Layers,
    color: '#7C3AED',
    badge: 'EVALUATING',
    meta: '6 Outcomes Evaluated Simultaneously',
    detail: 'The lifecycle engine automatically maps the batch against active vendor credit agreements, inter-branch supply shortfalls, secondary reselling channels, and donation offsets.',
    stateLabel: 'SCORING ACTIVE'
  },
  {
    label: 'Paths Compared',
    stage: 'Recovery Comparison',
    title: 'Financial Outcomes Compared',
    icon: TrendingUp,
    color: '#F59E0B',
    badge: 'COMPILING OPTIONS',
    meta: 'Return Credit vs. Transfer vs. Donation',
    detail: 'VIALA compares: (1) Vendor Return credit at 80% (eligible for 10 more days), (2) Inter-Branch Transfer recovering 100% cost basis, and (3) CSR Donation yielding 30% tax offset.',
    stateLabel: 'DIFFERENTIAL ANALYZED'
  },
  {
    label: 'Recommended',
    stage: 'Recommended Outcome',
    title: 'Inter-Branch Transfer Recommended',
    icon: Zap,
    color: '#10B981',
    badge: 'RECOMMENDATION',
    meta: 'Divert Surplus to Mumbai Hub C',
    detail: 'VIALA determines that Branch C in Mumbai has an active stock-out deficit for Amoxicillin. Transferring the batch recovers 100% margin value while preventing patient service delays.',
    stateLabel: 'OPTIMAL VALUE PATHWAY'
  },
  {
    label: 'Execution',
    stage: 'Action Execution',
    title: 'One-Click Routing Approved',
    icon: Flag,
    color: '#B45309',
    badge: 'EXECUTED',
    meta: 'Manifest & Courier Dispatched',
    detail: 'The system generates pre-filled returns papers and warehouse dispatch labels. The pharmacist clicks approval, triggering an automated courier pickup request to move stock instantly.',
    stateLabel: 'DISPATCH IN PROGRESS'
  },
  {
    label: 'Audit Sealed',
    stage: 'Audit Logged',
    title: 'Immutable Compliance Record Hashed',
    icon: Shield,
    color: '#DB2777',
    badge: 'COMPLIANT & SECURE',
    meta: 'CDSCO Schedule M Hashed • SHA-256',
    detail: 'The transfer is sealed in the VIALA secure ledger. An audit-ready record is permanently generated, matching batch AX-342 lifecycle movements with CDSCO Schedule M compliance logs.',
    stateLabel: 'LEDGER SECURED'
  }
];

// ─── Upgraded Pipeline / Modern Horizontal Timeline (Section 3) ───────────────
const PIPELINE_STEPS = [
  {
    number: '01',
    title: 'Inventory Intake',
    benefit: 'Automatically syncs batch records and returns calendars from your ERP.',
    icon: ScanLine
  },
  {
    number: '02',
    title: 'Risk Detection',
    benefit: 'Flags surplus inventory and SLA expiration deadlines months in advance.',
    icon: Brain
  },
  {
    number: '03',
    title: 'Decision Intelligence',
    benefit: 'Compares return credits, donation offsets, and transfer margins automatically.',
    icon: Zap
  },
  {
    number: '04',
    title: 'Execution',
    benefit: 'Triggers pre-filled warehouse manifests and courier pickups in one click.',
    icon: Flag
  },
  {
    number: '05',
    title: 'Audit & Reporting',
    benefit: 'Permanently seals all inventory transfers in a compliant, secure digital ledger.',
    icon: BarChart3
  }
];

// ─── Differentiation Cards (Section 5) ───────────────────────────────────────
const DIFFERENTIATION_CARDS = [
  {
    title: 'See Earlier',
    benefit: 'Flags expiry risks 90+ days before windows close.'
  },
  {
    title: 'Decide Smarter',
    benefit: 'Compares all financial paths and returns credits automatically.'
  },
  {
    title: 'Recover More',
    benefit: 'Generates pre-filled claims manifests to capture value.'
  }
];

export default function HowItWorksPage() {
  const [activeJourneyIdx, setActiveJourneyIdx] = useState(0);
  const currentJourney = JOURNEY_STAGES[activeJourneyIdx];

  // Auto transition steps for simulated medicine journey (every 7 seconds)
  // Respects prefers-reduced-motion (WCAG 2.3.3)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setActiveJourneyIdx(prev => (prev + 1) % JOURNEY_STAGES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeJourneyIdx]);

  // Helper to render stage visual sandbox graphics (Section 2)
  function renderJourneyVisual(idx: number) {
    switch (idx) {
      case 0:
        return (
          <div className="bg-white border border-[#D9DDD5] rounded-2xl p-4 shadow-sm font-mono text-[10px] space-y-2.5 text-left">
            <div className="flex justify-between items-center text-[#5C7A68]">
              <span>DATABASE CONNECTION</span>
              <span className="text-[#059669] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-ping" />
                LIVE
              </span>
            </div>
            <div className="border-t border-[#F0EFEA] pt-2 space-y-1">
              <div className="flex justify-between text-[#0D2B1A] font-bold">
                <span>SKU ID:</span>
                <span>AMX-500-AX342</span>
              </div>
              <div className="flex justify-between">
                <span>Medicine:</span>
                <span className="text-[#0D2B1A] font-bold">Amoxicillin 500mg</span>
              </div>
              <div className="flex justify-between">
                <span>Distributor:</span>
                <span className="text-[#0D2B1A] font-bold">Cipla Ltd</span>
              </div>
              <div className="flex justify-between">
                <span>Initial Expiry:</span>
                <span className="text-[#0D2B1A] font-bold">120 Days to Expiry</span>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="bg-white border border-[#D9DDD5] rounded-2xl p-4 shadow-sm font-mono text-[10px] space-y-3 text-left">
            <div className="flex justify-between items-center text-rose-600 font-bold">
              <span>SURPLUS RISK ALERT</span>
              <span>CRITICAL</span>
            </div>
            <div className="border-t border-[#F0EFEA] pt-2 grid grid-cols-2 gap-3">
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-2 text-center">
                <span className="text-[7px] text-[#5C7A68] uppercase block">Regional Demand</span>
                <span className="text-xs font-black text-rose-600 font-sans">-45%</span>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-2 text-center">
                <span className="text-[7px] text-[#5C7A68] uppercase block">Expiry Risk</span>
                <span className="text-xs font-black text-rose-600 font-sans">92%</span>
              </div>
            </div>
            <div className="text-[9px] text-[#5C7A68]">
              *Local sales velocity indicates batch cannot clear before expiration.
            </div>
          </div>
        );
      case 2:
        return (
          <div className="bg-white border border-[#D9DDD5] rounded-2xl p-4 shadow-sm font-mono text-[10px] space-y-2 text-left">
            <div className="flex justify-between items-center text-[#7C3AED] font-bold">
              <span>ENGINE SCORING PIPELINE</span>
              <span className="animate-pulse text-xs">SCORING...</span>
            </div>
            <div className="border-t border-[#F0EFEA] pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-yellow-600 font-bold">
                <span>Option 1: Return SLA</span>
                <span>Evaluating...</span>
              </div>
              <div className="flex items-center justify-between text-yellow-600 font-bold">
                <span>Option 2: Branch Transfer</span>
                <span>Evaluating...</span>
              </div>
              <div className="flex items-center justify-between text-[#7C3AED] font-bold">
                <span>Option 3: CSR Donation</span>
                <span>Pending</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="bg-white border border-[#D9DDD5] rounded-2xl p-4 shadow-sm font-mono text-[10px] space-y-2.5 text-left">
            <div className="flex justify-between items-center text-[#F59E0B] font-bold">
              <span>PATHWAY SCOREBOARD</span>
              <span>RESOLVED</span>
            </div>
            <div className="border-t border-[#F0EFEA] pt-2 space-y-2">
              <div className="bg-[#E6F4EA] border border-[#A7F3D0] rounded-xl p-2 flex justify-between items-center text-[#0F5132] font-bold">
                <span>Transfer to Branch C</span>
                <span>₹1,50,000 (100%)</span>
              </div>
              <div className="border border-[#D9DDD5] rounded-xl p-2 flex justify-between items-center text-[#5C7A68]">
                <span>Distributor Return</span>
                <span>₹1,20,000 (80%)</span>
              </div>
              <div className="border border-[#D9DDD5] rounded-xl p-2 flex justify-between items-center text-[#5C7A68]">
                <span>CSR Donation Offset</span>
                <span>₹45,000 (30%)</span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="bg-white border border-[#D9DDD5] rounded-2xl p-4 shadow-sm font-mono text-[10px] space-y-3 text-left">
            <div className="flex justify-between items-center text-[#10B981] font-bold">
              <span>RECOMMENDED OUTCOME</span>
              <span>OPTIMIZED</span>
            </div>
            <div className="border-t border-[#F0EFEA] pt-2 flex items-center justify-between bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
              <div className="text-center flex-1">
                <span className="text-[7px] text-[#5C7A68] block">Surplus Branch</span>
                <span className="font-extrabold text-[#0D2B1A] text-[9px] truncate block">Branch A (Delhi)</span>
              </div>
              <div className="px-2 text-center text-[#059669] flex items-center justify-center">
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-center flex-1">
                <span className="text-[7px] text-[#5C7A68] block">Shortage Hub</span>
                <span className="font-extrabold text-[#0D2B1A] text-[9px] truncate block">Branch C (Mumbai)</span>
              </div>
            </div>
            <div className="flex justify-between text-[#0D2B1A] font-bold text-[9px] px-1">
              <span>Margin Preserved:</span>
              <span className="text-[#059669]">100% (₹1,50,000 saved)</span>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="bg-white border border-[#D9DDD5] rounded-2xl p-4 shadow-sm font-mono text-[10px] space-y-3 text-left">
            <div className="flex justify-between items-center text-[#B45309] font-bold">
              <span>MANIFEST & DISPATCH</span>
              <span>READY</span>
            </div>
            <div className="border-t border-[#F0EFEA] pt-2 space-y-2">
              <div className="flex justify-between text-[9px]">
                <span>Manifest File:</span>
                <span className="font-bold text-[#0D2B1A]">MNF-AX342.pdf</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span>Logistic Carrier:</span>
                <span className="font-bold text-[#0D2B1A]">Cipla Logistics</span>
              </div>
              <div className="w-full bg-[#059669] text-white font-sans text-xs font-bold py-2 rounded-lg text-center cursor-default shadow-sm border border-[#047857]">
                Confirm Route Dispatch
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="bg-white border border-[#D9DDD5] rounded-2xl p-4 shadow-sm font-mono text-[10px] space-y-3 text-left">
            <div className="flex justify-between items-center text-[#DB2777] font-bold">
              <span>COMPLIANCE LEDGER</span>
              <span>COMPLETED</span>
            </div>
            <div className="border-t border-[#F0EFEA] pt-2 space-y-2">
              <div className="bg-[#FAF9F6] border border-[#D9DDD5] rounded-xl p-2 space-y-1 text-[8px]">
                <div className="flex justify-between">
                  <span>Hashed Block:</span>
                  <span className="font-bold text-[#0D2B1A]">#948123-AMX</span>
                </div>
                <div className="truncate">
                  <span>SHA-256:</span>
                  <span className="text-[#DB2777] font-bold ml-1">0x8f7c9e2b10a...</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#059669] font-bold font-sans">
                <Shield className="w-3.5 h-3.5" />
                <span>CDSCO Schedule M Sealed</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  // Helper to render visual widgets in step cards (Section 3)
  function renderPipelineWidget(idx: number) {
    switch (idx) {
      case 0:
        return (
          <div className="my-4 bg-[#F7F6F3] rounded-xl p-3 border border-[#D9DDD5] font-mono text-[9px] text-[#5C7A68] space-y-1.5 text-left">
            <div className="flex justify-between items-center border-b pb-1 border-[#D9DDD5]/60">
              <span>API CONNECTION</span>
              <span className="text-[#059669] flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-ping" />
                SYNCED
              </span>
            </div>
            <div className="flex justify-between text-[#0D2B1A] font-bold">
              <span>PMS Database</span>
              <span>100% OK</span>
            </div>
            <div className="flex justify-between text-[#0D2B1A] font-bold">
              <span>ERP Catalog</span>
              <span>100% OK</span>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="my-4 bg-[#F7F6F3] rounded-xl p-3 border border-[#D9DDD5] font-mono text-[9px] text-[#5C7A68] space-y-2 text-left">
            <div className="flex justify-between items-center">
              <span>EXPIRY SLIDER</span>
              <span className="text-rose-500 font-bold">WARNING</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 relative overflow-hidden">
              <div className="bg-gradient-to-r from-[#059669] via-yellow-400 to-rose-500 h-full w-[80%]" />
            </div>
            <div className="flex justify-between text-[#0D2B1A] font-bold text-[8px]">
              <span>Intake (d0)</span>
              <span className="text-rose-600">Risk zone (d90)</span>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="my-4 bg-[#F7F6F3] rounded-xl p-3 border border-[#D9DDD5] font-mono text-[8px] text-[#5C7A68] space-y-1 text-left">
            <div className="border-b pb-1 border-[#D9DDD5]/60 font-bold">SCORING ENGINE</div>
            <div className="flex justify-between items-center text-[#059669] font-bold">
              <span>✓ Branch Transfer</span>
              <span>95/100</span>
            </div>
            <div className="flex justify-between items-center text-[#5C7A68] opacity-75">
              <span>✓ Return SLA</span>
              <span>82/100</span>
            </div>
            <div className="flex justify-between items-center text-[#5C7A68] opacity-75">
              <span>✓ CSR Donation</span>
              <span>34/100</span>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="my-4 bg-[#F7F6F3] rounded-xl p-3 border border-[#D9DDD5] flex flex-col items-center justify-center space-y-2 py-4">
            <div className="bg-[#059669] text-white text-[9px] font-mono font-bold px-3 py-1.5 rounded-lg shadow-sm border border-[#047857] w-full text-center select-none cursor-default">
              Approve Route
            </div>
            <span className="font-mono text-[8px] text-[#5C7A68]">Manifest ready</span>
          </div>
        );
      case 4:
        return (
          <div className="my-4 bg-[#F7F6F3] rounded-xl p-3 border border-[#D9DDD5] font-mono text-[8px] text-[#5C7A68] space-y-1 text-left">
            <div className="flex justify-between items-center border-b pb-1 border-[#D9DDD5]/60">
              <span>COMPLIANCE LEDGER</span>
              <span className="text-[#059669] font-bold">SECURED</span>
            </div>
            <div className="truncate text-[#0D2B1A]">SHA-256: 0x4f8e...bd2</div>
            <div className="text-[#059669] font-bold">✓ CDSCO Schedule M</div>
          </div>
        );
      default:
        return null;
    }
  }

  // Helper to render visual widgets in differentiation cards (Section 5)
  function renderDifferentiationWidget(idx: number) {
    switch (idx) {
      case 0:
        return (
          <div className="my-4 bg-[#F7F6F3] rounded-xl p-3 border border-[#D9DDD5] font-mono text-[9px] text-[#5C7A68] space-y-2 text-left">
            <div className="flex justify-between items-center">
              <span>TIMELINE TRACKER</span>
              <span className="text-[#059669] font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex-1 bg-[#059669] text-white text-[8px] p-1 rounded text-center">90 Days</div>
              <div className="flex-1 bg-yellow-400 text-[#0D2B1A] text-[8px] p-1 rounded text-center">60 Days</div>
              <div className="flex-1 bg-rose-500 text-white text-[8px] p-1 rounded text-center">30 Days</div>
            </div>
            <div className="text-[8px] text-[#5C7A68]">
              ✓ Expiry warnings flagged 90+ days in advance.
            </div>
          </div>
        );
      case 1:
        return (
          <div className="my-4 bg-[#F7F6F3] rounded-xl p-3 border border-[#D9DDD5] font-mono text-[8px] text-[#5C7A68] space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <span>PATHWAY SCORE</span>
              <span className="text-[#7C3AED] font-bold">OPTIMIZED</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[#059669] font-bold">
                <span>Transfer Margin</span>
                <span>100% Value</span>
              </div>
              <div className="flex justify-between text-[#5C7A68]">
                <span>Return SLA Credit</span>
                <span>80% Value</span>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="my-4 bg-[#F7F6F3] rounded-xl p-3 border border-[#D9DDD5] font-mono text-[8px] text-[#5C7A68] space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <span>CAPTURED VALUES</span>
              <span className="text-[#059669] font-bold">COMPLETED</span>
            </div>
            <div className="space-y-1 text-left">
              <div className="text-[#0D2B1A] font-bold">✓ Courier Picked Up</div>
              <div className="text-[#0D2B1A] font-bold">✓ CDSCO Ledger Hashed</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col bg-[#F7F6F3] min-h-screen text-[#0D2B1A]">
      
      {/* ─── SECTION 1: HERO ─── */}
      <section className="pt-32 pb-20 bg-white border-b border-[#D9DDD5] relative overflow-hidden">
        <div className="container-tight text-center max-w-[800px] mx-auto px-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-6">
            Platform Science
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#0D2B1A] leading-[1.15] tracking-tight">
            The Science of Medicine<br />
            <span className="text-[#059669]">Lifecycle Intelligence.</span>
          </h1>
          <p className="mt-6 text-sm sm:text-base text-[#5C7A68] leading-relaxed max-w-[620px] mx-auto">
            VIALA continuously monitors medicine inventory, identifies risk, evaluates recovery opportunities, and recommends the most appropriate outcome before value is lost.
          </p>
        </div>
      </section>

      {/* ─── SECTION 2: FOLLOW ONE MEDICINE THROUGH VIALA (INTERACTIVE CENTERPIECE) ─── */}
      <section className="py-24 bg-white border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[1000px] mx-auto px-6">
          
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <span className="text-[10px] font-mono font-bold text-[#5C7A68] uppercase tracking-[0.2em] block mb-2">Simulated Lifecycle Journey</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B1A]">
              Follow One Medicine Through VIALA
            </h2>
            <p className="mt-3 text-sm text-[#5C7A68] leading-relaxed">
              Click through the stages below to trace how a batch of Amoxicillin moves from active risk to a successful financial recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Interactive Stepper (Vertical Timeline) */}
            <div className="lg:col-span-5 space-y-3">
              {JOURNEY_STAGES.map((stage, idx) => {
                const isActive = activeJourneyIdx === idx;
                const Icon = stage.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveJourneyIdx(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
                      isActive
                        ? 'bg-[#0D2B1A] border-[#0D2B1A] text-white shadow-md translate-x-2'
                        : 'bg-[#F7F6F3] border-[#D9DDD5] text-[#5C7A68] hover:bg-white hover:border-[#059669]/30'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        isActive ? 'bg-[#059669] border-[#059669] text-white' : 'bg-white border-[#D9DDD5] text-[#5C7A68]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[8px] font-mono uppercase tracking-widest block opacity-70">Stage 0{idx + 1}</span>
                      <span className="text-xs font-bold block">{stage.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isActive ? 'rotate-90 text-[#34D399]' : 'opacity-30'}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Visual Stage Sandbox */}
            <div className="lg:col-span-7 h-full">
              <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-3xl p-6 sm:p-8 relative h-full flex flex-col justify-between shadow-sm min-h-[500px]">
                
                {/* Visual Glow Layer */}
                <div
                  className="absolute -inset-4 rounded-3xl opacity-10 blur-3xl pointer-events-none transition-all duration-500"
                  style={{ background: `radial-gradient(circle, ${currentJourney.color}, transparent 60%)` }}
                />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-6 flex-1">
                  
                  {/* Top content */}
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b pb-4 border-[#D9DDD5] mb-4">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase block">ACTIVE BATCH PIPELINE</span>
                        <span className="text-xs font-bold text-[#0D2B1A]">{currentJourney.stage}</span>
                      </div>
                      <span
                        className="text-[9px] font-mono font-bold text-white px-2.5 py-1 rounded"
                        style={{ backgroundColor: currentJourney.color }}
                      >
                        {currentJourney.badge}
                      </span>
                    </div>

                    {/* Stage Headline */}
                    <div className="space-y-1 mb-4">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#0D2B1A] leading-tight">
                        {currentJourney.title}
                      </h3>
                      <p className="text-xs text-[#059669] font-semibold font-mono">
                        {currentJourney.meta}
                      </p>
                    </div>

                    {/* Stage Visual Widget Rendering */}
                    <div className="my-4">
                      {renderJourneyVisual(activeJourneyIdx)}
                    </div>
                  </div>

                  {/* Middle content: Full detailed description to fill empty space */}
                  <div className="flex-1 flex items-center py-2">
                    <p className="text-xs sm:text-sm text-[#5C7A68] leading-relaxed">
                      {currentJourney.detail}
                    </p>
                  </div>

                  {/* Bottom content: Simulated Device Status */}
                  <div className="relative z-10 pt-4 border-t border-[#D9DDD5] flex justify-between items-center text-[10px] font-mono mt-auto">
                    <span className="text-[#5C7A68] uppercase">PROCESS STATE:</span>
                    <span className="font-bold text-[#0D2B1A]" style={{ color: currentJourney.color }}>
                      {currentJourney.stateLabel}
                    </span>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION 3: PIPELINE / MODERN HORIZONTAL TIMELINE ─── */}
      <section className="py-24 bg-[#FAF9F6] border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[1100px] mx-auto px-6">
          
          <div className="text-center max-w-[600px] mx-auto mb-20">
            <span className="text-[10px] font-mono font-bold text-[#5C7A68] uppercase tracking-[0.2em] block mb-2">Automated Operations</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B1A]">
              The Intelligence Pipeline
            </h2>
            <p className="mt-3 text-sm text-[#5C7A68] leading-relaxed">
              VIALA automates the full recovery lifecycle, converting manual tracking into structured digital decisions.
            </p>
          </div>

          {/* Timeline Wrapper */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            
            {/* Connecting Horizontal Line (desktop) */}
            <div className="hidden md:block absolute top-[28px] left-[5%] right-[5%] h-[1px] bg-dashed bg-[#D9DDD5] z-0" />

            {PIPELINE_STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                  {/* Step Icon & Number */}
                  <div className="flex items-center gap-3 md:flex-col md:items-start">
                    <div className="w-14 h-14 rounded-full bg-white border border-[#D9DDD5] flex items-center justify-center shadow-sm relative group hover:border-[#059669] transition-colors duration-200">
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0D2B1A] text-white font-mono text-[9px] flex items-center justify-center font-bold">
                        {step.number}
                      </span>
                      <StepIcon className="w-5 h-5 text-[#059669]" />
                    </div>
                  </div>

                  {/* Step Content Card */}
                  <div className="space-y-3 bg-white border border-[#D9DDD5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 w-full flex-1 flex flex-col justify-between">
                    <h3 className="text-sm font-extrabold text-[#0D2B1A] border-b pb-2 border-[#F0EFEA]">{step.title}</h3>
                    
                    {/* Render Interactive Mini UI Widget instead of Paragraphs */}
                    {renderPipelineWidget(idx)}

                    {/* Short Benefit description (< 10 words) */}
                    <p className="text-[11px] text-[#5C7A68] leading-relaxed mt-2 text-left">
                      {step.benefit}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>

        </div>
      </section>

      {/* ─── SECTION 4: THE DECISION LAYER ─── */}
      <section className="py-24 bg-white border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[900px] mx-auto px-6 text-center">
          
          <div className="max-w-[620px] mx-auto mb-16">
            <span className="text-[10px] font-mono font-bold text-[#5C7A68] uppercase tracking-[0.2em] block mb-2">Architectural Logic</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B1A]">
              The Decision Layer
            </h2>
            <p className="mt-3 text-sm text-[#5C7A68] leading-relaxed">
              VIALA automatically processes multiple inventory variables in real-time, removing complexity to suggest the single highest-value recovery outcome.
            </p>
          </div>

          {/* Decision Layer Visual Diagram */}
          <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-3xl p-8 relative overflow-hidden max-w-[750px] mx-auto shadow-sm">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
              
              {/* Inputs Column */}
              <div className="space-y-3">
                <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block text-left">Operational Inputs</span>
                
                {[
                  { text: 'Inventory Signals', desc: 'Batch volumes, locations, cost bases' },
                  { text: 'Vendor Policies', desc: 'Return credit percentage rules' },
                  { text: 'Expiry Timelines', desc: 'Critical returns SLA dates' },
                  { text: 'Demand Patterns', desc: 'Regional usage and branch deficits' },
                  { text: 'Compliance Rules', desc: 'CDSCO Schedule M structures' }
                ].map((input, idx) => (
                  <div key={idx} className="bg-white border border-[#D9DDD5] rounded-xl p-3 text-left shadow-sm">
                    <span className="text-xs font-bold text-[#0D2B1A] block">{input.text}</span>
                    <span className="text-[10px] text-[#5C7A68] block">{input.desc}</span>
                  </div>
                ))}
              </div>

              {/* Engine Column (Center) */}
              <div className="flex flex-col items-center justify-center py-6">
                
                {/* Arrow down (mobile) / Arrow Right (desktop) indicators */}
                <div className="block md:hidden mb-4"><ArrowDown className="w-5 h-5 text-[#5C7A68] animate-bounce" /></div>

                <div className="w-20 h-20 rounded-2xl bg-[#0D2B1A] border border-[#059669] flex flex-col items-center justify-center shadow-lg relative group">
                  <span className="absolute inset-1 rounded-xl border border-dashed border-[#059669] animate-[spin_25s_linear_infinite]" />
                  <Layers className="w-7 h-7 text-[#34D399]" />
                  <span className="text-[8px] font-mono font-bold text-[#34D399] uppercase tracking-widest mt-2">ENGINE</span>
                </div>
                
                <h4 className="text-xs font-bold text-[#0D2B1A] mt-4">VIALA Lifecycle Engine</h4>
                <p className="text-[10px] text-[#5C7A68] mt-1 max-w-[160px]">
                  Parallel-scores all recovery pathways.
                </p>

                <div className="block md:hidden mt-4"><ArrowDown className="w-5 h-5 text-[#5C7A68] animate-bounce" /></div>
              </div>

              {/* Outputs Column */}
              <div className="space-y-3">
                <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block text-left">Resolution Output</span>
                
                <div className="bg-[#E6F4EA] border border-[#A7F3D0] rounded-xl p-4 text-left shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#059669] inline-block mr-1.5 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#0D2B1A] uppercase tracking-wider">Recommended Outcome</span>
                  <p className="text-xs text-[#0F5132] mt-2 font-semibold">
                    Return, Transfer, or Redistribution action compiled with pre-filled forms.
                  </p>
                </div>
                
                <div className="bg-white border border-[#D9DDD5] rounded-xl p-3 text-left opacity-60">
                  <span className="text-xs font-bold text-[#5C7A68] block">Automated Dispatch</span>
                  <span className="text-[10px] text-[#5C7A68] block">Warehouse notifications & couriers matched</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION 5: WHY TRADITIONAL SYSTEMS STOP AT VISIBILITY / WHY VIALA GOES FURTHER ─── */}
      <section className="py-24 bg-[#F7F6F3] border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[1000px] mx-auto px-6 text-center">
          
          <div className="max-w-[620px] mx-auto mb-16">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5C7A68] block mb-2 font-mono">DIFFERENTIATION</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B1A]">
              Why Traditional Systems Stop At Visibility<br />
              <span className="text-[#059669] font-bold">Why VIALA Goes Further</span>
            </h2>
            <p className="mt-3 text-sm text-[#5C7A68] leading-relaxed">
              Standard ERPs track inventory levels, but leave recovery logistics and decision execution to manual pharmacist checks. VIALA closes the loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DIFFERENTIATION_CARDS.map((card, idx) => (
              <div key={idx} className="bg-white border border-[#D9DDD5] rounded-2xl p-6 sm:p-8 text-left shadow-sm hover:border-[#059669]/30 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold text-[#059669] uppercase tracking-wider mb-4">0{idx + 1} | Core Edge</div>
                  <h3 className="text-lg font-black text-[#0D2B1A] mb-3">{card.title}</h3>
                  
                  {/* Render Visual widget */}
                  {renderDifferentiationWidget(idx)}
                </div>

                {/* Short benefit copy (< 10 words) */}
                <p className="text-xs text-[#5C7A68] leading-relaxed mt-2">
                  {card.benefit}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── SECTION 6: ENTERPRISE TRUST LAYER ─── */}
      <section className="py-20 bg-white border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[1000px] mx-auto px-6">
          
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-3">
              Trust & Compliance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D2B1A]">
              Enterprise Trust Layer
            </h2>
            <p className="mt-3 text-sm text-[#5C7A68] leading-relaxed">
              VIALA secures your inventory databases and keeps all recovery actions aligned with regulatory requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'CDSCO Schedule M Ready', desc: 'Pre-filled return manifests and audit-safe logs prepared for inspection.' },
              { icon: Lock, title: 'HIPAA Aligned Shield', desc: 'Secure local databases with zero collection of patient-identifiable data (PII).' },
              { icon: Users, title: 'Role-Based Control', desc: 'Clear authentication controls separating pharmacist actions from network manager settings.' },
              { icon: Activity, title: 'Traceability Auditing', desc: 'Every transfer, return, and donation is cryptographically hashed in an immutable ledger.' }
            ].map((item, idx) => (
              <div key={idx} className="border border-[#D9DDD5] rounded-xl p-5 hover:border-[#059669]/20 hover:shadow-sm transition-all text-left bg-[#FAF9F6]">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center mb-4 border border-emerald-100">
                  <item.icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-extrabold text-[#0D2B1A] mb-1.5">{item.title}</h4>
                <p className="text-[11px] text-[#5C7A68] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── SECTION 7: BEYOND RECOVERY MISSION ─── */}
      <section className="py-24 bg-[#FAF9F6] border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[850px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-4 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#059669] shadow-sm">
              <Leaf className="w-8 h-8" />
            </div>
          </div>

          <div className="md:col-span-8 space-y-4 text-left">
            <span className="text-[9px] font-mono font-bold text-[#059669] uppercase tracking-wider">Our Core Mission</span>
            <h3 className="text-xl sm:text-2xl font-black text-[#0D2B1A] leading-tight">Diverting Loss. Restoring Purpose.</h3>
            <p className="text-xs text-[#5C7A68] leading-relaxed">
              VIALA exists to ensure medicines have every reasonable opportunity to create value before becoming waste. By routing at-risk inventory to its highest-value recovery outcome, we optimize the utilization of manufactured healthcare resources, prevent premature waste disposal, and protect enterprise margins.
            </p>
          </div>

        </div>
      </section>

      {/* ─── SECTION 8: BOTTOM CTA ─── */}
      <section className="py-24 bg-[#0B4D2E] text-white relative overflow-hidden text-center">
        <div className="container-tight relative z-10 max-w-[650px] mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            See How Much Value May Already Be Sitting In Your Inventory.
          </h2>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed mt-6 max-w-[500px] mx-auto">
            Schedule a solutions walkthrough. We will review your pharmacy branch write-off logs, check supplier returns eligibility terms, and map out your exact recovery potentials.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/get-started" className="btn-accent justify-center px-8 py-3.5 shadow-lg w-full sm:w-auto">
              Schedule Walkthrough
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/get-started" className="btn-secondary text-white border-white/20 hover:border-white/50 hover:bg-white/5 justify-center px-8 py-3.5 w-full sm:w-auto">
              Request Platform Assessment
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
