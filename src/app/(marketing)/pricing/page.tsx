'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, ChevronDown, Check, CheckCircle2
} from 'lucide-react';



// ─── FAQS Accordion List ──────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How long does implementation take?",
    a: "Implementation takes less than 14 days. We connect VIALA directly to your pharmacy management systems (PMS/ERP) in read-only background mode with zero local downtime or operational disruption."
  },
  {
    q: "Do you charge commissions on recovered value?",
    a: "No. VIALA charges a flat subscription fee. You keep 100% of the returned credits, branch transfer margins, and CSR tax offsets we identify, without any volume fees."
  },
  {
    q: "Which ERP systems are supported?",
    a: "We support integrations with major ERP systems and Pharmacy Management Systems (PMS). Custom configurations are supported via our REST APIs or secure direct database sync."
  },
  {
    q: "What happens after the pilot?",
    a: "After the 90-day pilot, we compile a detailed audit report showing VIALA's direct ROI. You can choose to transition into a standard annual subscription or cancel at any time."
  },
  {
    q: "Is patient data required?",
    a: "No. VIALA scans inventory levels, cost bases, and expiry calendars. We do not ingest, process, or store any patient-identifiable data (PII), ensuring 100% HIPAA alignment."
  },
  {
    q: "Can we scale after deployment?",
    a: "Yes. You can add new pharmacy locations, hospital beds, or warehouse hubs to VIALA instantly as your healthcare network expands."
  }
];

