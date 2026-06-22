'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Activity, TrendingUp, Check, Leaf,
  RefreshCw, Shield, Coins, Zap, Sliders
} from 'lucide-react';

// ─── Stat Counter Component ───────────────────────────────────────────────────
function StatCounter({ value, duration = 1500 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  let prefix = '';
  let suffix = '';
  let target = 0;
  let decimals = 0;

  const cleanVal = value.replace(/,/g, '');
  const match = cleanVal.match(/^([^0-9.]*)([0-9.]+)(.*)$/);
  if (match) {
    prefix = match[1];
    const numStr = match[2];
    suffix = match[3];
    target = parseFloat(numStr);
    if (numStr.includes('.')) {
      decimals = numStr.split('.')[1].length;
    }
  } else {
    const parsed = parseFloat(cleanVal);
    target = isNaN(parsed) ? 0 : parsed;
  }

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

  const fmt = () => {
    const displayVal = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString('en-IN');
    return `${prefix}${displayVal}${suffix}`;
  };

  return <span ref={ref} className="font-mono">{fmt()}</span>;
}

export default function ImpactPage() {
  // Section 2 state: ₹100 story pathways
  const [activePathway, setActivePathway] = useState(0);

  // Section 5 state: Outcomes list
  const [activeOutcome, setActiveOutcome] = useState(0);

  // Section 8 state: ROI Calculator
  const [locations, setLocations] = useState(10);
  const [inventoryValue, setInventoryValue] = useState(5000000); // 50 Lakhs default

  const estimatedAnnualWaste = inventoryValue * 0.055 * locations * 12; // 5.5% annual average waste
  const potentialRecoveryValue = estimatedAnnualWaste * 0.82; // 82% recovery rate

  const pathways = [
    {
      title: 'Distributor Returns',
      val: '₹35',
      desc: 'Automates contract verification and returns packaging within active credit claim windows.',
      color: '#059669'
    },
    {
      title: 'Inter-Branch Transfers',
      val: '₹25',
      desc: 'Balances excess supply with active shortages across clinics, shifting inventory before expiry.',
      color: '#2563EB'
    },
    {
      title: 'Secondary Resale',
      val: '₹12',
      desc: 'Clears surplus volumes through approved merchant channels to salvage baseline capital.',
      color: '#7C3AED'
    },
    {
      title: 'CSR Exemption Offsets',
      val: '₹10',
      desc: 'Routes non-commercial eligible inventory to certified NGO partners for tax exemption credits.',
      color: '#D97706'
    }
  ];

  const outcomes = [
    {
      title: 'Sold',
      desc: 'Ensures medicines reach patients through regular retail and pharmacy channels during periods of standard demand.',
      action: 'Demand alignment sync'
    },
    {
      title: 'Returned',
      desc: 'Triggers supplier return credits based on distributor return terms and SLA timing rules.',
      action: 'Contract return scanner'
    },
    {
      title: 'Transferred',
      desc: 'Shifts near-expiry stocks to active network clinics where current sales velocity prevents write-off risks.',
      action: 'Cross-branch balancer'
    },
    {
      title: 'Redistributed',
      desc: 'Matches surplus quantities with verified regional demand patterns across collaborative clinics.',
      action: 'Secondary channel engine'
    },
    {
      title: 'Donated',
      desc: 'Provides structured donation paths to certified NGOs, creating social impact and compliant tax deductions.',
      action: 'CSR compliance manifest'
    },
    {
      title: 'Safely Disposed',
      desc: 'Logs CDSCO Schedule M audit data and handles medical disposal with absolute environmental care when necessary.',
      action: 'Verified ecological audit'
    }
  ];

  return (
    <div className="flex flex-col bg-[#F7F6F3] min-h-screen">

      {/* ─── SECTION 1: HERO ─── */}
      <section className="pt-36 pb-20 bg-white border-b border-[#D9DDD5] relative overflow-hidden">
        <div className="container-tight max-w-[800px] mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-100/50 font-mono mb-6">
            Real-World Impact
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0D2B1A] leading-[1.05] tracking-tight">
            Every medicine recovered creates value<br />
            <span className="text-[#059669]">beyond inventory.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#5C7A68] leading-relaxed max-w-[620px] mx-auto">
            VIALA helps healthcare organizations reduce medicine waste, recover financial value, improve utilization, strengthen operational efficiency, and support more sustainable healthcare systems.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/get-started" className="btn-primary flex items-center gap-2 px-6 py-3">
              Request Impact Assessment <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#roi-calculator" className="px-6 py-3 text-sm font-semibold rounded-[10px] border border-[#D9DDD5] hover:bg-[#F7F6F3] transition-all bg-white text-[#0D2B1A]">
              Calculate Recovery Potential
            </a>
          </div>

          {/* Centered Transformation Visual below details */}
          <div className="mt-16 bg-[#F7F6F3] border border-[#D9DDD5] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm max-w-[760px] mx-auto">
            
            {/* Horizontal flow line */}
            <div className="absolute top-1/2 left-12 right-12 h-[1px] bg-dashed bg-[#D9DDD5] -translate-y-1/2 pointer-events-none z-0" />
            
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              
              {/* Without VIALA Card */}
              <div className="bg-white border border-[#D9DDD5] rounded-2xl p-4 shadow-sm text-left">
                <span className="text-[8px] font-mono font-bold text-rose-500 uppercase tracking-widest block mb-2">Without VIALA</span>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Expired Inventory
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    100% Write-Offs
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5C7A68]">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Disposal Costs
                  </div>
                </div>
              </div>

              {/* VIALA Scan Hub */}
              <div className="flex flex-col items-center justify-center relative">
                <div className="w-12 h-12 rounded-full bg-[#0D2B1A] border-2 border-[#059669] flex items-center justify-center shadow-lg relative animate-[pulse_3s_infinite]">
                  <span className="absolute inset-0.5 rounded-full border border-dashed border-[#059669] animate-[spin_20s_linear_infinite]" />
                  <Activity className="w-5 h-5 text-[#34D399]" />
                </div>
                <span className="absolute top-[56px] left-1/2 -translate-x-1/2 text-[9px] font-mono font-black text-[#0D2B1A] uppercase tracking-wider whitespace-nowrap">
                  VIALA Layer
                </span>
              </div>

              {/* With VIALA Card */}
              <div className="bg-white border border-[#059669]/20 rounded-2xl p-4 shadow-sm text-left">
                <span className="text-[8px] font-mono font-bold text-[#059669] uppercase tracking-widest block mb-2">With VIALA</span>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center gap-1.5 text-[#059669] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                    ₹82 Recovered
                  </div>
                  <div className="flex items-center gap-1.5 text-[#0B4D2E] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B4D2E]" />
                    High Utilization
                  </div>
                  <div className="flex items-center gap-1.5 text-[#5C7A68]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#059669]/60" />
                    Minimized Waste
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ─── SECTION 2: THE ₹100 STORY ─── */}
      <section className="py-24 bg-white border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[900px] mx-auto px-6 text-center">
          <span className="text-[10px] font-mono font-bold text-[#5C7A68] uppercase tracking-[0.2em] block mb-3">Inventory Dynamics</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D2B1A] tracking-tight">
            What happens to ₹100 of at-risk inventory?
          </h2>
          <p className="mt-3 text-sm text-[#5C7A68] max-w-[560px] mx-auto leading-relaxed">
            A comparison of standard operations write-offs versus VIALA&apos;s dynamic recovery pathways.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch text-left">
            
            {/* Without VIALA Lane */}
            <div className="bg-[#FAF9F6] border border-[#D9DDD5] rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-500 uppercase tracking-widest block mb-4">Without VIALA</span>
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3 border-[#D9DDD5]">
                    <span className="text-sm font-bold text-[#0D2B1A]">At-Risk Value</span>
                    <span className="font-mono text-lg font-black text-rose-600">₹100</span>
                  </div>
                  <div className="space-y-4 text-xs text-[#5C7A68]">
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-600 flex-shrink-0">1</span>
                      <span>Inventory approaches expiration unchecked in siloed pharmacy cabinets.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-600 flex-shrink-0">2</span>
                      <span>Distributor returns eligibility contract windows close without notification.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-600 flex-shrink-0">3</span>
                      <span>Stock expires and is sent for paid chemical incineration write-off.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t border-[#D9DDD5] mt-8 flex justify-between items-baseline">
                <span className="text-xs font-bold text-rose-600">Final Outcome</span>
                <span className="font-mono text-2xl font-black text-rose-600">₹0 Recovered</span>
              </div>
            </div>

            {/* With VIALA Lane */}
            <div className="bg-[#0D2B1A] border border-[#1E4D30] rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#059669]/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <span className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-widest block mb-4">With VIALA Recovery</span>
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3 border-white/10">
                    <span className="text-sm font-bold">At-Risk Value</span>
                    <span className="font-mono text-lg font-black text-[#34D399]">₹100</span>
                  </div>
                  
                  {/* Interactive Pathway Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {pathways.map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActivePathway(idx)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          activePathway === idx
                            ? 'bg-white/10 border-[#34D399]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[10px] font-black tracking-wide truncate max-w-[80px]">{p.title}</span>
                          <span className="text-xs font-mono font-black text-[#34D399]">{p.val}</span>
                        </div>
                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ background: p.color, width: `${parseInt(p.val.slice(1)) * 2}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pathway Detail Card */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 min-h-[80px]">
                    <span className="text-[8px] font-mono font-bold text-[#34D399] uppercase tracking-wider block mb-1">
                      {pathways[activePathway].title} Pathway Details
                    </span>
                    <p className="text-[11px] text-white/70 leading-relaxed">
                      {pathways[activePathway].desc}
                    </p>
                  </div>

                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 flex justify-between items-baseline relative z-10">
                <span className="text-xs font-bold text-[#34D399]">Average Recovered Value</span>
                <span className="font-mono text-2xl font-black text-[#34D399]">₹82 Recovered</span>
              </div>
            </div>

          </div>

          <p className="text-[10px] text-[#5C7A68] italic mt-6">
            *Aggregated outcome model across clinical pharmacy stores, wholesale centers, and retail channels.
          </p>
        </div>
      </section>

      {/* ─── SECTION 3: FOUR DIMENSIONS OF IMPACT ─── */}
      <section className="py-24 bg-[#F7F6F3] border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[1000px] mx-auto px-6 text-center">
          <span className="text-[10px] font-mono font-bold text-[#5C7A68] uppercase tracking-[0.2em] block mb-3">Multidimensional Value</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D2B1A] tracking-tight">
            Impact Beyond Inventory
          </h2>
          <p className="mt-3 text-sm text-[#5C7A68] max-w-[560px] mx-auto leading-relaxed">
            How VIALA transforms pharmaceutical supply chains across financial, operational, clinical, and environmental vectors.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            {/* Card 1: Financial Impact */}
            <div className="bg-white border border-[#D9DDD5] rounded-3xl p-6 sm:p-8 hover:border-[#059669]/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center mb-6">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#0D2B1A] mb-3">Financial Impact</h3>
                <p className="text-xs text-[#5C7A68] leading-relaxed mb-6">
                  Direct capital protection. By mapping expiry windows early, VIALA identifies candidate return batches, alternative markets, and tax write-off credits before inventory depreciates to zero.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t pt-4 border-[#F7F6F3]">
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Avg. Recovery</span>
                  <span className="text-base font-mono font-black text-[#059669]">82%</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Write-off Cut</span>
                  <span className="text-base font-mono font-black text-[#059669]">-91%</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Disposal Cost</span>
                  <span className="text-base font-mono font-black text-[#0B4D2E]">-12%</span>
                </div>
              </div>
            </div>

            {/* Card 2: Operational Impact */}
            <div className="bg-white border border-[#D9DDD5] rounded-3xl p-6 sm:p-8 hover:border-[#059669]/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#0D2B1A] mb-3">Operational Impact</h3>
                <p className="text-xs text-[#5C7A68] leading-relaxed mb-6">
                  Zero administrative friction. VIALA scans supplier return rules in the background, generates pre-filled return packing manifests, and creates audit-ready compliance logs without clinical intervention.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t pt-4 border-[#F7F6F3]">
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Audit Overhead</span>
                  <span className="text-base font-mono font-black text-blue-600">-85%</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Decision Speed</span>
                  <span className="text-base font-mono font-black text-blue-600">&lt;6 min</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Intake Sync</span>
                  <span className="text-base font-mono font-black text-blue-700">Auto</span>
                </div>
              </div>
            </div>

            {/* Card 3: Clinical Impact */}
            <div className="bg-white border border-[#D9DDD5] rounded-3xl p-6 sm:p-8 hover:border-[#059669]/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#0D2B1A] mb-3">Clinical Impact</h3>
                <p className="text-xs text-[#5C7A68] leading-relaxed mb-6">
                  Strengthening supply networks. Medicines that would traditionally sit idle are safely routed to other clinical nodes experiencing localized deficits, preserving treatment availability.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t pt-4 border-[#F7F6F3]">
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Units Utilized</span>
                  <span className="text-base font-mono font-black text-purple-600">18.5k+</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Availability</span>
                  <span className="text-base font-mono font-black text-purple-600">99.2%</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Shortage Alerts</span>
                  <span className="text-base font-mono font-black text-purple-700">Real-time</span>
                </div>
              </div>
            </div>

            {/* Card 4: Environmental Impact */}
            <div className="bg-white border border-[#D9DDD5] rounded-3xl p-6 sm:p-8 hover:border-[#059669]/20 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#0D2B1A] mb-3">Environmental Impact</h3>
                <p className="text-xs text-[#5C7A68] leading-relaxed mb-6">
                  Responsible lifecycle management. Preventing chemical waste incinerations and reducing redundant medicine manufacturing steps avoids ecological footprint load in public healthcare systems.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t pt-4 border-[#F7F6F3]">
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Waste Prevented</span>
                  <span className="text-base font-mono font-black text-emerald-600">12.4t</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">CO₂ Avoided</span>
                  <span className="text-base font-mono font-black text-emerald-600">48.2t</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block">Traceability</span>
                  <span className="text-base font-mono font-black text-emerald-700">100%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 4: ENVIRONMENTAL IMPACT (FLAGSHIP SECTION) ─── */}
      <section className="py-24 bg-white border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[1020px] mx-auto px-6">
          
          {/* Header */}
          <div className="text-center max-w-[680px] mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-100/50 font-mono mb-4">
              Sustainability Indicators
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D2B1A]">
              Waste Prevented. Value Preserved.
            </h2>
            <p className="mt-4 text-sm text-[#5C7A68] leading-relaxed">
              Reducing medicine waste does more than protect margins. It reduces disposal burden, improves resource utilization, and supports more sustainable healthcare operations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Side: Circular SVG Loop Flow */}
            <div className="lg:col-span-5 flex flex-col justify-center items-center p-8 bg-[#F7F6F3] border border-[#D9DDD5] rounded-3xl text-center shadow-sm">
              <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase bg-white border border-[#D9DDD5] px-2.5 py-1 rounded mb-6 tracking-widest">
                Resource Loop Flow
              </span>
              
              <div className="relative w-full flex justify-center py-2">
                <svg viewBox="0 0 360 360" className="w-full max-w-[280px] overflow-visible">
                  {/* Circular track */}
                  <circle cx="180" cy="180" r="100" fill="none" stroke="#E8E5DF" strokeWidth="2.5" />
                  
                  {/* Animated loop path (Emerald glow) */}
                  <circle 
                    cx="180" 
                    cy="180" 
                    r="100" 
                    fill="none" 
                    stroke="#059669" 
                    strokeWidth="3.5" 
                    strokeDasharray="60 140"
                    strokeDashoffset="0"
                    className="origin-center animate-[spin_10s_linear_infinite]"
                    style={{ transformOrigin: '180px 180px' }}
                  />

                  {/* Center VIALA Layer */}
                  <g transform="translate(180, 180)">
                    <circle r="46" fill="#0D2B1A" stroke="#059669" strokeWidth="2" />
                    <text textAnchor="middle" y="-2" className="text-[10px] font-black fill-white tracking-widest font-mono">VIALA</text>
                    <text textAnchor="middle" y="12" className="text-[8px] fill-[#34D399] font-bold uppercase tracking-widest font-mono">CIRCULAR</text>
                  </g>

                  {/* Outer Nodes with centered and correctly fitted icons */}
                  {/* Node 1: Top (Intake) */}
                  <g transform="translate(180, 80)">
                    <circle r="18" fill="#FFFFFF" stroke="#D9DDD5" strokeWidth="1.5" className="shadow-sm" />
                    <g transform="translate(-8, -8)">
                      <RefreshCw size={16} className="text-[#5C7A68]" />
                    </g>
                    <text textAnchor="middle" y="28" className="text-[8px] font-mono font-bold fill-[#0D2B1A] uppercase tracking-wider">Intake</text>
                  </g>

                  {/* Node 2: Right (Risk Scan) */}
                  <g transform="translate(280, 180)">
                    <circle r="18" fill="#FFFFFF" stroke="#D9DDD5" strokeWidth="1.5" className="shadow-sm" />
                    <g transform="translate(-8, -8)">
                      <Activity size={16} className="text-[#059669]" />
                    </g>
                    <text textAnchor="middle" y="28" className="text-[8px] font-mono font-bold fill-[#0D2B1A] uppercase tracking-wider">Scan</text>
                  </g>

                  {/* Node 3: Bottom (Divert) */}
                  <g transform="translate(180, 280)">
                    <circle r="18" fill="#FFFFFF" stroke="#D9DDD5" strokeWidth="1.5" className="shadow-sm" />
                    <g transform="translate(-8, -8)">
                      <Zap size={16} className="text-blue-600" />
                    </g>
                    <text textAnchor="middle" y="28" className="text-[8px] font-mono font-bold fill-[#0D2B1A] uppercase tracking-wider">Divert</text>
                  </g>

                  {/* Node 4: Left (Rescue) */}
                  <g transform="translate(80, 180)">
                    <circle r="18" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5" className="shadow-sm" />
                    <g transform="translate(-8, -8)">
                      <Leaf size={16} className="text-[#059669]" />
                    </g>
                    <text textAnchor="middle" y="28" className="text-[8px] font-mono font-bold fill-[#0D2B1A] uppercase tracking-wider">Rescue</text>
                  </g>

                  {/* Waste branch */}
                  <path d="M 180,280 C 180,310 240,320 280,320" fill="none" stroke="#FDA4AF" strokeWidth="1.5" strokeDasharray="3 3" />
                  <g transform="translate(280, 320)">
                    <circle r="10" fill="#FFF1F2" stroke="#F43F5E" strokeWidth="1" />
                    <text textAnchor="middle" y="16" className="text-[7px] font-bold fill-[#F43F5E] uppercase tracking-wider">Waste (&lt;18%)</text>
                  </g>
                </svg>
              </div>

              <div className="mt-6 text-xs text-[#5C7A68] leading-relaxed max-w-[280px]">
                Closing the loop on unused inventory yields an average network utilization rate of <span className="text-[#059669] font-bold">82%</span>.
              </div>
            </div>

            {/* Right Side: Grid of 4 Metric Blocks */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Box 1 */}
              <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-2xl p-5 text-left shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
                    <Leaf className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[8px] font-mono font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-100/50 px-2 py-0.5 rounded">
                    Indicator
                  </span>
                </div>
                <div className="text-2xl font-black text-[#0D2B1A] mb-1 font-mono">
                  <StatCounter value="12,400" /> kg
                </div>
                <h4 className="text-xs font-bold text-[#0D2B1A] mb-1">Biomedical Waste Prevented</h4>
                <p className="text-[11px] text-[#5C7A68] leading-relaxed">
                  Prevention of active chemical landfills, plastic medical packaging incinerations, and chemical runoff risks.
                </p>
              </div>

              {/* Box 2 */}
              <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-2xl p-5 text-left shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#059669] flex items-center justify-center">
                    <Check className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[8px] font-mono font-extrabold uppercase bg-[#EDF0EC] text-[#5C7A68] border border-[#D9DDD5] px-2 py-0.5 rounded">
                    Aggregated
                  </span>
                </div>
                <div className="text-2xl font-black text-[#0D2B1A] mb-1 font-mono">
                  <StatCounter value="18,500" /> units
                </div>
                <h4 className="text-xs font-bold text-[#0D2B1A] mb-1">Medicine Units Recovered</h4>
                <p className="text-[11px] text-[#5C7A68] leading-relaxed">
                  Avoidable expiry write-offs salvaged by matching surplus stocks with regional demands or distributor credits.
                </p>
              </div>

              {/* Box 3 */}
              <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-2xl p-5 text-left shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <RefreshCw className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[8px] font-mono font-extrabold uppercase bg-blue-50 text-blue-800 border border-blue-100/50 px-2 py-0.5 rounded">
                    Circular Actions
                  </span>
                </div>
                <div className="text-2xl font-black text-[#0D2B1A] mb-1 font-mono">
                  <StatCounter value="1,850" />+
                </div>
                <h4 className="text-xs font-bold text-[#0D2B1A] mb-1">Responsible Actions</h4>
                <p className="text-[11px] text-[#5C7A68] leading-relaxed">
                  Execution of CDSCO-compliant inter-branch routing, vendor credit claims, and non-profit donations.
                </p>
              </div>

              {/* Box 4 */}
              <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-2xl p-5 text-left shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[8px] font-mono font-extrabold uppercase bg-purple-50 text-purple-800 border border-purple-100/50 px-2 py-0.5 rounded">
                    Model Metric
                  </span>
                </div>
                <div className="text-2xl font-black text-[#0D2B1A] mb-1 font-mono">
                  <StatCounter value="82" />%
                </div>
                <h4 className="text-xs font-bold text-[#0D2B1A] mb-1">Resource Utilization Improved</h4>
                <p className="text-[11px] text-[#5C7A68] leading-relaxed">
                  Average rate of active inventory salvaged or repurposed back into the patient healthcare channel.
                </p>
              </div>

            </div>

          </div>

          <div className="text-center mt-12 pt-4 border-t border-[#F7F6F3]">
            <p className="text-[10px] text-[#5C7A68] italic max-w-[700px] mx-auto leading-relaxed">
              *Estimated Environmental Impact values are modeled based on average production footprints and waste reductions. Sustainability indicators represent estimated metrics derived from active client pilots.
            </p>
          </div>

        </div>
      </section>

      {/* ─── SECTION 5: MAKING EVERY MEDICINE MATTER ─── */}
      <section className="py-24 bg-[#FAF9F6] border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[900px] mx-auto px-6 text-center">
          <span className="text-[10px] font-mono font-bold text-[#059669] uppercase tracking-[0.2em] block mb-3 font-semibold">Our Philosophy</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D2B1A] tracking-tight">
            Every Medicine Deserves Its Best Possible Outcome.
          </h2>
          <p className="mt-4 text-sm text-[#5C7A68] max-w-[620px] mx-auto leading-relaxed">
            Not every medicine follows the same path. VIALA evaluates your inventory mix to route each surplus batch to its single highest-value and most appropriate outcome.
          </p>

          {/* Interactive Outward Tree Grid */}
          <div className="mt-16 bg-white border border-[#D9DDD5] rounded-3xl p-6 sm:p-10 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Output Tab Selection List (Left) */}
              <div className="lg:col-span-5 space-y-2">
                <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block mb-3">POSSIBLE OUTCOMES</span>
                {outcomes.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveOutcome(idx)}
                    className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                      activeOutcome === idx
                        ? 'bg-[#0D2B1A] border-[#0D2B1A] text-white shadow-sm'
                        : 'bg-[#F7F6F3] border-[#D9DDD5] text-[#5C7A68] hover:bg-[#EDF0EC]'
                    }`}
                  >
                    <span>{item.title}</span>
                    <span className="text-[9px] font-mono font-medium opacity-60">{item.action}</span>
                  </div>
                ))}
              </div>

              {/* Selected Output Details Panel (Right) */}
              <div className="lg:col-span-7 bg-[#F7F6F3] border border-[#D9DDD5] rounded-2xl p-6 sm:p-8 relative min-h-[220px] flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-mono font-black text-[#059669] uppercase tracking-widest block mb-2">Outcome Profile</span>
                  <h3 className="text-xl font-black text-[#0D2B1A] mb-4">
                    {outcomes[activeOutcome].title}
                  </h3>
                  <p className="text-xs text-[#5C7A68] leading-relaxed">
                    {outcomes[activeOutcome].desc}
                  </p>
                </div>
                <div className="pt-6 border-t border-[#D9DDD5] flex items-center justify-between text-[10px] font-mono font-bold text-[#5C7A68]">
                  <span>System Routing Trigger</span>
                  <span className="text-[#059669]">{outcomes[activeOutcome].action}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Highlight Quote */}
          <div className="mt-16 max-w-xl mx-auto text-center">
            <blockquote className="text-base sm:text-lg font-bold italic text-[#0D2B1A] leading-relaxed">
              &ldquo;VIALA is designed to ensure medicines have every reasonable opportunity to create value before becoming waste.&rdquo;
            </blockquote>
          </div>

        </div>
      </section>

      {/* ─── SECTION 6: ILLUSTRATIVE RECOVERY SCENARIOS ─── */}
      <section className="py-24 bg-white border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[1000px] mx-auto px-6 text-center">
          <span className="text-[10px] font-mono font-bold text-[#5C7A68] uppercase tracking-[0.2em] block mb-3">Operational Profiles</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D2B1A] tracking-tight">
            Illustrative Recovery Scenarios
          </h2>
          <p className="mt-3 text-sm text-[#5C7A68] max-w-[560px] mx-auto leading-relaxed">
            Hypothetical scenario structures reflecting value salvage across pharmacy retail and clinical procurement.
          </p>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            
            {/* Scenario A */}
            <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-black text-[#0D2B1A]">Scenario A: Retail Pharmacy Chain</h3>
                    <p className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider mt-1">Multi-Store Retail Store Model</p>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-[#059669] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                    Retail Context
                  </span>
                </div>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-[#0D2B1A] block mb-1">Problem</span>
                    <p className="text-[#5C7A68] leading-relaxed">
                      Scatter-purchased SKU lots sitting silently across 30+ stores. Expiry dates are caught manually, causing missed credit windows and waste.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-[#0D2B1A] block mb-1">Action</span>
                    <p className="text-[#5C7A68] leading-relaxed">
                      Enabled background inventory intake sync with the distributor return SLA scanner, tracking return schedules autonomously.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-[#0D2B1A] block mb-1">Outcome</span>
                    <p className="text-[#5C7A68] leading-relaxed">
                      Reclaimed ₹7,80,000 in credit recovery inside 6 months, reducing retail write-offs down from 5.8% to under 0.6%.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scenario B */}
            <div className="bg-[#F7F6F3] border border-[#D9DDD5] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-black text-[#0D2B1A]">Scenario B: Hospital Procurement Group</h3>
                    <p className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider mt-1">Clinical Multi-Specialty Network</p>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                    Clinical Context
                  </span>
                </div>
                
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-[#0D2B1A] block mb-1">Problem</span>
                    <p className="text-[#5C7A68] leading-relaxed">
                      Near-expiry buffer medicines wrote off in critical care nodes while other locations order the same items urgently.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-[#0D2B1A] block mb-1">Action</span>
                    <p className="text-[#5C7A68] leading-relaxed">
                      Deployed VIALA&apos;s cross-branch balancer to automatically highlight deficits and direct inventory transfers with hashed CDSCO Schedule M logs.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-[#0D2B1A] block mb-1">Outcome</span>
                    <p className="text-[#5C7A68] leading-relaxed">
                      Rescued 14,000+ units of active care stock, securing 100% audit-readiness and zero regulatory warnings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 7: FUTURE HEALTHCARE IMPACT ─── */}
      <section className="py-24 bg-[#F7F6F3] border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[900px] mx-auto px-6 text-center">
          <span className="text-[10px] font-mono font-bold text-[#5C7A68] uppercase tracking-[0.2em] block mb-3">Ecosystem Vision</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0D2B1A] tracking-tight">
            Building a More Efficient Medicine Ecosystem.
          </h2>
          <p className="mt-3 text-sm text-[#5C7A68] max-w-[560px] mx-auto leading-relaxed">
            The future of healthcare is not only about producing more medicines. It is about ensuring existing medicines create maximum value before becoming waste.
          </p>

          {/* Simple Ecosystem visual */}
          <div className="mt-16 p-8 bg-white border border-[#D9DDD5] rounded-3xl max-w-[800px] mx-auto">
            <span className="text-[8px] font-mono font-bold text-[#5C7A68] uppercase tracking-wider block mb-8">FUTURE ECOSYSTEM VISION</span>
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative">
              
              {/* Node 1 */}
              <div className="p-4 rounded-xl bg-[#F7F6F3] border border-[#D9DDD5] text-center w-full max-w-[160px]">
                <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase block mb-1">Node A</span>
                <span className="text-xs font-black text-[#0D2B1A]">Manufacturers</span>
              </div>
              <ArrowRight className="w-5 h-5 text-[#5C7A68] rotate-90 sm:rotate-0" />

              {/* Node 2 */}
              <div className="p-4 rounded-xl bg-[#F7F6F3] border border-[#D9DDD5] text-center w-full max-w-[160px]">
                <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase block mb-1">Node B</span>
                <span className="text-xs font-black text-[#0D2B1A]">Providers</span>
              </div>
              <ArrowRight className="w-5 h-5 text-[#5C7A68] rotate-90 sm:rotate-0" />

              {/* Node 3 (VIALA Core) */}
              <div className="p-4 rounded-xl bg-[#0D2B1A] text-white text-center w-full max-w-[160px] border border-[#059669] shadow-md animate-pulse">
                <span className="text-[9px] font-mono font-bold text-[#34D399] uppercase block mb-1">Hub</span>
                <span className="text-xs font-black">VIALA Engine</span>
              </div>
              <ArrowRight className="w-5 h-5 text-[#5C7A68] rotate-90 sm:rotate-0" />

              {/* Node 4 */}
              <div className="p-4 rounded-xl bg-[#F7F6F3] border border-[#D9DDD5] text-center w-full max-w-[160px]">
                <span className="text-[9px] font-mono font-bold text-[#5C7A68] uppercase block mb-1">Node C</span>
                <span className="text-xs font-black text-[#0D2B1A]">Rescued Value</span>
              </div>

            </div>

            {/* Vision Tags */}
            <div className="mt-12 flex flex-wrap justify-center gap-2.5">
              {[
                'Healthcare Networks', 'Hospital Collaboration', 'Responsible Redistribution',
                'Community Health Programs', 'NGO Partnerships', 'Medicine Recovery Networks'
              ].map((tag, idx) => (
                <span key={idx} className="text-[10px] font-bold text-[#0D2B1A] bg-[#F7F6F3] px-3.5 py-1.5 rounded-full border border-[#D9DDD5]">
                  {tag}
                </span>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 8: ROI CALCULATOR (CONVERSION TOOL) ─── */}
      <section id="roi-calculator" className="py-24 bg-[#F7F6F3] border-b border-[#D9DDD5]">
        <div className="container-tight max-w-[850px] mx-auto px-6">
          <div className="bg-[#0D2B1A] border border-[#153B25] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden text-left shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 text-center mb-10 border-b border-white/10 pb-6">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#34D399] bg-white/5 px-2.5 py-1 rounded-full border border-white/10 font-mono mb-2">
                Conversion Audit
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mb-2 text-white">Calculate Your Recovery ROI</h3>
              <p className="text-xs text-white/70">Project VIALA write-off savings for your clinical network.</p>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Sliders (Left) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <label className="flex justify-between text-xs font-bold text-white/70 mb-2.5 uppercase tracking-wider font-mono">
                    <span>Locations / Branches</span>
                    <span className="text-[#34D399] font-mono font-bold">{locations} Locations</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <Sliders className="w-4 h-4 text-white/40" />
                    <input
                      type="range" min="1" max="100" value={locations}
                      onChange={e => setLocations(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#34D399]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex justify-between text-xs font-bold text-white/70 mb-2.5 uppercase tracking-wider font-mono">
                    <span>Average Monthly Inventory Value (per location)</span>
                    <span className="text-[#34D399] font-mono font-bold">₹{(inventoryValue/100000).toFixed(0)} Lakhs</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <Coins className="w-4 h-4 text-white/40" />
                    <input
                      type="range" min="100000" max="10000000" step="100000" value={inventoryValue}
                      onChange={e => setInventoryValue(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#34D399]"
                    />
                  </div>
                </div>
              </div>

              {/* Outputs glassmorphism card (Right) */}
              <div className="lg:col-span-5 bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between min-h-[220px]">
                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#34D399] uppercase tracking-wider block">Potential Recovery Value</span>
                    <span className="text-2xl font-mono font-black text-white">₹{(potentialRecoveryValue/100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#34D399] uppercase tracking-wider block">Waste Reduction Rate</span>
                    <span className="text-2xl font-mono font-black text-white">~91%</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#34D399] uppercase tracking-wider block">Projected ROI</span>
                    <span className="text-2xl font-mono font-black text-[#34D399]">8x - 12x</span>
                  </div>
                </div>
                <Link href="/get-started" className="w-full py-3 mt-4 rounded-xl bg-[#34D399] hover:bg-emerald-400 text-[#0D2B1A] text-xs font-bold shadow-md transition-colors text-center block">
                  Request Complete Audit
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: FINAL CTA ─── */}
      <section className="py-28 bg-[#0B4D2E] text-white relative overflow-hidden text-center font-jakarta">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-[#0D2B1A] to-[#0D2B1A] pointer-events-none" />
        
        {/* Properly aligned, very subtle glowing watermark statistics in background */}
        <div className="absolute top-8 left-8 opacity-[0.03] select-none font-black text-5xl sm:text-6xl md:text-7xl font-mono tracking-tighter text-white pointer-events-none hidden lg:block">
          82% Circular
        </div>
        <div className="absolute bottom-8 right-8 opacity-[0.03] select-none font-black text-5xl sm:text-6xl md:text-7xl font-mono tracking-tighter text-white pointer-events-none hidden lg:block">
          94% Saved
        </div>

        <div className="container-tight relative z-10 max-w-[660px] mx-auto px-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#34D399] bg-white/5 px-3 py-1 rounded-full border border-white/10 font-mono mb-6">
            Get Assessment
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
            Stop Writing Off Medicine Value.<br />
            Start Recovering It.
          </h2>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed mt-6 max-w-[500px] mx-auto">
            Discover how much recoverable value may already exist across your inventory network.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/get-started" className="btn-accent justify-center px-8 py-3.5 shadow-lg w-full sm:w-auto">
              Request Impact Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/get-started" className="btn-secondary text-white border-white/20 hover:border-white/50 hover:bg-white/5 justify-center px-8 py-3.5 w-full sm:w-auto">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
