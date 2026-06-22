'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, RotateCcw, Package, ArrowUpRight, Heart, Trash2,
  ArrowRight, Check, X
} from 'lucide-react';

// ─── Tabs Data with simplified outcome focus ─────────────────────────────────
const TABS = [
  {
    key: 'sell',
    label: 'Sell',
    icon: TrendingUp,
    accent: '#059669',
    accentLight: '#ECFDF5',
    accentBorder: '#A7F3D0',
    whatHappens: 'Surfaces near-expiry commercial units on priority secondary channels.',
    whyItMatters: 'Prevents complete financial write-off at the branch shelf level.',
    bizValue: 'Recovers direct margin value from inventories before they expire.',
    mockUi: {
      title: 'Secondary Channel Bidding Engine',
      status: 'MATCH FOUND',
      medicine: 'Amoxicillin 500mg (Batch AMX-453)',
      qty: '120 units',
      risk: '45 Days to Expiry',
      metric: '₹40,800 Revenue Saved',
      actionLabel: 'Authorize Sale',
      details: [
        { label: 'Original Margin', value: '38% (Gross)' },
        { label: 'Discount Applied', value: '15% MRP' },
        { label: 'Matched Buyer', value: 'Regional Pharmacy Group A' },
      ],
      steps: [
        'Expiry scan registers near-expiry risk.',
        'Secondary market buyer bids matched automatically.',
        'Repricing margin applied to secure purchase.'
      ]
    }
  },
  {
    key: 'return',
    label: 'Return',
    icon: RotateCcw,
    accent: '#0D9488',
    accentLight: '#F0FDFA',
    accentBorder: '#99F6E4',
    whatHappens: 'Compiles and submits automated vendor SLA credit requests.',
    whyItMatters: 'Recaptures cost value before distributor credit windows close.',
    bizValue: 'Direct credit refunds applied back to inventory capital.',
    mockUi: {
      title: 'Distributor Contract Return Scanner',
      status: 'ELIGIBILITY SCAN',
      medicine: 'Metformin 1000mg (Batch MET-204)',
      qty: '350 units',
      risk: '18 Days Return Window',
      metric: '₹1,23,000 Supplier Credit',
      actionLabel: 'Submit Claim Manifest',
      details: [
        { label: 'Distributor', value: 'Cipla Ltd' },
        { label: 'Return SLA Policy', value: 'Full cost reimbursement' },
        { label: 'Remaining Time', value: '18 days before SLA expiration' },
      ],
      steps: [
        'Contract returns rules engine flags open return slots.',
        'Return documentation compiled with batch logs.',
        'Claim submitted to distributor ledger.'
      ]
    }
  },
  {
    key: 'transfer',
    label: 'Transfer',
    icon: Package,
    accent: '#15803D',
    accentLight: '#F0FDF4',
    accentBorder: '#BBF7D0',
    whatHappens: 'Matches local surplus batches to active branch deficits.',
    whyItMatters: 'Prevents regional stockouts and emergency procurement costs.',
    bizValue: 'Optimizes asset utilization across multi-location networks.',
    mockUi: {
      title: 'Inter-Branch Rebalancing Router',
      status: 'SURPLUS MATCH',
      medicine: 'Lisinopril 10mg (Batch LIS-108)',
      qty: '180 units',
      risk: '60 Days to Expiry',
      metric: '100% Margin Preserved',
      actionLabel: 'Approve Courier Manifest',
      details: [
        { label: 'Source branch', value: 'Delhi Central Hub (Surplus)' },
        { label: 'Target branch', value: 'Mumbai Branch C (Shortage)' },
        { label: 'Estimated Transit', value: '6 Hours (Cold chain locked)' },
      ],
      steps: [
        'Surplus flagged at Delhi Central due to demand shift.',
        'Active purchase request matched at Mumbai Branch C.',
        'Transfer manifest and logistics dispatch compiled.'
      ]
    }
  },
  {
    key: 'redistribute',
    label: 'Redistribute',
    icon: ArrowUpRight,
    accent: '#B45309',
    accentLight: '#FFFBEB',
    accentBorder: '#FDE68A',
    whatHappens: 'Shifts slow-moving stock to high-velocity distribution hubs.',
    whyItMatters: 'Realigns local inventories with network velocity spikes.',
    bizValue: 'Maximizes regional sell-through without buying new shipments.',
    mockUi: {
      title: 'Network Turnover Optimizer',
      status: 'VELOCITY ALERT',
      medicine: 'Atorvastatin 20mg (Batch ATO-902)',
      qty: '800 units',
      risk: 'Velocity below baseline',
      metric: '40% Better Sell-Through',
      actionLabel: 'Realign Stock Inventory',
      details: [
        { label: 'Current Location', value: 'Pune Depot (Stagnant)' },
        { label: 'High Demand Depot', value: 'Delhi Depot A (+320% velocity)' },
        { label: 'Rebalancing SKU', value: 'Atorvastatin 20mg' },
      ],
      steps: [
        'SKU turnover rate flagged below local network baseline.',
        'Matching regional demand indexes scanned.',
        'Rebalance route approved to maximize sell-through.'
      ]
    }
  },
  {
    key: 'donate',
    label: 'Donate',
    icon: Heart,
    accent: '#65A30D',
    accentLight: '#F7FEE7',
    accentBorder: '#D9F99D',
    whatHappens: 'Directs eligible expiring batches to social impact partners.',
    whyItMatters: 'Provides a compliant, responsible pathway when returns or sales close.',
    bizValue: 'Secures tax deduction certificates and CSR social credits.',
    mockUi: {
      title: 'Non-profit CSR Matching Panel',
      status: 'NGO MATCH FOUND',
      medicine: 'Azithromycin 250mg (Batch AZI-892)',
      qty: '320 units',
      risk: '22 Days to Expiry',
      metric: '₹14,400 Tax Credit Receipt',
      actionLabel: 'Lock Donation manifest',
      details: [
        { label: 'NGO Partner', value: 'HelpAge India Clinic' },
        { label: 'Regulatory Path', value: 'Schedule H Donation Code' },
        { label: 'Tax Deductible Rule', value: '80G Certificate Sync' },
      ],
      steps: [
        'Commercial sale eligibility window expires.',
        'Need list match scanned from certified NGO network.',
        'Audit-safe donation manifest generated.'
      ]
    }
  },
  {
    key: 'dispose',
    label: 'Dispose',
    icon: Trash2,
    accent: '#4B5563',
    accentLight: '#F9FAFB',
    accentBorder: '#E5E7EB',
    whatHappens: 'Schedules eco-certified medical destruction pickup events.',
    whyItMatters: 'Secures immediate chain-of-custody logs and regulatory protection.',
    bizValue: 'Eliminates CDSCO/pollution board compliance liabilities.',
    mockUi: {
      title: 'Hazardous Disposal & Audit Logger',
      status: 'DESTRUCTION PROTOCOL',
      medicine: 'Gabapentin 300mg (Expired)',
      qty: '80 units',
      risk: '0 Days to Expiry',
      metric: '100% Audit Protection',
      actionLabel: 'Sign Disposal Log',
      details: [
        { label: 'Licensed Handler', value: 'MediWaste Ltd' },
        { label: 'Compliance Code', value: 'Schedule M bio-chemical logs' },
        { label: 'Ledger Hash', value: 'SHA-256 Encrypted Audit' },
      ],
      steps: [
        'Upstream recovery outcomes checked and exhausted.',
        'Bio-hazard collection scheduled under state board rules.',
        'Chain of custody audit ledger sealed.'
      ]
    }
  },
];

