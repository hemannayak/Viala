'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ScanLine, Brain, Zap, Flag, BarChart3,
  CheckCircle, ChevronRight, Shield, Lock, Users,
  TrendingUp, RotateCcw, Package, Heart, Trash2,
  AlertTriangle, Clock, FileText, ArrowUpRight, Activity
} from 'lucide-react';

// ─── Animated counter on scroll ───────────────────────────────────────────────
function StatCounter({ value, duration = 1800 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  let prefix = '', suffix = '', target = 0, decimals = 0;
  if (value.startsWith('₹')) { prefix = '₹'; const r = value.slice(1); if (r.endsWith('M+')) { suffix = 'M+'; target = parseFloat(r); decimals = 1; } else { target = parseInt(r.replace(/,/g, '')); } }
  else if (value.endsWith('%')) { suffix = '%'; target = parseInt(value); }
  else if (value.endsWith(' min')) { suffix = ' min'; target = parseInt(value); }
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

// ─── Step 1 mock: Intake & Scan ────────────────────────────────────────────────
function IntakeMock() {
  return (
    <div className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden text-left shadow-sm text-xs">
      <div className="bg-[#F8FFF8] border-b border-[#D1FAE5] px-4 py-2.5 flex items-center justify-between">
        <span className="font-mono text-[10px] text-[#059669] font-bold">viala.app/intake/scan</span>
        <span className="bg-[#D1FAE5] text-[#065F46] text-[9px] font-bold px-2 py-0.5 rounded-full">● SCANNING</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-[#F0FDF4] border border-[#A7F3D0] rounded-lg p-3 flex items-center gap-3">
          <ScanLine className="w-5 h-5 text-[#059669] flex-shrink-0" />
          <div>
            <div className="text-[9px] text-[#6B7280] uppercase tracking-wider mb-0.5">Batch Detected</div>
            <div className="font-black text-[#059669] font-mono">AMX-2024-453 ✓</div>
          </div>
        </div>
        {[
          ['Medicine', 'Amoxicillin 500mg'],
          ['Expiry Date', '15 Nov 2024 · 45 days'],
          ['Quantity', '240 units'],
          ['Branch', 'Mumbai Central'],
          ['Vendor', 'Cipla Ltd'],
          ['Cost Price', '₹1,20,000'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between items-center py-1.5 border-b border-[#F0EDE8] last:border-0">
            <span className="text-[#9CA3AF] text-[10px] font-medium">{k}</span>
            <span className="font-semibold text-[#0F172A] text-[11px]">{v}</span>
          </div>
        ))}
        <div className="mt-3 bg-[#059669] text-white rounded-lg py-2 text-center text-[10px] font-bold tracking-wide">
          ✓ Registered in Lifecycle Engine — 4s
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 mock: Lifecycle Engine ────────────────────────────────────────────
const HEATMAP = [
  { name: 'Amoxicillin', branches: ['safe','safe','monitor','critical'] },
  { name: 'Metformin', branches: ['safe','monitor','at-risk','monitor'] },
  { name: 'Lisinopril', branches: ['safe','safe','safe','monitor'] },
  { name: 'Dolo 650', branches: ['monitor','at-risk','critical','at-risk'] },
  { name: 'Azithromycin', branches: ['safe','safe','monitor','safe'] },
];
const CELL: Record<string, { bg: string; text: string; label: string }> = {
  safe:     { bg: '#D1FAE5', text: '#065F46', label: 'Safe' },
  monitor:  { bg: '#FEF3C7', text: '#92400E', label: 'Monitor' },
  'at-risk':{ bg: '#FED7AA', text: '#9A3412', label: 'At Risk' },
  critical: { bg: '#FEE2E2', text: '#991B1B', label: 'Critical' },
};
function LifecycleMock() {
  return (
    <div className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden text-left shadow-sm">
      <div className="bg-[#EFF6FF] border-b border-[#BFDBFE] px-4 py-2.5 flex items-center justify-between">
        <span className="font-mono text-[10px] text-[#2563EB] font-bold">viala.app/lifecycle/heatmap</span>
        <span className="bg-[#DBEAFE] text-[#1E40AF] text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>
      </div>
      <div className="p-4">
        <div className="text-[9px] uppercase tracking-wider font-bold text-[#9CA3AF] mb-2">Risk Heatmap — Branches</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[9px]">
            <thead>
              <tr>
                <th className="text-left pb-1.5 text-[#9CA3AF] font-medium pr-3">Medicine</th>
                {['Mumbai','Delhi','Pune','Chennai'].map(b => (
                  <th key={b} className="text-center pb-1.5 text-[#9CA3AF] font-medium px-1">{b}</th>
                ))}
              </tr>
            </thead>
            <tbody className="space-y-1">
              {HEATMAP.map(row => (
                <tr key={row.name}>
                  <td className="pr-3 py-1 font-medium text-[#374151] text-[10px] whitespace-nowrap">{row.name}</td>
                  {row.branches.map((status, j) => (
                    <td key={j} className="px-1 py-1 text-center">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[8px] font-bold"
                        style={{ background: CELL[status].bg, color: CELL[status].text }}
                      >
                        {CELL[status].label}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
          {[['Safe','#059669','1,240'],['Monitor','#B45309','486'],['At Risk','#EA580C','248'],['Critical','#DC2626','82']].map(([l,c,v]) => (
            <div key={l} className="rounded p-1.5" style={{ background: `${c}10` }}>
              <div className="font-black text-sm" style={{ color: c }}>{v}</div>
              <div className="text-[8px] text-[#9CA3AF]">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 mock: Decision Engine ─────────────────────────────────────────────
const OUTCOMES_DE = [
  { key: 'sell', label: 'Sell', icon: TrendingUp, available: false, value: null },
  { key: 'return', label: 'Return to Vendor', icon: RotateCcw, available: true, value: '₹96,000', recommended: true },
  { key: 'transfer', label: 'Transfer', icon: Package, available: true, value: '₹84,000' },
  { key: 'donate', label: 'Donate', icon: Heart, available: true, value: 'Tax benefit' },
  { key: 'dispose', label: 'Dispose', icon: Trash2, available: false, value: null },
];
function DecisionMock() {
  const [selected, setSelected] = useState('return');
  return (
    <div className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden text-left shadow-sm">
      <div className="bg-[#F5F3FF] border-b border-[#DDD6FE] px-4 py-2.5 flex items-center justify-between">
        <span className="font-mono text-[10px] text-[#7C3AED] font-bold">viala.app/decision-engine</span>
        <span className="bg-[#EDE9FE] text-[#5B21B6] text-[9px] font-bold px-2 py-0.5 rounded-full">Batch AMX-453</span>
      </div>
      <div className="p-4">
        <div className="text-[9px] uppercase tracking-wider font-bold text-[#9CA3AF] mb-2">Outcome Evaluation</div>
        <div className="space-y-1.5 mb-4">
          {OUTCOMES_DE.map(o => (
            <button
              key={o.key}
              onClick={() => o.available && setSelected(o.key)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all text-xs"
              style={{
                borderColor: selected === o.key ? '#7C3AED' : o.recommended ? '#DDD6FE' : '#F0EDE8',
                background: selected === o.key ? '#F5F3FF' : '#FAFAF8',
                opacity: o.available ? 1 : 0.4,
              }}
            >
              <o.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: selected === o.key ? '#7C3AED' : '#9CA3AF' }} />
              <span className="flex-1 font-medium text-[#374151]">{o.label}</span>
              {o.recommended && <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#7C3AED] text-white">RECOMMENDED</span>}
              {o.value && <span className="text-[10px] font-bold text-[#059669]">{o.value}</span>}
              {!o.available && <span className="text-[8px] text-[#D1D5DB]">N/A</span>}
            </button>
          ))}
        </div>
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-lg p-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-[#5B21B6]">Confidence Score</span>
            <span className="text-base font-black text-[#7C3AED]">96%</span>
          </div>
          <div className="w-full bg-[#EDE9FE] h-1.5 rounded-full">
            <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: '96%' }} />
          </div>
          <div className="text-[9px] text-[#6B7280] mt-1.5">Vendor window open · 18 days remaining · Credit: ₹96,000</div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 mock: Mission Control ─────────────────────────────────────────────
const ACTIONS = [
  { type: 'Transfer', label: 'Transfer 12 SKUs', detail: 'Mumbai → Delhi · ₹84,000', priority: 'urgent', color: '#7C3AED' },
  { type: 'Return', label: 'Return 4 SKUs to Cipla', detail: 'Window closes in 18 days · ₹96,000', priority: 'today', color: '#2563EB' },
  { type: 'Donate', label: 'Donate 2 SKUs', detail: 'HelpAge India · 640 patients', priority: 'today', color: '#DB2777' },
  { type: 'Scan', label: 'Register incoming batch', detail: 'Metformin 850mg · 500 units', priority: 'scheduled', color: '#059669' },
];
function MissionControlMock() {
  return (
    <div className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden text-left shadow-sm">
      <div className="bg-[#FFFBEB] border-b border-[#FDE68A] px-4 py-2.5 flex items-center justify-between">
        <span className="font-mono text-[10px] text-[#B45309] font-bold">viala.app/mission-control</span>
        <span className="bg-[#FEF3C7] text-[#92400E] text-[9px] font-bold px-2 py-0.5 rounded-full">24 Actions Pending</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[['₹1.8M','Recovery Today','#059669'],['6','Urgent','#DC2626'],['18','Due Today','#B45309']].map(([v,l,c]) => (
            <div key={l} className="text-center p-2 rounded-lg bg-[#FAFAF8] border border-[#E8E5DF]">
              <div className="font-black text-lg leading-none" style={{ color: c }}>{v}</div>
              <div className="text-[9px] text-[#9CA3AF] mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        <div className="text-[9px] uppercase tracking-wider font-bold text-[#9CA3AF] mb-2">Action Queue</div>
        <div className="space-y-2">
          {ACTIONS.map(a => (
            <div key={a.label} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#F0EDE8] bg-[#FAFAF8]">
              <span
                className="text-[8px] font-black px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                style={{
                  background: a.priority === 'urgent' ? '#FEE2E2' : a.priority === 'today' ? '#FEF3C7' : '#F3F4F6',
                  color: a.priority === 'urgent' ? '#DC2626' : a.priority === 'today' ? '#B45309' : '#6B7280',
                }}
              >
                {a.priority.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-[#0F172A]">{a.label}</div>
                <div className="text-[9px] text-[#6B7280]">{a.detail}</div>
              </div>
              <button className="text-[8px] font-bold px-2 py-1 rounded flex-shrink-0" style={{ background: `${a.color}15`, color: a.color }}>
                Approve
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 5 mock: Outcome & Reporting ─────────────────────────────────────────
const DOCS = [
  { name: 'Vendor Credit Report', sub: 'Cipla · ₹96,000 · Batch AMX-453', status: 'Generated', color: '#2563EB', icon: FileText },
  { name: 'Donation Certificate', sub: 'HelpAge India · 320 units · 80G', status: 'Generated', color: '#DB2777', icon: Heart },
  { name: 'Schedule M Audit Trail', sub: 'Complete · 100% compliant', status: 'Signed', color: '#059669', icon: Shield },
  { name: 'Disposal Record', sub: 'Gabapentin · EcoPharm · Certified', status: 'Sealed', color: '#6B7280', icon: Lock },
];
function ReportingMock() {
  return (
    <div className="bg-white rounded-xl border border-[#E8E5DF] overflow-hidden text-left shadow-sm">
      <div className="bg-[#FFF0F8] border-b border-[#FBCFE8] px-4 py-2.5 flex items-center justify-between">
        <span className="font-mono text-[10px] text-[#DB2777] font-bold">viala.app/reports</span>
        <span className="bg-[#FCE7F3] text-[#9D174D] text-[9px] font-bold px-2 py-0.5 rounded-full">48 docs this month</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[['48','Docs Generated','#DB2777'],['₹4.2L','Credits Filed','#059669'],['100%','Compliance','#2563EB']].map(([v,l,c]) => (
            <div key={l} className="text-center p-2 rounded-lg bg-[#FAFAF8] border border-[#E8E5DF]">
              <div className="font-black text-sm leading-none" style={{ color: c }}>{v}</div>
              <div className="text-[9px] text-[#9CA3AF] mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        <div className="text-[9px] uppercase tracking-wider font-bold text-[#9CA3AF] mb-2">Generated Documents</div>
        <div className="space-y-2">
          {DOCS.map(d => (
            <div key={d.name} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#F0EDE8] hover:bg-[#FAFAF8] transition-colors">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${d.color}15` }}>
                <d.icon className="w-3.5 h-3.5" style={{ color: d.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-[#0F172A] truncate">{d.name}</div>
                <div className="text-[9px] text-[#6B7280] truncate">{d.sub}</div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${d.color}15`, color: d.color }}>{d.status}</span>
                <span className="text-[10px] text-[#9CA3AF] hover:text-[#059669] cursor-pointer font-medium">PDF ↓</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Steps data ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    number: '01', icon: ScanLine, color: '#059669', bg: '#F0FDF8',
    title: 'Intake & Scan',
    sub: 'Every medicine enters the system.',
    desc: 'Staff scan each batch on arrival. VIALA captures lot number, expiry date, quantity, location, and cost. No manual entry. No spreadsheets.',
    callout: 'Under 8 seconds per batch scan.',
    mock: IntakeMock,
  },
  {
    number: '02', icon: Brain, color: '#2563EB', bg: '#EFF6FF',
    title: 'Lifecycle Engine',
    sub: 'Continuous, real-time monitoring.',
    desc: 'From arrival, VIALA tracks each batch\'s full lifecycle — velocity, expiry windows, network demand, and vendor return eligibility simultaneously.',
    callout: 'Updated every 90 seconds across your network.',
    mock: LifecycleMock,
  },
  {
    number: '03', icon: Zap, color: '#7C3AED', bg: '#F5F3FF',
    title: 'Decision Engine',
    sub: 'Intelligence, not guesswork.',
    desc: 'When stock enters the risk window, the Decision Engine evaluates all six possible outcomes and recommends the highest-value action with a confidence score.',
    callout: 'Average decision latency: 6 minutes.',
    mock: DecisionMock,
  },
  {
    number: '04', icon: Flag, color: '#B45309', bg: '#FFFBEB',
    title: 'Mission Control',
    sub: 'Your operations, unified.',
    desc: 'Every pending action — transfer, return, donate — appears in a prioritised queue. Staff approve in one click. No ambiguity. No missed windows.',
    callout: 'Reduces decision fatigue by 70%.',
    mock: MissionControlMock,
  },
  {
    number: '05', icon: BarChart3, color: '#DB2777', bg: '#FFF0F8',
    title: 'Outcome & Reporting',
    sub: 'Every action, documented.',
    desc: 'Each outcome generates a full audit trail. Vendor credit reports, donation certificates, compliance records — all auto-generated and digitally signed.',
    callout: '100% traceability from intake to disposal.',
    mock: ReportingMock,
  },
];

// ─── Flow step nodes for animated hero ────────────────────────────────────────
const FLOW_NODES = [
  { label: 'Medicine\nReceived', icon: ScanLine, color: '#059669' },
  { label: 'Lifecycle\nEngine', icon: Brain, color: '#2563EB' },
  { label: 'Decision\nEngine', icon: Zap, color: '#7C3AED' },
  { label: 'Mission\nControl', icon: Flag, color: '#B45309' },
  { label: 'Value\nRecovered', icon: TrendingUp, color: '#059669' },
];

// ─── FlipCard Component for Engines ──────────────────────────────────────────
function FlipCard({ e, i }: { e: any; i: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = e.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1, duration: 0.4 }}
      className="w-full h-[480px]"
      style={{ perspective: '1500px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front Side */}
        <div
          className="absolute inset-0 w-full h-full bg-white rounded-3xl border border-[#E8E5DF] p-6 shadow-sm flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Subtle top-right gradient glow */}
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl"
            style={{ background: e.color }}
          />

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${e.color}15` }}>
                <Icon className="w-5 h-5" style={{ color: e.color }} />
              </div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight">{e.title}</h3>
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">{e.desc}</p>
          </div>

          {/* Premium Image visual */}
          <div className="relative w-full h-64 mt-4 rounded-2xl overflow-hidden border border-[#E8E5DF] bg-[#F9F9FB]">
            <Image
              src={e.image}
              alt={e.title}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Soft overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 pointer-events-none" />
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold text-[#0F172A] border border-[#E8E5DF]">
              Hover to Flip
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 w-full h-full bg-[#FAFAF9] rounded-3xl border border-[#E8E5DF] p-8 shadow-sm flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Subtle inner grid background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '16px 16px', color: e.color }} />

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${e.color}15` }}>
                <Icon className="w-5 h-5" style={{ color: e.color }} />
              </div>
              <h3 className="text-lg font-black text-[#0F172A] tracking-tight">{e.title} Capabilities</h3>
            </div>

            <div className="space-y-4">
              {e.features.map((f: string) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${e.color}15` }}>
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: e.color }} />
                  </div>
                  <span className="text-xs font-bold text-[#374151]">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium back decoration */}
          <div className="mt-6 p-4 rounded-xl border border-dashed border-[#E8E5DF] bg-white flex flex-col gap-1.5 relative z-10">
            <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: e.color }}>Integration Status</span>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-[#0F172A]">Core Module Online</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HowItWorksPage() {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveNode(p => (p + 1) % FLOW_NODES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col bg-[#FAFAF8]">

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="pt-24 pb-0 bg-white border-b border-[#E8E5DF]">
        <div className="container-tight text-center max-w-[680px] mx-auto pb-12">
          <span className="label-tag mb-5 inline-flex">How It Works</span>
          <h1 className="display-lg mb-5">
            Five steps from<br />
            <span className="text-gradient-green">intake to outcome.</span>
          </h1>
          <p className="text-[1.05rem] text-[#6B7280] leading-relaxed mb-10">
            VIALA is a continuous intelligence loop — not a one-time scan. Here&apos;s exactly what happens inside the platform.
          </p>

          {/* Animated horizontal flow diagram */}
          <div className="flex items-center justify-center gap-0 overflow-x-auto pt-4 pb-6 px-2 -mt-4">
            {FLOW_NODES.map((node, i) => (
              <div key={i} className="flex items-center">
                <motion.div
                  className="flex flex-col items-center gap-2 cursor-pointer px-2"
                  onClick={() => setActiveNode(i)}
                  animate={{ scale: activeNode === i ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all"
                    animate={{
                      background: activeNode === i ? node.color : '#FFFFFF',
                      borderColor: activeNode === i ? node.color : '#E8E5DF',
                      boxShadow: activeNode === i ? `0 0 0 6px ${node.color}20` : 'none',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <node.icon className="w-5 h-5" style={{ color: activeNode === i ? '#FFFFFF' : node.color }} />
                  </motion.div>
                  <span className="text-[10px] font-bold text-center whitespace-pre-line leading-tight"
                    style={{ color: activeNode === i ? node.color : '#9CA3AF' }}>
                    {node.label}
                  </span>
                </motion.div>
                {i < FLOW_NODES.length - 1 && (
                  <motion.div
                    className="w-8 h-px mx-1 flex-shrink-0"
                    animate={{ background: activeNode > i ? '#059669' : '#E8E5DF' }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ───────────────────────────────────── */}
      <section className="py-6 bg-[#0A0A0A] border-b border-[#1F2937]">
        <div className="container-tight grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { val: '₹2.4M+', label: 'Value Recovered Monthly' },
            { val: '18,500', label: 'Units Saved from Waste' },
            { val: '94%', label: 'Waste Eliminated' },
            { val: '6 min', label: 'Avg. Decision Time' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-black text-[#34D399]">
                <StatCounter value={s.val} />
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STEP-BY-STEP WALKTHROUGH ─────────────────────────── */}
      <section className="py-20 bg-[#FAFAF8]">
        <div className="container-tight space-y-24">
          {STEPS.map((step, i) => {
            const MockComponent = step.mock;
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${!isEven ? 'lg:[&>*:first-child]:order-2' : ''}`}
              >
                {/* Explanation */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-mono text-2xl font-black tracking-tighter leading-none" style={{ color: step.color }}>{step.number}</span>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${step.color}15` }}>
                      <step.icon className="w-5 h-5" style={{ color: step.color }} />
                    </div>
                    <div className="h-px flex-1" style={{ background: `${step.color}30` }} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    {step.title}
                  </h2>
                  <p className="text-base font-semibold text-[#374151] mb-3">{step.sub}</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-5">{step.desc}</p>
                  <div
                    className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full"
                    style={{ background: `${step.color}15`, color: step.color }}
                  >
                    <step.icon className="w-3.5 h-3.5" />
                    {step.callout}
                  </div>
                </div>

                {/* Product mock */}
                <div className="relative">
                  {/* Glow effect */}
                  <div
                    className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${step.color}, transparent 70%)` }}
                  />
                  <MockComponent />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── ARCHITECTURE SECTION ─────────────────────────────── */}
      <section className="py-20 bg-white border-t border-[#E8E5DF]">
        <div className="container-tight">
          <div className="text-center mb-12">
            <span className="label-tag mb-4 inline-flex">Platform Architecture</span>
            <h2 className="display-md mb-3">Built around three engines.</h2>
            <p className="text-[#6B7280] text-sm max-w-[480px] mx-auto">
              Each engine handles a distinct layer of intelligence — together they form a continuous, closed-loop system.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            { [
              {
                title: 'Lifecycle Engine',
                desc: 'Continuously monitors every medicine batch — tracking expiry, velocity, vendor windows, and demand signals in real-time.',
                icon: Brain, color: '#2563EB',
                features: ['90-second sync cycle', 'Risk scoring per SKU', 'Multi-branch visibility', 'Vendor window tracking'],
                image: '/images/lifecycle_engine.png',
              },
              {
                title: 'Decision Engine',
                desc: 'Evaluates all six possible recovery outcomes for each at-risk batch and selects the highest-value action automatically.',
                icon: Zap, color: '#7C3AED',
                features: ['6 outcomes evaluated', '96% avg confidence', '<6 min decision time', 'Compliance-aware routing'],
                image: '/images/decision_engine.png',
              },
              {
                title: 'Mission Control',
                desc: 'Translates AI recommendations into a prioritised action queue that staff can execute in one click — no expertise required.',
                icon: Flag, color: '#B45309',
                features: ['Priority-sorted queue', 'One-click approval', '70% less decision fatigue', 'Full audit trail'],
                image: '/images/mission_control.png',
              },
            ].map((e, i) => (
              <FlipCard key={e.title} e={e} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE VS AFTER ──────────────────────────────────── */}
      <section className="py-20 bg-[#FAFAF8] border-t border-[#E8E5DF]">
        <div className="container-tight max-w-[860px]">
          <div className="text-center mb-12">
            <span className="label-tag mb-4 inline-flex">The Difference</span>
            <h2 className="display-md">Traditional operations vs. VIALA.</h2>
          </div>
          <div className="rounded-2xl border border-[#E8E5DF] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-[#E8E5DF]">
              <div className="p-6 text-xs font-bold text-[#717171] uppercase tracking-wider bg-[#F8F7F5] flex items-center">
                Strategic Area
              </div>
              <div className="p-6 text-center bg-[#FFF5F5] border-l border-[#E8E5DF] flex flex-col items-center justify-center gap-2">
                <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Traditional Systems</span>
                <div className="flex items-center gap-1.5 flex-wrap justify-center opacity-75">
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-white border border-[#FCA5A5] text-[#008fD3] shadow-xs">SAP</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-white border border-[#FCA5A5] text-[#F21905] shadow-xs">ORACLE</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-white border border-[#FCA5A5] text-[#107C41] shadow-xs">EXCEL</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-white border border-[#FCA5A5] text-[#E30613] shadow-xs">EPIC</span>
                </div>
              </div>
              <div className="p-6 text-center bg-[#F0FDF4] border-l border-[#E8E5DF] flex flex-col items-center justify-center gap-1.5" style={{ color: '#059669' }}>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">With VIALA</span>
                <div className="flex items-center gap-1 bg-white border border-emerald-200 px-2 py-0.5 rounded-full shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-emerald-700">Autonomous AI</span>
                </div>
              </div>
            </div>
            {[
              ['Inventory Visibility', 'Monthly manual audits', 'Real-time across all branches'],
              ['Expiry Detection', 'Discovered at disposal', 'Flagged 90 days in advance'],
              ['Decision Making', 'Manual, experience-based', 'AI-ranked, confidence-scored'],
              ['Vendor Returns', 'Missed windows', 'Auto-tracked, auto-submitted'],
              ['Compliance Docs', 'Manual paperwork', 'Auto-generated & digitally signed'],
              ['Waste Write-offs', '8–12% annually', '<1% with active routing'],
            ].map(([area, before, after], i) => (
              <div
                key={area}
                className="grid grid-cols-3 border-b last:border-0"
                style={{ borderColor: '#F0EDE8', background: i % 2 === 0 ? '#FFFFFF' : '#FDFDFC' }}
              >
                <div className="p-4 text-sm font-semibold text-[#374151]">{area}</div>
                <div className="p-4 text-sm text-[#EF4444] text-center border-l border-[#F0EDE8] bg-[#FFFAFA]">
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] flex-shrink-0" />
                    {before}
                  </span>
                </div>
                <div className="p-4 text-sm text-center border-l border-[#F0EDE8] bg-[#FAFFFE]" style={{ color: '#059669' }}>
                  <span className="flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {after}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE TRUST ────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-[#E8E5DF]">
        <div className="container-tight">
          <div className="text-center mb-10">
            <span className="label-tag mb-4 inline-flex">Enterprise Grade</span>
            <h2 className="text-2xl font-extrabold text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Built for compliance from day one.
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: 'Schedule M / H', desc: 'Full CDSCO compliance built into every workflow', color: '#059669' },
              { icon: Lock, title: 'SOC 2 Ready', desc: 'Encrypted audit trails with SHA-256 signatures', color: '#2563EB' },
              { icon: Users, title: 'Role-Based Access', desc: 'Granular permissions per user, branch, and function', color: '#7C3AED' },
              { icon: Activity, title: 'Live Audit Logs', desc: 'Every action timestamped and permanently sealed', color: '#B45309' },
            ].map(t => (
              <div key={t.title} className="rounded-xl border border-[#E8E5DF] p-5 hover:shadow-sm transition-shadow">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${t.color}15` }}>
                  <t.icon className="w-5 h-5" style={{ color: t.color }} />
                </div>
                <h4 className="text-sm font-bold text-[#0F172A] mb-1">{t.title}</h4>
                <p className="text-xs text-[#6B7280] leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container-tight text-center max-w-[600px] mx-auto">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#34D399] mb-6">
            <Zap className="w-4 h-4" />
            See a medicine move through VIALA in real time.
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4" style={{ fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.03em' }}>
            From scan to recovery<br />in under 6 minutes.
          </h2>
          <p className="text-[#94A3B8] text-sm mb-8">
            Our solutions engineers will run a live walkthrough using your actual product mix and show projected recoveries before you sign anything.
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
              href="/outcomes"
              className="px-7 py-3.5 rounded-xl text-sm font-bold text-[#CBD5E1] bg-[#1E293B] border border-[#334155] transition-all hover:bg-[#273549]"
            >
              See All 6 Outcomes <ChevronRight className="inline w-4 h-4 ml-0.5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
