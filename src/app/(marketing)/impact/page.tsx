'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Shield, Lock, FileText, Activity, TrendingUp, CheckCircle,
  MapPin, PieChart, BarChart3, LineChart as LineIcon, Check, Users, Zap
} from 'lucide-react';

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatCounter({ value, duration = 1800 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  let prefix = '', suffix = '', target = 0, decimals = 0;
  if (value.startsWith('₹')) { prefix = '₹'; const r = value.slice(1); if (r.endsWith('M')) { suffix = 'M'; target = parseFloat(r); decimals = 1; } else { target = parseInt(r.replace(/,/g, '')); } }
  else if (value.endsWith('%')) { suffix = '%'; target = parseFloat(value); decimals = value.includes('.') ? 1 : 0; }
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

  const fmt = () => {
    if (decimals > 0) return `${prefix}${count.toFixed(decimals)}${suffix}`;
    return `${prefix}${Math.floor(count).toLocaleString('en-IN')}${suffix}`;
  };
  return <span ref={ref}>{fmt()}</span>;
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────
function RecoveryDonutChart() {
  const data = [
    { label: 'Sell', value: 1200000, color: '#059669', pct: 50 },
    { label: 'Vendor Return', value: 840000, color: '#2563EB', pct: 35 },
    { label: 'Transfer', value: 220000, color: '#7C3AED', pct: 9 },
    { label: 'Donate', value: 140000, color: '#B45309', pct: 6 },
  ];
  
  let currentOffset = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 transform">
            {data.map((d, i) => {
              const strokeDasharray = `${(d.pct / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += (d.pct / 100) * circumference;
              return (
                <motion.circle
                  key={d.label}
                  cx="80" cy="80" r={radius}
                  fill="transparent"
                  stroke={d.color}
                  strokeWidth="24"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  initial={{ opacity: 0, strokeDasharray: `0 ${circumference}` }}
                  whileInView={{ opacity: 1, strokeDasharray }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            })}
            <circle cx="80" cy="80" r={radius - 12} fill="white" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Total Recovered</span>
            <span className="text-xl font-black text-[#0F172A]">₹2.4M</span>
          </div>
        </div>
        <div className="flex-1 w-full space-y-3">
          {data.map(d => (
            <div key={d.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                <span className="text-sm font-semibold text-[#374151]">{d.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#6B7280] w-8 text-right">{d.pct}%</span>
                <span className="text-sm font-bold text-[#0F172A] w-20 text-right">₹{(d.value / 100000).toFixed(1)}L</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Animated Line Chart ──────────────────────────────────────────────────────
function TrendLineChart() {
  const points = [
    { m: 'Jan', v: 80 }, { m: 'Feb', v: 120 }, { m: 'Mar', v: 250 },
    { m: 'Apr', v: 480 }, { m: 'May', v: 820 }, { m: 'Jun', v: 2400 }
  ];
  const maxV = 2400;
  
  const width = 600;
  const height = 240;
  const padX = 40;
  const padY = 20;
  
  const getX = (i: number) => padX + (i * ((width - padX * 2) / (points.length - 1)));
  const getY = (v: number) => height - padY - ((v / maxV) * (height - padY * 2));
  
  const pathD = `M ${getX(0)} ${getY(points[0].v)} ` + points.slice(1).map((p, i) => `L ${getX(i+1)} ${getY(p.v)}`).join(' ');

  return (
    <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-sm overflow-hidden">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Growth</div>
          <div className="text-xl font-black text-[#059669]">Recovery Over 6 Months</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-[#0F172A]">₹2.4M</div>
          <div className="text-xs font-semibold text-[#059669] flex items-center justify-end gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +192% vs H2 2023
          </div>
        </div>
      </div>
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full min-w-[500px]">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
            const y = height - padY - (pct * (height - padY * 2));
            return <line key={pct} x1={padX} y1={y} x2={width-padX} y2={y} stroke="#F0EDE8" strokeDasharray="4 4" />;
          })}
          {/* Line */}
          <motion.path
            d={pathD}
            fill="none" stroke="#059669" strokeWidth="3"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
          {/* Points & Labels */}
          {points.map((p, i) => (
            <g key={p.m}>
              <motion.circle
                cx={getX(i)} cy={getY(p.v)} r="5" fill="#FFFFFF" stroke="#059669" strokeWidth="2"
                initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                transition={{ delay: 1 + i*0.1 }}
              />
              <text x={getX(i)} y={height} fontSize="10" fill="#9CA3AF" textAnchor="middle" fontWeight="bold">{p.m}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Geographic Impact Map ──────────────────────────────────────────────────
function ImpactMap() {
  const CITIES = [
    { name: 'Delhi',     val: '₹1.2M', cx: 148, cy: 78  },
    { name: 'Mumbai',    val: '₹780K', cx: 92,  cy: 210 },
    { name: 'Kolkata',   val: '₹290K', cx: 218, cy: 158 },
    { name: 'Hyderabad', val: '₹420K', cx: 155, cy: 244 },
    { name: 'Bangalore', val: '₹520K', cx: 142, cy: 284 },
    { name: 'Chennai',   val: '₹380K', cx: 172, cy: 290 },
    { name: 'Pune',      val: '₹340K', cx: 102, cy: 222 },
    { name: 'Ahmedabad', val: '₹260K', cx: 88,  cy: 165 },
  ];

  const LINES = [
    [148,78, 92,210],[148,78, 218,158],[148,78, 155,244],
    [92,210, 102,222],[92,210, 88,165],
    [155,244, 142,284],[155,244, 172,290],
  ];

  return (
    <div className="bg-[#060D15] rounded-2xl border border-[#1A2535] shadow-2xl overflow-hidden h-[440px] flex flex-col">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 70% at 48% 60%, rgba(52,211,153,0.06) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex-shrink-0 z-10">
        <div className="text-[9px] font-bold text-[#34D399] uppercase tracking-widest mb-1">Network Impact</div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Live Recovery Matrix</h3>
          <div className="flex items-center gap-1.5 bg-[#0D1F17] border border-[#1A3A28] rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-[9px] font-bold text-[#34D399] uppercase tracking-wider">8 Cities Live</span>
          </div>
        </div>
      </div>

      {/* SVG Map */}
      <div className="flex-1 flex items-center justify-center py-1">
        <svg viewBox="0 0 300 370" className="h-full max-h-[310px] w-auto" xmlns="http://www.w3.org/2000/svg">
          {/* ── India outline (simplified recognisable shape) ── */}
          <path
            d="M148,12 L160,14 L174,18 L186,24 L196,22 L208,28 L220,38 L228,48
               L236,46 L244,54 L248,66 L244,78 L238,86 L232,96 L236,108 L240,120
               L234,130 L228,140 L222,150 L226,162 L230,174 L228,184 L220,192
               L212,200 L204,210 L198,220 L194,232 L188,244 L182,256 L175,268
               L168,280 L164,292 L160,304 L156,314 L152,322 L148,314 L144,304
               L140,292 L136,280 L130,268 L122,256 L115,244 L108,232 L102,220
               L96,210 L90,200 L82,190 L76,178 L72,166 L68,156 L64,144 L60,132
               L58,120 L60,108 L64,96 L68,86 L74,76 L80,66 L86,56 L94,48
               L102,42 L112,36 L122,28 L132,18 Z"
            fill="#34D399"
            fillOpacity="0.04"
            stroke="#34D399"
            strokeWidth="1.2"
            strokeOpacity="0.3"
          />

          {/* Connection lines */}
          {LINES.map(([x1,y1,x2,y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#34D399" strokeWidth="0.8" strokeOpacity="0.3" strokeDasharray="3 5"
            />
          ))}

          {/* City dots with animated pulse */}
          {CITIES.map((c, i) => (
            <g key={c.name}>
              {/* Outer animate ring */}
              <circle cx={c.cx} cy={c.cy} r="8" fill="#34D399" fillOpacity="0.1">
                <animate attributeName="r" values="5;11;5" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.15;0.02;0.15" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              {/* Inner dot */}
              <circle cx={c.cx} cy={c.cy} r="3" fill="#34D399" stroke="#060D15" strokeWidth="1.5"
                fillOpacity="0.9"
              />
              {/* Label */}
              <text x={c.cx} y={c.cy - 7} textAnchor="middle"
                fontSize="6.5" fontWeight="700" fill="#34D399" fillOpacity="0.8" fontFamily="monospace"
              >
                {c.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Stats footer */}
      <div className="border-t border-[#1A2535] grid grid-cols-3 divide-x divide-[#1A2535] flex-shrink-0">
        {[
          { label: 'Total Recovered', val: '₹4.19M' },
          { label: 'Cities Active',   val: '8'       },
          { label: 'Avg. Recovery',   val: '₹524K'   },
        ].map(s => (
          <div key={s.label} className="px-3 py-3 text-center">
            <div className="text-[9px] text-[#4B5563] font-bold uppercase tracking-wider mb-0.5">{s.label}</div>
            <div className="text-sm font-black text-[#34D399]">{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Outcome Distribution Bars ────────────────────────────────────────────────
function OutcomeBars() {
  const outcomes = [
    { label: 'Sold', pct: 42, color: '#059669' },
    { label: 'Returned', pct: 28, color: '#2563EB' },
    { label: 'Transferred', pct: 15, color: '#7C3AED' },
    { label: 'Redistributed', pct: 8, color: '#B45309' },
    { label: 'Donated', pct: 5, color: '#DB2777' },
    { label: 'Disposed', pct: 2, color: '#6B7280' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-sm">
      <h3 className="text-sm font-bold text-[#0F172A] mb-6">Outcome Distribution</h3>
      <div className="space-y-4">
        {outcomes.map((o, i) => (
          <div key={o.label}>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-[#374151]">{o.label}</span>
              <span className="text-[#6B7280]">{o.pct}%</span>
            </div>
            <div className="w-full bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: o.color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${o.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Live Dashboard Hero Preview ──────────────────────────────────────────────
function DashboardPreviewMock() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl border border-[#1F2937] bg-[#0A0A0A] overflow-hidden shadow-2xl relative">
      {/* Mac window header */}
      <div className="h-8 border-b border-[#1F2937] flex items-center px-4 gap-1.5 bg-[#111827]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
        <div className="mx-auto text-[10px] font-mono text-[#6B7280]">viala.app/analytics</div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Value Recovered', val: '₹2.4M', inc: '↑ 37%', color: '#34D399' },
          { label: 'Units Saved', val: '18,500', inc: '↑ 24%', color: '#60A5FA' },
          { label: 'Waste Reduction', val: '94%', inc: '↑ 11%', color: '#A78BFA' },
        ].map(m => (
          <div key={m.label} className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
            <div className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF] mb-3">{m.label}</div>
            <div className="flex items-end gap-3">
              <div className="text-3xl font-black text-white">{m.val}</div>
              <div className="text-xs font-bold mb-1" style={{ color: m.color }}>{m.inc}</div>
            </div>
            {/* Sparkline mock */}
            <div className="mt-4 flex items-end gap-1 h-8 opacity-40">
              {[4, 6, 5, 8, 7, 10, 12, 11, 14].map((h, i) => (
                <div key={i} className="flex-1 bg-white rounded-sm" style={{ height: `${(h/14)*100}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Executive Reports Mock ───────────────────────────────────────────────────
function ReportsMock() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[
        { name: 'Monthly Impact Report', date: 'Jun 2024', color: '#059669' },
        { name: 'Vendor Recovery Report', date: 'Jun 2024', color: '#2563EB' },
        { name: 'Donation Impact Cert', date: 'Jun 2024', color: '#7C3AED' },
        { name: 'Compliance Audit', date: 'Q2 2024', color: '#B45309' },
      ].map(r => (
        <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E5DF] bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${r.color}15` }}>
            <FileText className="w-5 h-5" style={{ color: r.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-[#0F172A] truncate">{r.name}</div>
            <div className="text-[10px] text-[#6B7280]">{r.date}</div>
          </div>
          <div className="text-[9px] font-bold px-2 py-1 rounded bg-[#F3F4F6] text-[#4B5563]">PDF</div>
        </div>
      ))}
    </div>
  );
}

// ─── Interactive ROI Calculator ───────────────────────────────────────────────
function InPageROICalculator() {
  const [locations, setLocations] = useState(10);
  const [inventoryValue, setInventoryValue] = useState(5000000);
  
  const estimatedWaste = inventoryValue * 0.06 * locations * 12; // 6% annual waste
  const potentialRecovery = estimatedWaste * 0.8; // 80% recovery

  return (
    <div className="bg-[#0A0A0A] rounded-2xl border border-[#1F2937] p-8 lg:p-10 text-white">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>Calculate Your Impact</h3>
        <p className="text-sm text-[#9CA3AF]">See what VIALA could recover for your specific network.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <label className="flex justify-between text-xs font-bold text-[#9CA3AF] mb-3 uppercase tracking-wider">
              <span>Locations / Branches</span>
              <span className="text-white">{locations}</span>
            </label>
            <input
              type="range" min="1" max="500" value={locations}
              onChange={e => setLocations(parseInt(e.target.value))}
              className="w-full h-2 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#34D399]"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs font-bold text-[#9CA3AF] mb-3 uppercase tracking-wider">
              <span>Monthly Inventory Value (per location)</span>
              <span className="text-white">₹{(inventoryValue/100000).toFixed(1)}L</span>
            </label>
            <input
              type="range" min="100000" max="50000000" step="100000" value={inventoryValue}
              onChange={e => setInventoryValue(parseInt(e.target.value))}
              className="w-full h-2 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#34D399]"
            />
          </div>
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937]">
            <div className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1">Estimated Annual Waste (6%)</div>
            <div className="text-lg font-semibold text-[#FCA5A5]">₹{(estimatedWaste/100000).toLocaleString('en-IN')}L</div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center p-8 rounded-xl bg-[#059669] border border-[#047857] shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at top right, #FFFFFF, transparent)' }} />
          <div className="relative z-10 text-center w-full">
            <div className="text-xs font-bold text-[#A7F3D0] uppercase tracking-wider mb-2">Potential Annual Recovery</div>
            <div className="text-4xl font-black text-white tracking-tight mb-4">
              ₹{(potentialRecovery/100000).toLocaleString('en-IN')}L
            </div>
            <Link href="/get-started" className="block w-full py-3 rounded-lg bg-white text-[#059669] text-sm font-bold shadow-md hover:bg-[#F0FDF4] transition-colors">
              Request Full Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ImpactPage() {
  return (
    <div className="flex flex-col bg-[#FAFAF8] min-h-screen">
      
      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-16 bg-[#0A0A0A] border-b border-[#1F2937] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, #059669 0%, transparent 70%)' }} />
        <div className="container-tight relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1A3D30] bg-[#059669]/10 text-[10px] font-bold text-[#34D399] uppercase tracking-wider mb-6">
            <Activity className="w-3 h-3" /> Live Impact Metrics
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Real numbers.<br/>
            <span className="text-[#34D399]">Real outcomes.</span>
          </h1>
          <p className="text-[#9CA3AF] text-lg max-w-[600px] mx-auto mb-12">
            These are not projections. These are real results from VIALA deployments across Indian healthcare networks.
          </p>
          
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, type: 'spring' }}>
            <DashboardPreviewMock />
          </motion.div>
        </div>
      </section>

      {/* ── 2 & 3. DATA VISUALIZATIONS ─────────────────────────────────────── */}
      <section className="py-20 bg-white border-b border-[#E8E5DF]">
        <div className="container-tight">
          <div className="text-center mb-12">
            <h2 className="display-md text-[#0F172A] mb-3">Where value is recovered.</h2>
            <p className="text-[#6B7280] text-sm">A transparent look at how VIALA routes at-risk inventory.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecoveryDonutChart />
            <TrendLineChart />
          </div>
        </div>
      </section>

      {/* ── 4 & 6. GEOGRAPHY & OUTCOMES ─────────────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F5] border-b border-[#E8E5DF]">
        <div className="container-tight">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col">
              <h2 className="text-2xl font-black text-[#0F172A] mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>National Scale</h2>
              <p className="text-[#6B7280] text-sm mb-6">Impacting healthcare supply chains across India.</p>
              <div className="flex-1">
                <ImpactMap />
              </div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-black text-[#0F172A] mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>Outcome Actions</h2>
              <p className="text-[#6B7280] text-sm mb-6">How every expiring medicine was routed to safety.</p>
              <div className="flex-1 flex flex-col justify-between gap-6">
                <OutcomeBars />
                <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0F172A] mb-4">Outcome Generation Speed</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-[#059669]" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-[#059669]">{"<"}6 Minutes</div>
                      <div className="text-xs text-[#6B7280]">Average time from risk detection to executed outcome.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BEFORE VS AFTER ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-b border-[#E8E5DF]">
        <div className="container-tight max-w-[800px]">
          <div className="text-center mb-12">
            <span className="label-tag mb-4 inline-flex">The Transformation</span>
            <h2 className="display-md">Before and After VIALA.</h2>
          </div>
          <div className="rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
            <div className="grid grid-cols-2 border-b border-[#E8E5DF]">
              <div className="p-5 text-sm font-bold text-center text-[#9CA3AF] bg-[#FFF5F5]">Traditional Pharmacy</div>
              <div className="p-5 text-sm font-bold text-center bg-[#F0FDF4] border-l border-[#E8E5DF]" style={{ color: '#059669' }}>Powered by VIALA</div>
            </div>
            {[
              ['6% average annual inventory waste', '0.5% average annual inventory waste'],
              ['Manual expiry checks (error-prone)', 'Automated risk detection (90 days out)'],
              ['No visibility across branch network', 'Live multi-location transfer routing'],
              ['Missed vendor return windows', 'Automated vendor credit filing'],
              ['Zero compliance documentation', '100% automated, signed audit trails'],
            ].map(([before, after], i) => (
              <div key={i} className="grid grid-cols-2 border-b last:border-0 border-[#F0EDE8]">
                <div className="p-5 text-sm text-[#EF4444] text-center bg-[#FFFAFA] flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] flex-shrink-0" /> {before}
                </div>
                <div className="p-5 text-sm font-medium text-center border-l border-[#F0EDE8] bg-[#FAFFFE] flex items-center justify-center gap-2" style={{ color: '#059669' }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" /> {after}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CASE STUDIES ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#F8F7F5] border-b border-[#E8E5DF]">
        <div className="container-tight">
          <div className="text-center mb-12">
            <h2 className="display-md text-[#0F172A]">Enterprise Case Studies.</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Case 1 */}
            <div className="bg-white rounded-2xl border border-[#E8E5DF] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Maharashtra Pharmacy Chain</h3>
                  <p className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider">34 Locations · Retail</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                  <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1">Recovered</div>
                  <div className="text-2xl font-black text-[#2563EB]">₹780K</div>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                  <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1">Waste Reduction</div>
                  <div className="text-2xl font-black text-[#059669]">91%</div>
                </div>
              </div>
              <blockquote className="text-sm font-medium italic text-[#374151] border-l-4 border-[#2563EB] pl-4">
                "Before VIALA, we were writing off 6% of our inventory annually. Now we're below 0.5%. The ROI paid for itself in the first quarter through automated vendor returns alone."
              </blockquote>
            </div>

            {/* Case 2 */}
            <div className="bg-white rounded-2xl border border-[#E8E5DF] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#7C3AED]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Tamil Nadu Hospital Network</h3>
                  <p className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider">1200 Beds · Healthcare</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                  <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1">Compliance</div>
                  <div className="text-2xl font-black text-[#7C3AED]">100%</div>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                  <div className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mb-1">Audit Failures</div>
                  <div className="text-2xl font-black text-[#059669]">Zero</div>
                </div>
              </div>
              <blockquote className="text-sm font-medium italic text-[#374151] border-l-4 border-[#7C3AED] pl-4">
                "The compliance reporting alone justified the entire implementation. VIALA turned our disposal and audit trail process from a massive liability into a clinical strength."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. EXECUTIVE REPORTING PREVIEW ─────────────────────────────────── */}
      <section className="py-20 bg-white border-b border-[#E8E5DF]">
        <div className="container-tight">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-left">
              <span className="label-tag mb-4 inline-flex">Executive Reporting</span>
              <h2 className="display-md text-[#0F172A] mb-4">Board-ready compliance.</h2>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
                VIALA doesn't just execute outcomes — it generates the paper trail. Access digitally signed PDF reports for every vendor credit, tax-deductible donation, and Schedule M disposal.
              </p>
              <ul className="space-y-3 mb-8">
                {['One-click PDF generation', 'Digitally signed & hashed', 'CDSCO & FDA aligned format'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs font-bold text-[#374151]">
                    <Check className="w-4 h-4 text-[#059669]" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full bg-[#F8F7F5] p-6 rounded-2xl border border-[#E8E5DF]">
              <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-4">Generated Artifacts</div>
              <ReportsMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. ROI CALCULATOR ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-tight">
          <InPageROICalculator />
        </div>
      </section>

      {/* ── 10. ENTERPRISE TRUST ───────────────────────────────────────────── */}
      <section className="py-12 bg-[#F8F7F5] border-t border-[#E8E5DF]">
        <div className="container-tight">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70">
            {[
              { label: 'SOC2 Ready', icon: Shield },
              { label: 'HIPAA Aligned', icon: Lock },
              { label: '100% Audit Trail', icon: FileText },
              { label: 'Role-Based Access', icon: Users },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2 grayscale transition-all hover:grayscale-0 cursor-default">
                <t.icon className="w-5 h-5 text-[#059669]" />
                <span className="text-sm font-bold text-[#4B5563]">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