export default function PlatformPage() {
  const [activeTab, setActiveTab] = useState('sell');
  const current = TABS.find(t => t.key === activeTab)!;

  return (
    <div className="flex flex-col bg-[#F7F6F3] min-h-screen">
      
      {/* ── 1. HERO ── */}
      <section className="pt-32 pb-24 bg-white border-b border-[#D9DDD5] relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 100% 0%, ${current.accentLight} 0%, transparent 60%)`,
        }} />
        
        <div className="container-tight grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-[1050px] mx-auto relative z-10 text-left">
          
          {/* Copy block */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] px-3 py-1 rounded-full border border-emerald-100">
              Medicine Lifecycle Intelligence
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#0D2B1A] leading-[1.1] tracking-tight">
              One Intelligence Layer.<br />
              Six Possible Outcomes.<br />
              <span className="text-[#059669]">Zero Waste Blindspots.</span>
            </h1>
            <p className="text-base text-[#5C7A68] leading-relaxed max-w-[580px]">
              VIALA is the intelligence layer that sits above your existing software to continuously flag expiry risk and automatically identify the highest-value, most responsible outcome for every medicine before it is lost.
            </p>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2.5 pt-4 text-xs font-mono font-bold text-[#5C7A68] uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#059669] stroke-[3]" /> Maximize recovery margins</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#059669] stroke-[3]" /> Zero store workflow friction</span>
            </div>
          </div>

          {/* SVG Visual (Flow: Batch -> VIALA -> 6 Outcomes) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[450px] bg-[#F7F6F3] border border-[#D9DDD5] rounded-2xl p-6 shadow-sm">
              <svg viewBox="0 0 500 280" className="w-full h-auto overflow-visible select-none">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="#D9DDD5" />
                  </marker>
                </defs>

                {/* Connecting lines */}
                <line x1="250" y1="52" x2="250" y2="105" stroke="#D9DDD5" strokeWidth="1.5" markerEnd="url(#arrow)" />
                
                {/* Branching curves from VIALA to 6 outputs */}
                {[50, 130, 210, 290, 370, 450].map((targetX, i) => {
                  const pathD = `M 250,140 C 250,180 ${targetX},180 ${targetX},215`;
                  return (
                    <path 
                      key={i} 
                      d={pathD} 
                      fill="none" 
                      stroke={current.key === TABS[i].key ? current.accent : '#EDF0EC'} 
                      strokeWidth={current.key === TABS[i].key ? '2.5' : '1.2'} 
                      className="transition-all duration-300"
                    />
                  );
                })}

                {/* Nodes */}
                {/* Node: Medicine Batch */}
                <g transform="translate(250, 32)">
                  <rect x="-65" y="-16" width="130" height="32" rx="6" fill="#FFFFFF" stroke="#D9DDD5" strokeWidth="1.2" />
                  <text textAnchor="middle" y="4" className="text-[9px] font-bold font-mono fill-[#0D2B1A] uppercase tracking-wider">Medicine Batch</text>
                </g>

                {/* Node: VIALA Decision Layer */}
                <g transform="translate(250, 122)">
                  <rect x="-75" y="-18" width="150" height="36" rx="8" fill="#0D2B1A" stroke="#059669" strokeWidth="1.5" />
                  <text textAnchor="middle" y="4" className="text-[11px] font-bold fill-white tracking-widest font-mono">VIALA LAYER</text>
                </g>

                {/* Nodes: 6 Outcomes */}
                {[50, 130, 210, 290, 370, 450].map((targetX, i) => {
                  const isActive = current.key === TABS[i].key;
                  return (
                    <g key={i} transform={`translate(${targetX}, 225)`}>
                      <circle r="12" fill={isActive ? TABS[i].accentLight : '#FFFFFF'} stroke={isActive ? TABS[i].accent : '#D9DDD5'} strokeWidth="1.2" />
                      {/* Mini Symbol */}
                      <text textAnchor="middle" y="3" className="text-[8px] font-black font-mono" style={{ fill: isActive ? TABS[i].accent : '#5C7A68' }}>
                        {TABS[i].label[0]}
                      </text>
                      <text textAnchor="middle" y="24" className={`text-[8.5px] font-bold select-none transition-colors duration-200 ${isActive ? 'fill-[#0D2B1A] font-extrabold' : 'fill-[#5C7A68]'}`}>
                        {TABS[i].label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. WHY VIALA IS DIFFERENT ── */}
      <section className="py-24 bg-[#F7F6F3] border-b border-[#D9DDD5]">
        <div className="container-tight text-center max-w-[1000px] mx-auto">
          
          <div className="max-w-[620px] mx-auto mb-16">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#5C7A68] block mb-2 font-mono">HOW VIALA COMPARES</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B1A]">
              Traditional Inventory Systems vs. VIALA Layer
            </h2>
            <p className="mt-3 text-sm text-[#5C7A68] leading-relaxed">
              We do not replace your catalog systems. VIALA sits above them as an active intelligence layer to divert inventory from waste to value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Traditional Card */}
            <div className="bg-white border border-[#D9DDD5] rounded-2xl p-6 sm:p-8 text-left shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-rose-700 flex items-center gap-2 mb-6">
                  <span className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 font-mono text-xs">X</span>
                  Traditional Systems
                </h3>
                <ul className="space-y-4 text-xs font-semibold text-[#5C7A68]">
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Manual Expiry Audits</strong>: Staff manually scan shelves, leading to missed expiry windows and human oversight.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Isolated Locations</strong>: Expiry risk sits silently in Hub A while Hub B purchases the exact same SKU externally.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Lost Return Credits</strong>: Distributor credit return SLA rules expire before credits can be compiled.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Disposal Default</strong>: Unused stock defaults directly to biomedical incineration, locking in a 100% loss.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-[#EDF0EC] text-[10px] uppercase font-bold text-[#5C7A68]">
                Passive & Fragmented Operations
              </div>
            </div>

            {/* VIALA Card */}
            <div className="bg-white border-2 border-[#0B4D2E] rounded-2xl p-6 sm:p-8 text-left shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <h3 className="text-lg font-black text-[#0B4D2E] flex items-center gap-2 mb-6">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-mono text-xs">✓</span>
                  VIALA Intelligence Layer
                </h3>
                <ul className="space-y-4 text-xs font-semibold text-[#0D2B1A]">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#059669] mt-0.5 flex-shrink-0 stroke-[3]" />
                    <span><strong>Autonomous Expiry Tracking</strong>: Continuous tracking of batch expiry timelines sits above current databases.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#059669] mt-0.5 flex-shrink-0 stroke-[3]" />
                    <span><strong>Cross-Branch Rebalancing</strong>: Matches local surpluses to regional deficits to preserve 100% margin value.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#059669] mt-0.5 flex-shrink-0 stroke-[3]" />
                    <span><strong>Distributor returns scanner</strong>: Scans contract return windows automatically to claim credits before they close.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#059669] mt-0.5 flex-shrink-0 stroke-[3]" />
                    <span><strong>6 Optimized Channels</strong>: Evaluates and routes every batch dynamically to its single highest-value outcome.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-[#EDF0EC] text-[10px] uppercase font-bold text-[#059669]">
                Active & Unified Outcomes
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. INTERACTIVE OUTCOME EXPLORER ── */}
      <section className="py-24 bg-white border-b border-[#D9DDD5]">
        <div className="container-tight">
          
          <div className="text-center max-w-[620px] mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] px-3 py-1 rounded-full border border-emerald-100 mb-3">
              Interactive Explorer
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B1A]">
              Explore the Six Outcomes
            </h2>
            <p className="mt-3 text-sm text-[#5C7A68] leading-relaxed">
              Select an outcome tab to preview the platform recommendation and see how VIALA handles the operational details.
            </p>
          </div>

          {/* Tab selector bar */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-[700px] mx-auto">
            {TABS.map(tab => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                    isActive
                      ? 'bg-[#0D2B1A] text-white border-[#0D2B1A]'
                      : 'bg-white text-[#5C7A68] border-[#D9DDD5] hover:bg-[#F7F6F3] hover:text-[#0D2B1A]'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Explorer mockup container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#F7F6F3] rounded-3xl border border-[#D9DDD5] p-6 sm:p-8">
            
            {/* Left: Detailed CSS UI Dashboard Block */}
            <div className="lg:col-span-7 bg-white border border-[#D9DDD5] rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between min-h-[380px]">
              
              {/* UI Header chrome */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#EDF0EC] border-b border-[#D9DDD5]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
                  <span className="text-[10px] font-mono text-[#5C7A68] ml-4 bg-white border px-2.5 py-0.5 rounded">
                    viala.app/{current.key}-recommender
                  </span>
                </div>
                <span className="text-[8px] font-bold text-white uppercase bg-rose-500 border border-rose-600 px-2 py-0.5 rounded">
                  {current.mockUi.status}
                </span>
              </div>

              {/* Mock UI Workspace */}
              <div className="p-6 flex-1 flex flex-col gap-4 text-left">
                
                {/* Active alert metadata */}
                <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase">Recommended Action</span>
                      <h4 className="text-xs sm:text-sm font-black text-[#0D2B1A] mt-0.5">{current.mockUi.title}</h4>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {current.mockUi.risk}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 border-t pt-3 border-[#EDF0EC] text-[11px] font-mono">
                    <div><span className="text-[#5C7A68] block">SKU ITEM</span><span className="font-bold text-[#0D2B1A]">{current.mockUi.medicine}</span></div>
                    <div><span className="text-[#5C7A68] block">QUANTITY</span><span className="font-bold text-[#0D2B1A]">{current.mockUi.qty}</span></div>
                  </div>
                </div>

                {/* Key value parameters */}
                <div className="space-y-2.5">
                  <span className="text-[9px] font-bold text-[#717171] uppercase tracking-wider block">Agreement Diagnostics</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {current.mockUi.details.map((detail, idx) => (
                      <div key={idx} className="border border-[#D9DDD5] rounded-lg p-2.5 bg-white text-center">
                        <span className="text-[8px] text-[#5C7A68] uppercase block mb-1">{detail.label}</span>
                        <span className="text-xs font-bold text-[#0D2B1A] font-mono">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* UI Footer action bar */}
              <div className="px-6 py-4 border-t bg-[#F7F6F3] flex justify-between items-center border-[#D9DDD5]">
                <div>
                  <span className="text-[8px] text-[#5C7A68] uppercase block">PRESERVED MARGIN VALUE</span>
                  <span className="text-sm font-black text-[#059669] font-mono">{current.mockUi.metric}</span>
                </div>
                <button
                  className="px-4 py-2 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.01]"
                  style={{ background: current.accent }}
                  onClick={() => alert(`Simulated: ${current.mockUi.actionLabel} completed.`)}
                >
                  {current.mockUi.actionLabel}
                </button>
              </div>

            </div>

            {/* Right: What happens, Why it matters, Business Value */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              
              {/* Detailed outcome cards */}
              <div className="bg-white border border-[#D9DDD5] rounded-2xl p-6 text-left shadow-sm space-y-4 flex-1">
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block mb-1">What Happens</span>
                  <p className="text-xs font-semibold text-[#0D2B1A] leading-relaxed">{current.whatHappens}</p>
                </div>
                
                <div className="border-t border-[#EDF0EC] pt-3">
                  <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block mb-1">Why It Matters</span>
                  <p className="text-xs font-semibold text-[#5C7A68] leading-relaxed">{current.whyItMatters}</p>
                </div>

                <div className="border-t border-[#EDF0EC] pt-3">
                  <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block mb-1">Business Value Generated</span>
                  <p className="text-xs font-semibold text-[#059669] leading-relaxed">{current.bizValue}</p>
                </div>
              </div>

              {/* Step flow */}
              <div className="bg-[#0D2B1A] text-white rounded-2xl p-6 text-left shadow-sm">
                <span className="text-[9px] font-mono font-bold text-[#34D399] uppercase tracking-wider block mb-3">Resolution Steps</span>
                <div className="space-y-2.5">
                  {current.mockUi.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start text-[11px]">
                      <span className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0" style={{ background: current.accent }}>
                        {idx + 1}
                      </span>
                      <span className="text-white/80 leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 4. MISSION CONTROL DASHBOARD PREVIEW ── */}
      <section className="py-24 bg-[#0A0A0A] text-white">
        <div className="container-tight">
          
          <div className="text-center max-w-[620px] mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#34D399] bg-[#0D2F22] px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
              Command Center
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Every unit tracked. Every decision logged.
            </h2>
            <p className="mt-3 text-sm text-[#5C7A68] leading-relaxed">
              Our real-time command dashboard logs total network risk and maps recommended actions in a single priority queue.
            </p>
          </div>

          {/* Dashboard console preview */}
          <div className="bg-[#131924] border border-[#1A2535] rounded-3xl overflow-hidden shadow-2xl max-w-[900px] mx-auto text-left">
            
            {/* Header chrome */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-[#1A2535]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
                <span className="text-[10px] font-mono text-[#5C7A68] ml-4">viala.app/dashboard/overview</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#34D399] bg-[#0D2F22] border border-[#1E4A35] px-2 py-0.5 rounded">
                SECURED SYSTEM
              </span>
            </div>

            {/* Dashboard Workspace */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#0E131F]">
              
              {/* Sidebar */}
              <div className="md:col-span-3 space-y-4 border-r border-[#1A2535] pr-6">
                <div className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-wider">VIALA Intelligence</div>
                <div className="space-y-1 text-xs">
                  {[
                    { name: 'Active Queue (12)', active: true },
                    { name: 'Vendor returns', active: false },
                    { name: 'Branch Transfers', active: false },
                    { name: 'NGO Donations', active: false },
                    { name: 'Compliance Reports', active: false },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-lg font-bold cursor-pointer transition-all ${
                        item.active 
                          ? 'bg-[#1E293B] text-white border-l-2 border-[#34D399]' 
                          : 'text-[#5C7A68] hover:bg-[#1E293B] hover:text-white'
                      }`}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="md:col-span-9 space-y-4">
                
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1E293B]/40 border border-[#1A2535] rounded-xl p-3.5">
                    <span className="text-[9px] text-[#5C7A68] uppercase font-bold tracking-wider block">Recoverable Value</span>
                    <span className="text-base font-extrabold text-white mt-1 block">₹2,42,800</span>
                  </div>
                  <div className="bg-[#1E293B]/40 border border-[#1A2535] rounded-xl p-3.5">
                    <span className="text-[9px] text-[#5C7A68] uppercase font-bold tracking-wider block">Active Deficits</span>
                    <span className="text-base font-extrabold text-amber-500 mt-1 block">4 branch matches</span>
                  </div>
                  <div className="bg-[#1E293B]/40 border border-[#1A2535] rounded-xl p-3.5">
                    <span className="text-[9px] text-[#5C7A68] uppercase font-bold tracking-wider block">SLA window closes</span>
                    <span className="text-base font-extrabold text-rose-400 mt-1 block">15 days remaining</span>
                  </div>
                </div>

                {/* Priority action items list */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Pending Action Queue</span>
                  
                  {[
                    { batch: 'AMX-453', item: 'Amoxicillin 500mg', action: 'Transfer to Mumbai Branch C', value: '₹48,000 credit', status: 'RECOMMENDED', badgeColor: 'text-[#34D399] bg-[#0D2F22]' },
                    { batch: 'MET-204', item: 'Metformin 1000mg', action: 'Vendor Return (Cipla Ltd)', value: '₹1,23,000 refund', status: 'RECOMMENDED', badgeColor: 'text-[#34D399] bg-[#0D2F22]' },
                    { batch: 'LIS-108', item: 'Lisinopril 10mg', action: 'Transfer to Bangalore Depot', value: '₹12,500 inventory saved', status: 'ON STANDBY', badgeColor: 'text-[#5C7A68] bg-[#1E293B]' }
                  ].map((row, idx) => (
                    <div key={idx} className="bg-[#1E293B]/20 border border-[#1A2535] rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{row.item}</span>
                          <span className="text-[8px] font-mono text-[#5C7A68]">Batch: {row.batch}</span>
                        </div>
                        <div className="text-[10px] text-[#5C7A68] mt-1">{row.action}</div>
                      </div>
                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-[#34D399]">{row.value}</span>
                        </div>
                        <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded border border-white/5 ${row.badgeColor}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 5. COMPLIANCE & TRUST LAYER ── */}
      <section className="py-12 bg-[#F7F6F3] border-b border-[#D9DDD5] flex items-center max-h-[250px] min-h-[200px]">
        <div className="container-tight w-full max-w-[960px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {[
              { tag: 'CDSCO Ready', title: 'Schedule M Logs', desc: 'Designed to support Schedule M compliant documentation and audit records.' },
              { tag: 'HIPAA Aligned', title: 'Patient Data Shield', desc: 'Strict patient confidentiality standards. Zero patient data exposed.' },
              { tag: 'Audit Trail', title: 'Signed Records', desc: 'Immutable tracking and signed logs for all inventory transfers.' },
              { tag: 'AES-256', title: 'Encryption Standard', desc: 'Enterprise-grade encryption protecting databases both in transit and at rest.' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[10px] font-mono font-black text-[#0B4D2E] uppercase block">{item.tag}</span>
                <h4 className="text-xs font-bold text-[#0D2B1A]">{item.title}</h4>
                <p className="text-[9.5px] text-[#5C7A68] leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. BOTTOM CTA ── */}
      <section className="py-24 bg-[#0B4D2E] text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
        
        <div className="container-tight relative z-10 max-w-[620px] mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Stop Losing Medicine Value.<br />
            <span className="text-[#34D399]">Start Recovering It.</span>
          </h2>
          <p className="text-sm text-white/70 leading-relaxed mt-6 max-w-[500px] mx-auto">
            We will run a recovery simulation on your product catalog and present your projected write-off savings before you sign anything.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/get-started" className="btn-accent justify-center px-8 py-3.5 shadow-lg">
              Book a Live Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="btn-secondary text-white border-white/20 hover:border-white/50 hover:bg-white/5 justify-center px-8 py-3.5">
              Calculate Your ROI
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