export default function PricingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Slider States for Recovery Calculator
  const [locations, setLocations] = useState(10);
  const [monthlyValue, setMonthlyValue] = useState(1000000); // 10 Lakhs default
  const [lossPercent, setLossPercent] = useState(1.2); // 1.2% default

  // Calculate live results
  const annualLoss = locations * monthlyValue * 12 * (lossPercent / 100);
  const projectedRecovery = annualLoss * 0.82; // Viala recovers 82%
  
  // Tiered subscription cost logic for ROI calculations
  const perLocCost = locations <= 5 ? 10000 : locations <= 50 ? 8000 : 6000;
  const annualCost = locations * perLocCost * 12;
  const expectedRoiVal = annualCost > 0 ? projectedRecovery / annualCost : 9.5;
  const paybackDays = Math.max(14, Math.round(365 / (expectedRoiVal > 0 ? expectedRoiVal : 9.5)));

  // Currency Formatter Helper
  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Crore`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col bg-[#F7F6F3] min-h-screen text-[#0D2B1A]">

      {/* ─── SECTION 1: HERO ─── */}
      <section className="pt-32 pb-20 bg-white border-b border-[#D9DDD5] relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#34D399]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container-tight text-center max-w-[850px] mx-auto px-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-6">
            Subscription Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#0D2B1A] leading-[1.15] tracking-tight">
            Recover More Than You Spend.
          </h1>
          <p className="mt-6 text-sm sm:text-base text-[#5C7A68] leading-relaxed max-w-[620px] mx-auto">
            VIALA helps healthcare networks identify expiry risks early, recover inventory value intelligently, and maintain compliance — before losses occur.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/get-started" className="btn-primary flex items-center gap-2 px-6 py-3">
              Book Recovery Assessment <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#outcomes" className="px-6 py-3 text-sm font-semibold rounded-[10px] border border-[#D9DDD5] hover:bg-[#F7F6F3] transition-all bg-white text-[#0D2B1A]">
              View Recovery Outcomes
            </a>
          </div>


          {/* ── WHY VIALA SECTION ── */}
          <div className="mt-16 max-w-[960px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-lg font-black text-[#0D2B1A] tracking-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
                Why Healthcare Teams Choose VIALA
              </h2>
              <p className="mt-2.5 text-sm text-[#5C7A68] max-w-[560px] mx-auto leading-relaxed">
                Built to identify expiry risks early, recover inventory value intelligently, and maintain operational compliance across healthcare networks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15 15" />
                    </svg>
                  ),
                  title: 'Early Expiry Detection',
                  desc: 'Identify inventory at risk 60–90 days before expiry through continuous monitoring and lifecycle intelligence.',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10" />
                      <path d="M16 12h6m-3-3 3 3-3 3" />
                    </svg>
                  ),
                  title: 'Recovery Intelligence',
                  desc: 'Automatically evaluate returns, transfers, redistribution, and recovery pathways based on inventory conditions.',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="12" y2="17" />
                    </svg>
                  ),
                  title: 'Compliance Documentation',
                  desc: 'Generate audit-ready records and structured documentation for operational traceability and governance.',
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="7" height="7" rx="1" />
                      <rect x="15" y="3" width="7" height="7" rx="1" />
                      <rect x="2" y="14" width="7" height="7" rx="1" />
                      <rect x="15" y="14" width="7" height="7" rx="1" />
                    </svg>
                  ),
                  title: 'Multi-Location Coordination',
                  desc: 'Support inventory visibility, recovery planning, and decision-making across pharmacies, hospitals, and healthcare networks.',
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="group bg-white border border-[#E4E0D9] rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left"
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                    style={{ background: '#ECFDF5', color: '#059669' }}
                  >
                    {card.icon}
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="text-sm font-bold text-[#0D2B1A] leading-snug mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#5C7A68] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {/* Hover accent line */}
                  <div
                    className="h-[2px] w-0 group-hover:w-full rounded-full transition-all duration-300"
                    style={{ background: 'linear-gradient(90deg, #059669, #34D399)' }}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>


      {/* ─── SECTION 2: PRICING PLANS ─── */}
      <section className="py-24 bg-[#F7F6F3] border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

            {/* Starter Plan */}
            <div className="bg-white border border-[#D9DDD5] rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-[#5C7A68] uppercase tracking-wider">Starter</span>
                  <span className="text-[9px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full">
                    6× Expected ROI
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0D2B1A]">Starter</h3>
                  <p className="text-xs text-[#5C7A68] mt-1.5 leading-relaxed">
                    For independent pharmacies and small groups.
                  </p>
                </div>

                <div className="border-t border-[#F0EFEA] pt-6 space-y-3.5">
                  <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase block">INCLUDED CAPABILITIES</span>
                  <ul className="space-y-3 text-xs text-[#5C7A68]">
                    {['Up to 5 locations', 'Expiry monitoring', 'Vendor return workflows', 'Compliance logs', 'Basic analytics'].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#059669] flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link href="/get-started" className="w-full mt-10 py-3 rounded-lg text-xs font-bold text-center bg-[#EDF0EC] hover:bg-[#D9DDD5] text-[#0D2B1A] transition-colors">
                Contact Sales
              </Link>
            </div>

            {/* Growth Plan (Featured) */}
            <div className="bg-[#0D2B1A] border-2 border-[#059669] text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 text-left relative overflow-hidden">
              
              {/* Highlight Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#34D399]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-[#34D399] uppercase tracking-wider">Growth</span>
                  <span className="text-[9px] font-bold bg-[#059669] text-white border border-[#34D399]/40 px-2.5 py-0.5 rounded-full">
                    10× Expected ROI
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white">Growth</h3>
                    <span className="text-[8px] font-bold bg-[#34D399] text-[#0D2B1A] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
                    For growing pharmacy networks.
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6 space-y-3.5">
                  <span className="text-[9px] font-mono font-bold text-white/40 uppercase block">INCLUDED CAPABILITIES</span>
                  <ul className="space-y-3 text-xs text-white/80">
                    {['Up to 50 locations', 'Recovery intelligence', 'Branch rebalancing', 'Vendor credit automation', 'Recovery analytics', 'Compliance documentation'].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#34D399] flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link href="/get-started" className="w-full mt-10 py-3 rounded-lg text-xs font-bold text-center bg-[#34D399] hover:bg-[#059669] hover:text-white text-[#0D2B1A] transition-colors relative z-10 shadow-md shadow-[#34D399]/10">
                Start Recovery Pilot
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white border border-[#D9DDD5] rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-[#5C7A68] uppercase tracking-wider">Enterprise</span>
                  <span className="text-[9px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2.5 py-0.5 rounded-full">
                    12× Expected ROI
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0D2B1A]">Enterprise</h3>
                  <p className="text-xs text-[#5C7A68] mt-1.5 leading-relaxed">
                    For hospital groups and large healthcare networks.
                  </p>
                </div>

                <div className="border-t border-[#F0EFEA] pt-6 space-y-3.5">
                  <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase block">INCLUDED CAPABILITIES</span>
                  <ul className="space-y-3 text-xs text-[#5C7A68]">
                    {['Unlimited locations', 'ERP integrations', 'Custom workflows', 'Executive reporting', 'Dedicated infrastructure', 'Enterprise compliance controls'].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#059669] flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link href="/get-started" className="w-full mt-10 py-3 rounded-lg text-xs font-bold text-center bg-[#0D2B1A] hover:bg-[#081d11] text-white transition-colors">
                Book Enterprise Demo
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 3: RECOVERY CALCULATOR ─── */}
      <section id="calculator" className="py-24 bg-white border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[900px] mx-auto px-6">
          
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <span className="text-[10px] font-mono font-bold text-[#5C7A68] uppercase tracking-[0.2em] block mb-2">ROI Assessor</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B1A]">
              Calculate Your Recovery Potential
            </h2>
            <p className="mt-3 text-sm text-[#5C7A68] leading-relaxed">
              Estimate how much value may be hidden inside your existing inventory operations.
            </p>
          </div>

          {/* Interactive Calculator Box */}
          <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
            
            {/* Visual glow background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#059669]/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
              
              {/* Sliders (Left Column) */}
              <div className="md:col-span-7 space-y-6 text-left">
                
                {/* Sliders 1: Number of Locations */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Number of Locations</span>
                    <span className="font-mono text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{locations} branches</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={locations}
                    onChange={(e) => setLocations(parseInt(e.target.value))}
                    className="w-full accent-[#059669] bg-gray-200 h-1 rounded-lg cursor-pointer"
                    aria-label="Number of pharmacy locations"
                    aria-valuemin={1}
                    aria-valuemax={100}
                    aria-valuenow={locations}
                  />
                  <div className="flex justify-between text-[9px] text-[#5C7A68] font-mono">
                    <span>1 location</span>
                    <span>100 locations</span>
                  </div>
                </div>

                {/* Sliders 2: Monthly Inventory Value */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Monthly Inventory per Location</span>
                    <span className="font-mono text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{formatCurrency(monthlyValue)}</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="5000000"
                    step="100000"
                    value={monthlyValue}
                    onChange={(e) => setMonthlyValue(parseInt(e.target.value))}
                    className="w-full accent-[#059669] bg-gray-200 h-1 rounded-lg cursor-pointer"
                    aria-label="Monthly inventory value per location"
                    aria-valuemin={100000}
                    aria-valuemax={5000000}
                    aria-valuenow={monthlyValue}
                  />
                  <div className="flex justify-between text-[9px] text-[#5C7A68] font-mono">
                    <span>₹1 Lakh</span>
                    <span>₹50 Lakhs</span>
                  </div>
                </div>

                {/* Sliders 3: Estimated Expiry Loss % */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Estimated Expiry Loss %</span>
                    <span className="font-mono text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{lossPercent.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="5.0"
                    step="0.1"
                    value={lossPercent}
                    onChange={(e) => setLossPercent(parseFloat(e.target.value))}
                    className="w-full accent-[#059669] bg-gray-200 h-1 rounded-lg cursor-pointer"
                    aria-label="Estimated expiry loss percentage"
                    aria-valuemin={0.2}
                    aria-valuemax={5.0}
                    aria-valuenow={lossPercent}
                  />
                  <div className="flex justify-between text-[9px] text-[#5C7A68] font-mono">
                    <span>0.2%</span>
                    <span>5.0%</span>
                  </div>
                </div>

              </div>

              {/* Calculator Output Outputs (Right Column) */}
              <div className="md:col-span-5 bg-white border border-[#D9DDD5] rounded-2xl p-6 shadow-sm space-y-6 text-left">
                
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase block">PROJECTED ANNUAL RECOVERY</span>
                  <div className="text-3xl font-black text-[#0D2B1A] mt-1 tracking-tight">
                    {formatCurrency(projectedRecovery)}
                  </div>
                  <span className="text-[9px] text-[#5C7A68] block mt-1">Based on VIALA&apos;s 82% average recovery rate.</span>
                </div>

                <div className="border-t border-[#F0EFEA] pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase block">Expected ROI</span>
                    <span className="text-lg font-black text-[#059669]">{expectedRoiVal.toFixed(1)}x</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase block">Payback Period</span>
                    <span className="text-lg font-black text-[#0D2B1A]">{paybackDays} Days</span>
                  </div>
                </div>

                <Link href="/get-started" className="w-full py-3 rounded-lg text-xs font-bold text-center bg-[#0D2B1A] hover:bg-[#081d11] text-white transition-colors block text-center">
                  Book Assessment to Verify
                </Link>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION 4: PROVEN RESULTS ─── */}
      <section id="outcomes" className="py-24 bg-[#FAF9F6] border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[1000px] mx-auto px-6 text-center">
          
          <div className="max-w-[620px] mx-auto mb-16">
            <span className="text-[10px] font-mono font-bold text-[#5C7A68] uppercase tracking-[0.2em] block mb-2 font-mono">Performance Audits</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B1A]">
              Recovery Outcomes Across Healthcare Networks
            </h2>
            <p className="mt-3 text-sm text-[#5C7A68] leading-relaxed">
              Verified ROI records compiled from operational assessments across healthcare organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { locs: '10 Locations', recovery: '₹29 Lakhs', roi: '9.4x ROI', label: 'Retail Chain' },
              { locs: '34 Locations', recovery: '₹78 Lakhs', roi: '12x ROI', label: 'Pharmacy Network' },
              { locs: '1,200 Beds', recovery: '₹1.2 Crore', roi: '11x ROI', label: 'Hospital Group' }
            ].map((res, idx) => (
              <div key={idx} className="bg-white border border-[#D9DDD5] rounded-2xl p-6 sm:p-8 text-left shadow-sm hover:border-[#059669]/20 transition-all duration-200">
                <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#059669] uppercase tracking-wider mb-4">
                  <span>Audit Case 0{idx + 1}</span>
                  <span className="text-gray-400">{res.label}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase block">Organization Scale</span>
                    <span className="text-lg font-black text-[#0D2B1A]">{res.locs}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase block">Verified Recovery</span>
                    <span className="text-2xl font-black text-[#059669] tracking-tight">{res.recovery}</span>
                  </div>
                  <div className="border-t border-[#F0EFEA] pt-3 flex justify-between items-center text-xs font-bold text-[#0D2B1A]">
                    <span>Expected ROI:</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">{res.roi}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── SECTION 5: FAQ ─── */}
      <section className="py-24 bg-[#F7F6F3] border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[800px] mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-3">
              FAQ
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0D2B1A]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white border border-[#D9DDD5] rounded-xl overflow-hidden shadow-sm transition-all duration-300">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-[#0D2B1A] text-sm sm:text-base hover:bg-[#F7F6F3]/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-[#5C7A68] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-5 pt-0 border-t border-[#EDF0EC] text-xs sm:text-sm text-[#5C7A68] leading-relaxed bg-[#F7F6F3]/10">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── SECTION 6: FINAL CTA ─── */}
      <section className="py-24 bg-[#0B4D2E] text-white relative overflow-hidden text-center border-b border-[#0D2B1A]">
        
        {/* Subtle Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#059669]/20 via-transparent to-[#0B4D2E] pointer-events-none z-0" />
        
        <div className="container-tight relative z-10 max-w-[700px] mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
            Your Inventory Already Contains Recoverable Value.
          </h2>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed mt-6 max-w-[520px] mx-auto">
            Schedule a recovery assessment and discover how much value may be hidden inside your existing inventory operations.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/get-started" className="btn-accent justify-center px-8 py-3.5 shadow-lg w-full sm:w-auto">
              Book Recovery Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#calculator" className="btn-secondary text-white border-white/20 hover:border-white/50 hover:bg-white/5 justify-center px-8 py-3.5 w-full sm:w-auto">
              Calculate My ROI
            </a>
          </div>

          {/* Trust Checkmarks */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[10px] sm:text-xs font-mono text-emerald-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>HIPAA Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Audit Trail Logging</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Schedule M Support</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Enterprise Security</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
