'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight, CheckCircle, TrendingUp, RotateCcw, Package, Heart, Trash2, ShieldCheck, Clock, Zap, ChevronRight, X, Store, AlertTriangle, Play, Pause, BarChart2, Activity, FileSpreadsheet, Lock, UserCheck, Server, Check } from 'lucide-react';

// ─── Animation helpers ───────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 70, damping: 22, delay: i * 0.08 },
  }),
};

// ─── Color palette (Stripe/Linear inspired — no heavy green) ─
const PALETTE = {
  ink: '#0A0A0A',
  inkLight: '#3D3D3D',
  inkMuted: '#717171',
  surface: '#FAFAF9',
  surfaceAlt: '#F4F3F0',
  card: '#FFFFFF',
  border: '#E8E5DF',
  borderLight: '#F0EDE8',
  indigo: '#059669',      // Rebranded to Emerald Green
  indigoLight: '#ECFDF5', // Rebranded to soft mint background
  indigoDim: '#A7F3D0',   // Rebranded to mint border
  amber: '#B45309',       // Viala Gold/Amber
  amberLight: '#FFFBEB',  // Viala Gold/Amber Light
  slate: '#475569',
};

const StatCounter = ({ value, duration = 2000 }: { value: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Parse formatting (e.g. "₹2.4M+", "18,500", "94%", "6 min")
  let prefix = '';
  let suffix = '';
  let target = 0;
  let decimals = 0;

  if (value.startsWith('₹')) {
    prefix = '₹';
    const raw = value.substring(1);
    if (raw.endsWith('M+')) {
      suffix = 'M+';
      target = parseFloat(raw.replace('M+', ''));
      decimals = 1;
    } else {
      target = parseInt(raw.replace(/,/g, ''), 10);
    }
  } else if (value.endsWith('%')) {
    suffix = '%';
    target = parseInt(value.replace('%', ''), 10);
  } else if (value.endsWith(' min')) {
    suffix = ' min';
    target = parseInt(value.replace(' min', ''), 10);
  } else {
    target = parseInt(value.replace(/,/g, ''), 10);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress * (2 - progress); // easeOutQuad
      
      setCount(ease * target);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [hasStarted, target, duration]);

  const formatValue = (val: number) => {
    let formattedNum = '';
    if (decimals > 0) {
      formattedNum = val.toFixed(decimals);
    } else {
      formattedNum = Math.floor(val).toLocaleString('en-US');
    }
    return `${prefix}${formattedNum}${suffix}`;
  };

  return (
    <span ref={elementRef}>
      {formatValue(count)}
    </span>
  );
};

// ─── Data ────────────────────────────────────────────
const STATS = [
  { value: '₹2.4M+', label: 'Value recovered', sub: 'In active pilot programs' },
  { value: '18,500', label: 'Units rescued', sub: 'From landfill & write-off' },
  { value: '94%', label: 'Waste eliminated', sub: 'Vs. industry baseline' },
  { value: '6 min', label: 'Decision time', sub: 'Scan to action, automated' },
];

const OUTCOMES = [
  {
    id: '01', title: 'Sell', icon: TrendingUp,
    metric: '₹1.2M+', metricLabel: 'revenue recovered',
    desc: 'Surface near-expiry stock to the highest-demand location before the window closes.',
    color: '#059669', lightBg: '#ECFDF5', dimColor: '#A7F3D0',
    metaLabel: 'Most Common Outcome',
    metaValue: 'Recovery Potential: ★★★★★',
    bizValue: 'Immediate cash flow generation from stock that would otherwise expire.',
    workflowStep: 'Matches at-risk SKU velocity to local branch shortages.',
    complianceNotes: 'Automated invoice & tax adjustments logged immediately.',
  },
  {
    id: '02', title: 'Return to Vendor', icon: RotateCcw,
    metric: '₹840K', metricLabel: 'in vendor credits',
    desc: 'Automatically match stock to open return windows before eligibility expires.',
    color: '#0D9488', lightBg: '#F0FDFA', dimColor: '#99F6E4',
    metaLabel: 'Distributor Policy Match',
    metaValue: '72 Days Window Remaining',
    bizValue: '100% cost recovery directly from original distributor agreements.',
    workflowStep: 'Automatic contract rule scans align stock to return deadlines.',
    complianceNotes: 'Generates supplier-approved return documentation logs.',
  },
  {
    id: '03', title: 'Transfer', icon: Package,
    metric: '4,200+', metricLabel: 'units rebalanced',
    desc: 'Route surplus inventory to branches with active shortages — instantly.',
    color: '#15803D', lightBg: '#F0FDF4', dimColor: '#BBF7D0',
    metaLabel: 'Shortage Rebalancing',
    metaValue: 'North Branch Deficit Match',
    bizValue: 'Prevents branch out-of-stock and emergency procurement costs.',
    workflowStep: 'Geo-optimized matches route surplus to high-demand hubs.',
    complianceNotes: 'Logs internal transfer manifests in standard audit records.',
  },
  {
    id: '04', title: 'Redistribute', icon: ArrowUpRight,
    metric: '40%', metricLabel: 'better sell-through',
    desc: 'Shift slow-moving SKUs to high-velocity locations across your network.',
    color: '#B45309', lightBg: '#FFFBEB', dimColor: '#FDE68A',
    metaLabel: 'Turnover Optimizer',
    metaValue: 'Geo-Demand Forecast Active',
    bizValue: 'Maximizes sales velocity by relocating stagnant SKU lots.',
    workflowStep: 'AI matches location turnover indices to rebalance inventory.',
    complianceNotes: 'Updates network stock ledger in real time.',
  },
  {
    id: '05', title: 'Donate', icon: Heart,
    metric: '3,200+', metricLabel: 'units to patients',
    desc: 'Match near-expiry medicine with NGO partners. Auto-generate compliance certificates.',
    color: '#65A30D', lightBg: '#F7FEE7', dimColor: '#D9F99D',
    metaLabel: 'CSR Tax Incentive',
    metaValue: '12 Eligible NGOs Connected',
    bizValue: 'Direct corporate tax write-offs and verified social impact credits.',
    workflowStep: 'Matches medicine requirements of certified clinics and NGOs.',
    complianceNotes: 'Auto-generates Schedule M donation records.',
  },
  {
    id: '06', title: 'Dispose Safely', icon: Trash2,
    metric: '100%', metricLabel: 'audit trail',
    desc: 'When all else fails — full chain-of-custody documentation with zero regulatory risk.',
    color: '#4B5563', lightBg: '#F9FAFB', dimColor: '#E5E7EB',
    metaLabel: 'Hazard Containment',
    metaValue: 'Safe Destruction Certificate',
    bizValue: 'Eliminates legal & environmental liabilities of chemical waste.',
    workflowStep: 'Schedules safe transit pickups with licensed bio-hazard handlers.',
    complianceNotes: 'Locks chain-of-custody signatures in standard database.',
  },
];

const OUTCOME_DETAILS: Record<string, {
  pipeline: Array<{ step: string; desc: string }>;
  logs: string[];
  recovered: string;
  timeline: string;
}> = {
  '01': {
    pipeline: [
      { step: 'Intake Scan', desc: 'Scan expiry date (AMX-453, Oct 15)' },
      { step: 'Market Demand', desc: 'Identify high-demand location (Mumbai)' },
      { step: 'Fulfillment', desc: 'Automate transfer & pricing discount' },
    ],
    logs: [
      '[SYSTEM] Initializing stock eligibility scan for batch AMX-453...',
      '[AI ENGINE] Processing market velocity for Amoxicillin 500mg...',
      '[AI ENGINE] Found regional stock deficit (+240%) in Mumbai branch.',
      '[ROUTING] Optimizing pricing strategy to maximize margin: 15% discount applied.',
      '[DISPATCH] Automated routing order generated. Ready for pharmacist approval.',
    ],
    recovered: '₹48,000 credit',
    timeline: 'Dispatched to Mumbai branch in 6 mins',
  },
  '02': {
    pipeline: [
      { step: 'Stock Check', desc: 'Verify supplier return agreement policy' },
      { step: 'Window Check', desc: 'Compare return eligibility deadline (Nov 22)' },
      { step: 'Credit Claim', desc: 'Submit automated return documentation' },
    ],
    logs: [
      '[SYSTEM] Scanned batch PCT-112. Vendor return window check active.',
      '[DATABASE] Fetched agreement contract: 45-day return threshold.',
      '[AI ENGINE] Return window expires in 48 days. Eligibility: 100% credit.',
      '[DOCUMENTATION] Auto-generating credit claim & batch logs PDF...',
      '[STATUS] Claim payload compiled. Return request submitted to distributor.',
    ],
    recovered: '₹1,23,000 credit',
    timeline: 'Distributor return request approved',
  },
  '03': {
    pipeline: [
      { step: 'Deficit Alert', desc: 'Flag branch shortage (Lisinopril 10mg)' },
      { step: 'Supply Match', desc: 'Locate nearby branch with surplus stock' },
      { step: 'Dispatch Log', desc: 'Auto-schedule regional branch transfer' },
    ],
    logs: [
      '[SYSTEM] Surplus detected at Chennai Hub for Lisinopril 10mg.',
      '[DATABASE] Identified deficit alert at Bangalore Central branch.',
      '[LOGISTICS] Calculating transit distance: 340 km. Transit time: 6 hrs.',
      '[AI ENGINE] Recommended transfer path: Chennai -> Bangalore Central.',
      '[STATUS] Rebalancing request sent. Delivery scheduled for tomorrow.',
    ],
    recovered: '₹12,500 inventory saved',
    timeline: 'Shortage resolved at Bangalore branch',
  },
  '04': {
    pipeline: [
      { step: 'SKU Audit', desc: 'Audit velocity of slow-moving items' },
      { step: 'Rebalance', desc: 'Relocate to branch with high-velocity sales' },
      { step: 'Optimize', desc: 'Increase local inventory turnover by 40%' },
    ],
    logs: [
      '[SYSTEM] Triggered SKU audit for slow-moving cardiovascular medications.',
      '[AI ENGINE] Atorvastatin 20mg turnover rate below baseline: 0.12 vs 0.45.',
      '[DATABASE] Matching historic demand: Delhi branch exhibits 3.2x demand.',
      '[OPTIMIZATION] Scheduling batch transfer of 800 units to Delhi Central.',
      '[SUCCESS] Rebalancing complete. Targeted turnover increased by 40%.',
    ],
    recovered: '₹85,000 rebalanced',
    timeline: 'Inventory turnover optimized in 12 mins',
  },
  '05': {
    pipeline: [
      { step: 'NGO Match', desc: 'Identify verified healthcare NGO partners' },
      { step: 'Compliance', desc: 'Validate regulatory guidelines & tax status' },
      { step: 'Tax Receipt', desc: 'Generate digital tax exemption certificate' },
    ],
    logs: [
      '[SYSTEM] Expiry window too short for commercial sales (28 days left).',
      '[AI ENGINE] Selected NGO: Red Cross Clinic (Mumbai) - active request.',
      '[COMPLIANCE] Performing donation compliance check under Schedule M...',
      '[DOCUMENTATION] Auto-generating donation certificate & tax receipt...',
      '[SUCCESS] Donation packet locked. Red Cross dispatch request created.',
    ],
    recovered: '₹62,000 tax credit',
    timeline: 'Donation certificate sent to Red Cross',
  },
  '06': {
    pipeline: [
      { step: 'Disposal Request', desc: 'Log final non-recoverable stock item' },
      { step: 'Chain Custody', desc: 'Log hazardous waste collection ID' },
      { step: 'Audit File', desc: 'Generate compliance audit trail certificate' },
    ],
    logs: [
      '[SYSTEM] Item expired. Re-routing to safe bio-medical disposal path.',
      '[REGULATION] Checking state pollution control board rules for disposal...',
      '[DISPOSAL] Scheduled pickup with bio-hazard handler (MediWaste Ltd).',
      '[CHAIN OF CUSTODY] Signed digital manifest ID: MW-90827364-IN.',
      '[AUDIT] Compliance report generated. Safe disposal logged in audit trail.',
    ],
    recovered: '100% compliance',
    timeline: 'Bio-hazard waste pickup logged',
  },
};

const CUSTOMER_TYPES = [
  {
    tag: 'RETAIL PHARMACY', tagColor: '#059669', tagBg: '#ECFDF5',
    title: 'Pharmacy Chains',
    desc: 'Multi-location visibility. See every SKU across every branch — with AI-ranked recommendations before anything expires.',
    points: ['Real-time expiry tracking per branch', 'Automated vendor return requests', 'Branch-to-branch transfer workflows', 'Network-level Mission Control'],
    stat: { value: '91%', label: 'average waste reduction' },
  },
  {
    tag: 'HEALTH SYSTEMS', tagColor: '#0D9488', tagBg: '#F0FDFA',
    title: 'Hospital Networks',
    desc: 'Hospital-grade compliance architecture. Department-level control with a full audit trail built for your next regulatory review.',
    points: ['Department-level lifecycle tracking', 'HIPAA-aligned audit logs', 'Clinical wastage reporting', 'Compliance-ready documentation'],
    stat: { value: '0', label: 'audit failures in 12 months' },
  },
  {
    tag: 'NETWORKED CARE', tagColor: '#B45309', tagBg: '#FFFBEB',
    title: 'Healthcare Networks',
    desc: 'Intelligence at scale. Redistribute inventory across your entire network to where it is needed most — automatically.',
    points: ['Network-wide redistribution engine', 'Donation impact reporting', 'Central mission control dashboard', 'Multi-site analytics'],
    stat: { value: '8×', label: 'average ROI in year one' },
  },
];

const SIM_SCENARIOS = {
  sell: {
    id: 'sell',
    title: 'Sell (Discount Route)',
    medicine: 'Amoxicillin 500mg',
    batch: 'AMX-453',
    units: 120,
    expiry: '45 Days',
    location: 'Delhi Branch A',
    steps: [
      { label: '📦 Imported', desc: 'Amoxicillin 500mg (120 units) logged at Delhi Branch A.' },
      { label: '⚠ Risk Detected', desc: 'Expiry in 45 days. Write-off risk estimated at ₹48,000.' },
      { label: '🧠 Decision Engine', desc: 'Scanning regional stock deficits, margins, and policies.' },
      { label: '🚚 Action Recommended', desc: 'Demand matched at Delhi Branch B. Dispatch 15% discount sale offer.' },
      { label: '₹ Value Recovered', desc: '₹40,800 recovered. 102 Units sold via secondary priority channels.' }
    ],
    nodes: {
      demandAnalysis: 'passed',
      expiryAnalysis: 'passed',
      vendorReturnCheck: 'failed',
      transferMatch: 'passed',
      donationMatch: 'passed'
    },
    impact: {
      value: 40800,
      unitsSaved: 102,
      wastePrevented: '85%',
      compliance: 'Verified'
    }
  },
  return: {
    id: 'return',
    title: 'Return to Vendor',
    medicine: 'Metformin 1000mg',
    batch: 'MET-204',
    units: 350,
    expiry: '72 Days',
    location: 'Mumbai Central Hub',
    steps: [
      { label: '📦 Imported', desc: 'Metformin 1000mg (350 units) logged at Mumbai Central Hub.' },
      { label: '⚠ Risk Detected', desc: 'Expiry in 72 days. Auto-scanning rules check vendor policy windows.' },
      { label: '🧠 Decision Engine', desc: 'Matching original distributor agreement terms and credit SLA.' },
      { label: '🚚 Action Recommended', desc: 'Vendor return eligibility verified (18 days remaining). Credit claims compiled.' },
      { label: '₹ Value Recovered', desc: '₹1,23,000 credit recovered. Dispatched back to distributor ledger.' }
    ],
    nodes: {
      demandAnalysis: 'passed',
      expiryAnalysis: 'passed',
      vendorReturnCheck: 'passed',
      transferMatch: 'failed',
      donationMatch: 'passed'
    },
    impact: {
      value: 123000,
      unitsSaved: 350,
      wastePrevented: '100%',
      compliance: 'Verified'
    }
  },
  transfer: {
    id: 'transfer',
    title: 'Branch Transfer',
    medicine: 'Lisinopril 10mg',
    batch: 'LIS-108',
    units: 180,
    expiry: '60 Days',
    location: 'Bangalore Branch C',
    steps: [
      { label: '📦 Imported', desc: 'Lisinopril 10mg (180 units) registered at Bangalore Branch C.' },
      { label: '⚠ Risk Detected', desc: 'Expiry in 60 days. Risk index flags low-velocity local turnover.' },
      { label: '🧠 Decision Engine', desc: 'Analyzing regional network stock deficits and cold-chain route costs.' },
      { label: '🚚 Action Recommended', desc: 'High demand matched at Chennai Branch D. Rebalancing transfer dispatched.' },
      { label: '₹ Value Recovered', desc: '₹54,000 recovered. 180 Units reallocated & transit logs signed.' }
    ],
    nodes: {
      demandAnalysis: 'passed',
      expiryAnalysis: 'passed',
      vendorReturnCheck: 'failed',
      transferMatch: 'passed',
      donationMatch: 'passed'
    },
    impact: {
      value: 54000,
      unitsSaved: 180,
      wastePrevented: '100%',
      compliance: 'Verified'
    }
  },
  donate: {
    id: 'donate',
    title: 'Redistribute / Donate',
    medicine: 'Azithromycin 250mg',
    batch: 'AZI-892',
    units: 300,
    expiry: '30 Days',
    location: 'Chennai Branch D',
    steps: [
      { label: '📦 Imported', desc: 'Azithromycin 250mg (300 units) logged at Chennai Branch D.' },
      { label: '⚠ Risk Detected', desc: 'Expiry in 30 days. Scan flags closed vendor windows & low demand.' },
      { label: '🧠 Decision Engine', desc: 'Checking local charity demand lists and tax credit guidelines.' },
      { label: '🚚 Action Recommended', desc: 'Red Cross Clinic matches SKU requirement. Compilation of NGO form.' },
      { label: '₹ Value Recovered', desc: '₹66,000 credit recovered. 300 Units securely donated with CSR receipt.' }
    ],
    nodes: {
      demandAnalysis: 'failed',
      expiryAnalysis: 'passed',
      vendorReturnCheck: 'failed',
      transferMatch: 'failed',
      donationMatch: 'passed'
    },
    impact: {
      value: 66000,
      unitsSaved: 300,
      wastePrevented: '100%',
      compliance: 'Verified'
    }
  },
  dispose: {
    id: 'dispose',
    title: 'Dispose Safely',
    medicine: 'Gabapentin 300mg',
    batch: 'GAB-771',
    units: 80,
    expiry: '12 Days',
    location: 'Kolkata Warehouse E',
    steps: [
      { label: '📦 Imported', desc: 'Gabapentin 300mg (80 units) logged at Kolkata Warehouse E.' },
      { label: '⚠ Risk Detected', desc: 'Expiry in 12 days. High critical chemical waste hazard flagged.' },
      { label: '🧠 Decision Engine', desc: 'Checking legal compliance rules, biohazard rules, and recycler networks.' },
      { label: '🚚 Action Recommended', desc: 'No safe usage window remains. Dispatching certified destruction order.' },
      { label: '₹ Value Recovered', desc: '₹0 recovered. Safe destruction certificate locked in ledger.' }
    ],
    nodes: {
      demandAnalysis: 'failed',
      expiryAnalysis: 'passed',
      vendorReturnCheck: 'failed',
      transferMatch: 'failed',
      donationMatch: 'failed'
    },
    impact: {
      value: 0,
      unitsSaved: 0,
      wastePrevented: '0%',
      compliance: 'Verified'
    }
  }
};

const LOGOS = [
  { name: 'SAP',          url: '/images/logos/sap.svg',         h: 'h-10' },
  { name: 'Oracle',       url: '/images/logos/oracle.svg',      h: 'h-7'  },
  { name: 'AWS',          url: '/images/logos/aws.svg',         h: 'h-9'  },
  { name: 'Google Cloud', url: '/images/logos/googlecloud.svg', h: 'h-10' },
  { name: 'Zoho',         url: '/images/logos/zoho.svg',        h: 'h-8'  },
  { name: 'Salesforce',   url: '/images/logos/salesforce.svg',  h: 'h-10' },
  { name: 'MongoDB',      url: '/images/logos/mongodb.svg',     h: 'h-7'  },
  { name: 'OpenAI',       url: '/images/logos/openai.svg',      h: 'h-6'  },
  { name: 'NVIDIA',       url: '/images/logos/nvidia.svg',      h: 'h-7'  },
  { name: 'Microsoft',    url: '/images/logos/microsoft.svg',   h: 'h-8'  },
  { name: 'NetSuite',     url: '/images/logos/netsuite.svg',    h: 'h-9'  },
];

function StackMarquee() {
  return (
    <section className="bg-white border-t border-b border-[#E8E5DF] overflow-hidden relative select-none py-5">
      <div className="container-tight max-w-[1200px] flex flex-col gap-2">
        {/* Label */}
        <div className="text-center">
          <span className="text-[9px] font-black tracking-widest text-[#717171] uppercase font-mono">
            CONNECTING YOUR EXISTING SYSTEMS TO REAL-WORLD OUTCOMES
          </span>
        </div>

        {/* Scrolling logos */}
        <div className="relative w-full overflow-hidden flex items-center h-14">
          {/* Edge masks */}
          <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Marquee track */}
          <div className="animate-marquee flex gap-16 items-center pr-16">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <div
                key={`${logo.name}-${i}`}
                className="flex-shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 opacity-85 hover:opacity-100 hover:scale-110"
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className={`${logo.h} w-auto object-contain`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Center VIALA badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E8E5DF]/80 shadow-md flex items-center gap-2 pointer-events-auto relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-md animate-pulse pointer-events-none" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              <span className="text-xs font-black tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>VIALA</span>
              <span className="h-3 w-px bg-[#E8E5DF]" />
              <span className="text-[8px] font-black uppercase tracking-wider text-[#059669] font-mono">AI Lifecycle Layer</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [selectedOutcome, setSelectedOutcome] = useState<typeof OUTCOMES[number] | null>(null);
  const [demoState, setDemoState] = useState<'idle' | 'running' | 'completed'>('idle');


  // Architecture Step states
  const [activeArchStep, setActiveArchStep] = useState<number>(0);

  // Walkthrough simulation state
  const [simStep, setSimStep] = useState<number>(0);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(true);
  const [selectedSimTab, setSelectedSimTab] = useState<keyof typeof SIM_SCENARIOS>('transfer');
  const [recoveredValCounter, setRecoveredValCounter] = useState<number>(0);

  // Autoplay step transition
  useEffect(() => {
    if (!isSimPlaying) return;
    const timer = setInterval(() => {
      setSimStep((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 4500); // 4.5 seconds per step for comfortable reading
    return () => clearInterval(timer);
  }, [isSimPlaying]);

  // Numerical counter animation for recovered value
  useEffect(() => {
    if (simStep === 4) {
      const target = SIM_SCENARIOS[selectedSimTab].impact.value;
      if (target === 0) {
        setRecoveredValCounter(0);
        return;
      }
      const duration = 1200; // ms
      const startTime = performance.now();
      let frameId: number;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = progress * (2 - progress); // Ease out quad
        setRecoveredValCounter(Math.floor(ease * target));

        if (progress < 1) {
          frameId = requestAnimationFrame(animate);
        }
      };

      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
    } else {
      setRecoveredValCounter(0);
    }
  }, [simStep, selectedSimTab]);

  const handleTabChange = (tabKey: keyof typeof SIM_SCENARIOS) => {
    setSelectedSimTab(tabKey);
    setSimStep(0);
    setRecoveredValCounter(0);
  };

  const startDemoSimulation = () => {
    if (demoState !== 'idle') return;
    setDemoState('running');
    setTimeout(() => {
      setDemoState('completed');
    }, 2000);
  };

  return (
    <div className="flex flex-col overflow-x-hidden" style={{ background: PALETTE.surface }}>

      {/* ══════════════════════════════════════════════════════
          HERO OVERHAUL
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" style={{ background: PALETTE.surface }}>

        {/* Premium line grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(to right, ${PALETTE.border} 1px, transparent 1px),
            linear-gradient(to bottom, ${PALETTE.border} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 10%, #000 40%, transparent 95%)',
          opacity: 0.55,
        }} />

        <div className="container-tight relative z-10 pt-16 pb-16 lg:pt-20 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Side: Headline & Copy */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              {/* Top announcement pill */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-6">
                <a href="#action-simulator" className="inline-flex items-center gap-2 text-[0.75rem] font-bold px-3 py-1.5 rounded-full border bg-white border-[#E8E5DF] text-[#717171] hover:border-[#10B981] transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse inline-block" />
                  Live pilot tracking: ₹32.4L in recovered value
                  <ChevronRight className="w-3 h-3" />
                </a>
              </motion.div>

              <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                className="display-xl text-left tracking-tight" style={{ color: '#0F172A', lineHeight: 1.15 }}>
                Medicine shouldn&apos;t expire<br />
                <span className="text-[#10B981]">without a second chance.</span>
              </motion.h1>

              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                className="text-base mt-6 text-[#717171] leading-relaxed max-w-[500px]">
                VIALA is the medicine lifecycle intelligence platform. We help pharmacies, hospitals, and healthcare networks prevent medicine waste and automate inventory value recovery before expiry.
              </motion.p>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
                className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link href="/get-started"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[10px] text-[0.9rem] font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-[1px]"
                  style={{ background: '#0F172A' }}
                >
                  Request Early Access <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#action-simulator"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[10px] text-[0.9rem] font-bold border bg-white text-[#0F172A] border-[#E8E5DF] hover:bg-[#FAFAF8] transition-all"
                >
                  Book Demo
                </a>
              </motion.div>

              <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={4}
                className="mt-5 text-[11px] text-[#B0ABAB]">
                Enterprise Ready · HIPAA Compliant · Direct PMS Integration
              </motion.p>
            </div>

            {/* Right Side: Redesigned Premium Dashboard Console (No Cluttered Overlaps) */}
            <div className="lg:col-span-6 w-full mt-12 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full rounded-2xl border bg-[#FAFAF8] shadow-2xl overflow-hidden"
                style={{ borderColor: PALETTE.border }}
              >
                {/* macOS Style Browser Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-[#ECEAE6]" style={{ borderColor: PALETTE.border }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
                  </div>
                  <span className="text-[10px] font-mono text-[#717171] bg-white px-3 py-1 rounded border" style={{ borderColor: PALETTE.border }}>
                    viala.app/dashboard
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-800">SYNC ACTIVE</span>
                  </div>
                </div>

                {/* Dashboard Workspace */}
                <div className="p-5 bg-white flex flex-col gap-4">
                  {/* Console Header Bar */}
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: PALETTE.borderLight }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span className="text-xs font-bold text-[#0F172A] tracking-wider uppercase font-mono">Mission Control</span>
                    </div>
                    <span className="text-[9px] text-[#717171] font-mono bg-[#FAFAF8] px-2 py-0.5 rounded border" style={{ borderColor: PALETTE.border }}>
                      DEL-MUM ACTIVE
                    </span>
                  </div>

                  {/* Grid Layout of Cards (Clean & Aligned) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Grid Cell 1: Overview Summary */}
                    <div className="border rounded-xl p-4 bg-[#FAFAF9]" style={{ borderColor: PALETTE.border }}>
                      <div className="text-[10px] text-[#717171] uppercase tracking-wider font-semibold mb-2">Network Summary</div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[9px] text-[#717171] block">Total Recovered</span>
                          <span className="text-lg font-extrabold text-[#10B981]">₹32,48,500</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t pt-2" style={{ borderColor: PALETTE.borderLight }}>
                          <span className="font-semibold text-[#0F172A]">Resolved Tasks</span>
                          <span className="text-[#10B981] font-bold">14 Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Grid Cell 2: Expiry Alert */}
                    <div className="border border-rose-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[8px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">URGENT RISK</span>
                          <Clock className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        </div>
                        <div className="text-[11px] font-bold text-[#0F172A]">Amoxicillin 500mg</div>
                        <div className="text-[8px] text-[#717171] mb-2 font-mono">Batch: AMX-453 · Exp: 28 Days</div>
                      </div>
                      <div className="h-[3px] w-full bg-rose-100 rounded-full overflow-hidden mb-1.5">
                        <div className="h-full bg-rose-500 rounded-full w-[25%]" />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold text-rose-600">
                        <span>Delhi Hub</span>
                        <span>120 Units</span>
                      </div>
                    </div>

                    {/* Grid Cell 3: Vendor Return Claim */}
                    <div className="border rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between" style={{ borderColor: PALETTE.border }}>
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                          <span className="text-[9px] font-bold text-[#717171] uppercase tracking-wider">Vendor Return</span>
                        </div>
                        <div className="text-[9px] text-[#717171] mb-0.5">Contract Refund Claim</div>
                        <div className="text-sm font-extrabold text-[#0F172A]">₹1,23,000 Credit</div>
                      </div>
                      <div className="flex justify-between text-[8px] border-t pt-2 mt-2" style={{ borderColor: PALETTE.borderLight }}>
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">AUTHORIZED</span>
                        <span className="font-mono text-[#717171] self-center">ID: CLM-90284</span>
                      </div>
                    </div>

                    {/* Grid Cell 4: Transfer Suggestion */}
                    <div className="border rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between" style={{ borderColor: PALETTE.border }}>
                      <div>
                        <div className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded self-start inline-block mb-2">
                          TRANSFER MATCH
                        </div>
                        <div className="text-[11px] font-bold text-[#0F172A] mb-1.5">Lisinopril 10mg</div>
                        <div className="flex items-center justify-between text-[8px] bg-[#FAFAF8] border p-1 rounded" style={{ borderColor: PALETTE.border }}>
                          <span className="font-bold text-[#0F172A]">Delhi</span>
                          <ArrowRight className="w-3 h-3 text-[#10B981]" />
                          <span className="font-bold text-[#0F172A]">Mumbai</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-[#717171] border-t pt-2 mt-2" style={{ borderColor: PALETTE.borderLight }}>
                        <span>Optimal Routing</span>
                        <span className="text-[#10B981]">Save ₹48,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Stretched Bottom Block: Weekly Waste Saved Chart */}
                  <div className="border rounded-xl p-4 bg-[#0F172A] text-white shadow-sm" style={{ borderColor: '#1E293B' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-[9px] text-[#94A3B8] uppercase tracking-wider font-semibold">Weekly Waste Saved</div>
                        <div className="text-lg font-extrabold text-white">₹1,83,500 <span className="text-[9px] text-[#10B981] font-bold ml-1">+24%</span></div>
                      </div>
                      <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">LEDGER SECURED</span>
                    </div>
                    <div className="relative w-full h-16 overflow-hidden mt-1 rounded-b-xl">
                      <svg className="absolute w-[200%] h-full top-0 left-0" viewBox="0 0 200 40" fill="none" preserveAspectRatio="none">
                        <g>
                          <animateTransform attributeName="transform" type="translate" from="0,0" to="-100,0" dur="4s" repeatCount="indefinite" />
                          <path d="M0,25 C10,25 15,15 25,15 C35,15 40,30 50,30 C60,30 75,10 85,10 C95,10 95,25 100,25 C110,25 115,15 125,15 C135,15 140,30 150,30 C160,30 175,10 185,10 C195,10 195,25 200,25" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M0,25 C10,25 15,15 25,15 C35,15 40,30 50,30 C60,30 75,10 85,10 C95,10 95,25 100,25 C110,25 115,15 125,15 C135,15 140,30 150,30 C160,30 175,10 185,10 C195,10 195,25 200,25 L200,40 L0,40 Z" fill="url(#heroChartGlow)" opacity="0.15" />
                        </g>
                        <defs>
                          <linearGradient id="heroChartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
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

      <StackMarquee />

      {/* ══════════════════════════════════════════════════════
          MOCK VIDEO WORKFLOW SIMULATOR
      ══════════════════════════════════════════════════════ */}
      <section id="action-simulator" className="border-t border-b py-24 relative bg-white" style={{ borderColor: PALETTE.border }}>
        <div className="container-tight">
          
          <div className="text-center max-w-[720px] mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#10B981] bg-[#ECFDF5] px-3 py-1 rounded-full border border-emerald-100 mb-3">
              Live Mission Control Simulation
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
              One Medicine. Six Possible Outcomes. One Best Decision.
            </h2>
            <p className="mt-3 text-sm text-[#717171]">
              Watch how VIALA identifies risk, evaluates options, and recovers inventory value before expiry.
            </p>
          </div>

          {/* Outcome Switching Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-[800px] mx-auto">
            {[
              { key: 'sell', label: 'Sell (Discount Route)' },
              { key: 'return', label: 'Return to Vendor' },
              { key: 'transfer', label: 'Branch Transfer' },
              { key: 'donate', label: 'Redistribute / Donate' },
              { key: 'dispose', label: 'Safe Disposal' }
            ].map((tab) => {
              const active = selectedSimTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key as keyof typeof SIM_SCENARIOS)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                    active
                      ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-sm shadow-[#0F172A]/10'
                      : 'bg-white text-[#717171] border-[#E8E5DF] hover:bg-[#FAFAF8] hover:text-[#0F172A]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 3-Column Simulation Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#FAFAF8] rounded-[24px] border border-[#E8E5DF] p-6 lg:p-8">
            
            {/* Timeline Column (Left) */}
            <div className="lg:col-span-3 flex flex-col justify-start gap-4">
              <div className="text-[10px] font-bold text-[#717171] uppercase tracking-wider mb-2">Decision Timeline</div>
              <div className="flex flex-col gap-4 relative">
                {/* Vertical Line Connector */}
                <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-[#E8E5DF]" />
                
                {SIM_SCENARIOS[selectedSimTab].steps.map((step, idx) => {
                  const isActive = simStep === idx;
                  const isCompleted = simStep > idx;
                  return (
                    <div key={idx} className="flex items-start gap-4 relative z-10 text-left">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 flex-shrink-0 ${
                        isActive
                          ? 'bg-[#059669] text-white border-[#059669] shadow-md shadow-emerald-500/20'
                          : isCompleted
                          ? 'bg-emerald-50 text-[#059669] border-[#A7F3D0]'
                          : 'bg-white text-[#717171] border-[#E8E5DF]'
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs font-bold transition-colors ${isActive ? 'text-[#059669] font-black' : 'text-[#0F172A]'}`}>
                          {step.label}
                        </h4>
                        <p className="text-[10px] text-[#717171] leading-relaxed mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decision Engine Visual Center Column */}
            <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border bg-white border-[#E8E5DF] p-6 shadow-sm min-h-[420px]">
              
              {/* macOS style title bar */}
              <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: PALETTE.borderLight }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
                  <span className="text-[9px] font-mono text-[#717171] ml-4 bg-[#FAFAF8] px-2 py-0.5 rounded border border-[#E8E5DF]">
                    viala.app/lifecycle-engine
                  </span>
                </div>
                <button
                  onClick={() => setIsSimPlaying(!isSimPlaying)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAFAF8] border border-[#E8E5DF] text-[9px] font-bold text-[#0F172A] hover:bg-[#F0EDE8] transition-colors"
                >
                  {isSimPlaying ? <Pause className="w-3 h-3 text-amber-600 animate-pulse" /> : <Play className="w-3 h-3 text-emerald-600" />}
                  {isSimPlaying ? 'Pause' : 'Autoplay'}
                </button>
              </div>

              {/* Medicine Profile Metadata Block */}
              <div className="bg-[#FAFAF8] border border-[#E8E5DF] rounded-xl p-4 mb-4 text-left">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      At-Risk Inventory Batch
                    </span>
                    <h3 className="text-xs font-extrabold text-[#0F172A] mt-1">{SIM_SCENARIOS[selectedSimTab].medicine}</h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#717171] bg-white px-2 py-0.5 rounded border border-[#E8E5DF]">
                    Batch: {SIM_SCENARIOS[selectedSimTab].batch}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-mono">
                  <div className="bg-white border border-[#E8E5DF] p-2 rounded-lg">
                    <div className="text-[#717171] text-[8px] uppercase">Qty</div>
                    <div className="font-bold text-[#0F172A] mt-0.5">{SIM_SCENARIOS[selectedSimTab].units} Units</div>
                  </div>
                  <div className="bg-white border border-[#E8E5DF] p-2 rounded-lg">
                    <div className="text-[#717171] text-[8px] uppercase">Expiry Risk</div>
                    <div className="font-bold text-rose-600 mt-0.5">{SIM_SCENARIOS[selectedSimTab].expiry}</div>
                  </div>
                  <div className="bg-white border border-[#E8E5DF] p-2 rounded-lg">
                    <div className="text-[#717171] text-[8px] uppercase">Location</div>
                    <div className="font-bold text-[#0F172A] mt-0.5 truncate">{SIM_SCENARIOS[selectedSimTab].location}</div>
                  </div>
                </div>
              </div>

              {/* Central Dynamic Screen Render */}
              <div className="flex-1 flex flex-col justify-center bg-[#FDFDFD] border border-dashed border-[#E8E5DF] rounded-xl p-4 relative overflow-hidden">
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#94A3B8] mb-3 text-center">Decision Engine Evaluating</div>
                
                <div className="grid grid-cols-5 gap-2 items-center justify-center relative">
                  {/* Demand Analysis Node */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      simStep < 2 
                        ? 'bg-white border-[#E8E5DF] text-[#94A3B8]' 
                        : simStep === 2 
                        ? 'bg-amber-50 border-amber-400 text-amber-600 animate-pulse' 
                        : SIM_SCENARIOS[selectedSimTab].nodes.demandAnalysis === 'passed' 
                        ? 'bg-emerald-50 border-emerald-400 text-[#059669]' 
                        : 'bg-red-50 border-red-200 text-red-500'
                    }`}>
                      <BarChart2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] font-semibold text-[#717171] mt-1 whitespace-nowrap">Demand</span>
                  </div>

                  {/* Expiry Analysis Node */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      simStep < 2 
                        ? 'bg-white border-[#E8E5DF] text-[#94A3B8]' 
                        : simStep === 2 
                        ? 'bg-amber-50 border-amber-400 text-amber-600 animate-pulse' 
                        : SIM_SCENARIOS[selectedSimTab].nodes.expiryAnalysis === 'passed' 
                        ? 'bg-emerald-50 border-emerald-400 text-[#059669]' 
                        : 'bg-red-50 border-red-200 text-red-500'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] font-semibold text-[#717171] mt-1 whitespace-nowrap">Expiry</span>
                  </div>

                  {/* Center Decision Hub brain/activity node */}
                  <div className="flex flex-col items-center text-center z-10">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 ${
                      simStep < 2 
                        ? 'bg-[#FAFAF8] border-[#E8E5DF] text-[#717171]' 
                        : simStep === 2 
                        ? 'bg-[#FAFAF8] border-amber-400 text-amber-600 animate-spin' 
                        : 'bg-[#0F172A] border-[#0F172A] text-white shadow-lg shadow-[#0F172A]/20'
                    }`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-[#0F172A] mt-1 whitespace-nowrap">Decision Hub</span>
                  </div>

                  {/* Vendor Return Check Node */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      simStep < 2 
                        ? 'bg-white border-[#E8E5DF] text-[#94A3B8]' 
                        : simStep === 2 
                        ? 'bg-amber-50 border-amber-400 text-amber-600 animate-pulse' 
                        : SIM_SCENARIOS[selectedSimTab].nodes.vendorReturnCheck === 'passed' 
                        ? 'bg-emerald-50 border-emerald-400 text-[#059669]' 
                        : 'bg-red-50 border-red-200 text-red-500'
                    }`}>
                      <RotateCcw className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] font-semibold text-[#717171] mt-1 whitespace-nowrap">Vendor</span>
                  </div>

                  {/* Donation Match Node */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      simStep < 2 
                        ? 'bg-white border-[#E8E5DF] text-[#94A3B8]' 
                        : simStep === 2 
                        ? 'bg-amber-50 border-amber-400 text-amber-600 animate-pulse' 
                        : SIM_SCENARIOS[selectedSimTab].nodes.donationMatch === 'passed' 
                        ? 'bg-emerald-50 border-emerald-400 text-[#059669]' 
                        : 'bg-red-50 border-red-200 text-red-500'
                    }`}>
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] font-semibold text-[#717171] mt-1 whitespace-nowrap">Donation</span>
                  </div>
                </div>

                {/* Recommended Action Display Bar */}
                <div className="mt-4 pt-3 border-t border-[#F0EDE8] flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-wider">RECOMMENDED ACTION</span>
                  {simStep < 3 ? (
                    <span className="text-xs text-[#717171] font-mono mt-1 animate-pulse">Running assessment models...</span>
                  ) : (
                    <span className={`text-xs font-black uppercase px-3.5 py-1 rounded-full mt-1 border tracking-wide transition-all duration-300 ${
                      selectedSimTab === 'sell'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : selectedSimTab === 'return'
                        ? 'bg-teal-50 text-teal-800 border-teal-200'
                        : selectedSimTab === 'transfer'
                        ? 'bg-emerald-50 text-[#059669] border-[#BBF7D0]'
                        : selectedSimTab === 'donate'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                    }`}>
                      {selectedSimTab === 'sell' && 'SELL WITH 15% DISCOUNT'}
                      {selectedSimTab === 'return' && 'RETURN TO DISTRIBUTOR'}
                      {selectedSimTab === 'transfer' && 'INTER-BRANCH TRANSFER'}
                      {selectedSimTab === 'donate' && 'REDISTRIBUTE & DONATE'}
                      {selectedSimTab === 'dispose' && 'SAFE ENVIRONMENTAL DESTRUCTION'}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar tracker */}
              <div className="mt-4 pt-3 border-t border-[#F0EDE8] flex items-center justify-between text-[9px] text-[#717171]">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div key={idx} className={`w-6 h-1 rounded-full transition-all duration-300 ${simStep === idx ? 'bg-[#059669]' : 'bg-[#E8E5DF]'}`} />
                  ))}
                </div>
                <div>Status: simulation active</div>
              </div>

            </div>

            {/* Impact Column (Right) */}
            <div className="lg:col-span-3 flex flex-col justify-start gap-4">
              <div className="text-[10px] font-bold text-[#717171] uppercase tracking-wider mb-2">Business Impact</div>
              
              {/* Recoverable Value Card */}
              <div className="bg-[#0F172A] text-white rounded-xl p-4 border border-[#1E293B] shadow-sm relative overflow-hidden text-left">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-50" />
                <div className="relative z-10">
                  <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">Recoverable Value</span>
                  <div className="text-2xl font-black mt-1.5 tracking-tight text-white font-mono">
                    ₹{recoveredValCounter.toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-emerald-400 font-bold">
                    <TrendingUp className="w-3 h-3" />
                    <span>Estimated recovered cash flow</span>
                  </div>
                </div>
              </div>

              {/* Units Saved Card */}
              <div className="bg-white border border-[#E8E5DF] rounded-xl p-4 shadow-sm text-left">
                <span className="text-[9px] text-[#717171] font-bold uppercase tracking-wider">Units Saved</span>
                <div className="text-xl font-extrabold text-[#0F172A] mt-1 font-mono">
                  {simStep >= 4 ? `${SIM_SCENARIOS[selectedSimTab].impact.unitsSaved} Units` : 'Calculating...'}
                </div>
                <div className="text-[8px] text-[#717171] mt-1 font-mono uppercase tracking-widest">
                  From Write-Off Hazard
                </div>
              </div>

              {/* Waste Prevented Card */}
              <div className="bg-white border border-[#E8E5DF] rounded-xl p-4 shadow-sm text-left">
                <span className="text-[9px] text-[#717171] font-bold uppercase tracking-wider">Waste Prevented</span>
                <div className="text-xl font-extrabold text-[#0F172A] mt-1 font-mono">
                  {simStep >= 4 ? SIM_SCENARIOS[selectedSimTab].impact.wastePrevented : 'Analyzing...'}
                </div>
                <div className="text-[8px] text-[#717171] mt-1 font-mono uppercase tracking-widest">
                  Landfill Diversion Rate
                </div>
              </div>

              {/* Compliance Status Card */}
              <div className="bg-white border border-[#E8E5DF] rounded-xl p-4 shadow-sm text-left">
                <span className="text-[9px] text-[#717171] font-bold uppercase tracking-wider">Compliance Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck className={`w-5 h-5 ${simStep >= 4 ? 'text-emerald-500' : 'text-neutral-300'}`} />
                  <span className="text-xs font-black text-[#0F172A] font-mono">
                    {simStep >= 4 ? SIM_SCENARIOS[selectedSimTab].impact.compliance : 'Verifying Audit...'}
                  </span>
                </div>
                <div className="text-[8px] text-[#717171] mt-1 font-mono uppercase tracking-widest">
                  SOC-2 Logs Signed
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PRODUCT ARCHITECTURE SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 relative bg-white border-b" style={{ borderColor: PALETTE.border }}>
        <div className="container-tight">
          
          <div className="text-center max-w-[620px] mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] px-3 py-1 rounded-full border border-emerald-100">
              Technical Pipeline
            </span>
            <h2 className="text-3xl font-extrabold mt-3 tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Engine Architecture & Flow
            </h2>
            <p className="mt-3 text-sm text-[#717171]">
              Click on each step below to inspect how VIALA parses inventory data from raw registers to successful value recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#FAFAF8] rounded-[24px] border border-[#E8E5DF] p-6 lg:p-8">
            
            {/* Interactive Flow Nodes (Left/Top) */}
            <div className="lg:col-span-6 flex flex-col justify-center gap-4 relative">
              {/* Dynamic Connecting Track */}
              <div className="absolute left-[28px] top-6 bottom-6 w-[2px] bg-[#E8E5DF] z-0 hidden lg:block">
                <div 
                  className="absolute top-0 w-full bg-[#059669] transition-all duration-500 rounded-full"
                  style={{
                    height: `${(activeArchStep / 4) * 100}%`,
                  }}
                />
              </div>

              {[
                { title: '1. Inventory Integrator', desc: 'Syncs with PMS/EMR registers every 90 seconds.', icon: Server, step: 0 },
                { title: '2. Lifecycle Engine', desc: 'Calculates active expiry windows and risk indices.', icon: Activity, step: 1 },
                { title: '3. Decision Optimization Pipeline', desc: 'Runs LLM agreement parser to test options.', icon: Zap, step: 2 },
                { title: '4. Fulfillment Gateway', desc: 'Dispatches courier orders and generates claim manifests.', icon: Package, step: 3 },
                { title: '5. Value Recovery Ledger', desc: 'Encrypts transactional outcomes in audit trails.', icon: ShieldCheck, step: 4 }
              ].map((node) => (
                <button
                  key={node.step}
                  onClick={() => setActiveArchStep(node.step)}
                  className="w-full text-left p-4 rounded-xl border z-10 transition-all duration-300 bg-white relative flex gap-4 items-center group cursor-pointer"
                  style={{
                    borderColor: activeArchStep === node.step ? '#059669' : '#E8E5DF',
                    boxShadow: activeArchStep === node.step ? '0 4px 16px rgba(5,150,105,0.06)' : 'none'
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 flex-shrink-0 ${activeArchStep === node.step ? 'bg-[#059669] text-white' : 'bg-[#FAFAF8] text-[#717171] group-hover:bg-[#F0EDE8]'}`}>
                    <node.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-extrabold transition-colors duration-350 ${activeArchStep === node.step ? 'text-[#059669]' : 'text-[#0F172A]'}`}>{node.title}</div>
                    <div className="text-[10px] text-[#717171] mt-0.5 leading-relaxed">{node.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Inspect Display Screen (Right/Bottom) */}
            <div className="lg:col-span-6 rounded-2xl border bg-[#0B0F19] border-[#1E293B] p-6 flex flex-col justify-between min-h-[380px] shadow-2xl text-left relative overflow-hidden">
              
              {/* Screen header */}
              <div className="border-b pb-3 mb-4 flex items-center justify-between border-[#1E293B]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] shadow-sm shadow-[#FF5F57]/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-sm shadow-[#FFBD2E]/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28CA41] shadow-sm shadow-[#28CA41]/50" />
                  <span className="text-[9px] font-mono ml-4 bg-[#131924] text-[#94A3B8] px-2 py-0.5 rounded border border-[#1E293B]">
                    viala-daemon --diagnose
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-[#34D399] bg-[#064E3B]/40 border border-[#059669]/30 rounded px-1.5 py-0.5 animate-pulse">ACTIVE</span>
              </div>

              {/* Dynamic details render */}
              <div className="flex-1 flex flex-col justify-between">
                
                {activeArchStep === 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-[#F8FAFC]">
                      <Server className="w-4 h-4 text-[#34D399]" />
                      <h4 className="text-sm font-bold">PMS & EMR System Sync</h4>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">
                      VIALA integrates directly with your existing Pharmacy Management System (PMS) and Electronic Medical Record (EMR) databases. Works out-of-the-box with zero workflow disruption.
                    </p>
                    <div className="rounded-lg border bg-[#0F172A] border-[#1E293B] p-3 text-[9px] font-mono space-y-1 text-[#94A3B8] shadow-inner">
                      <div className="text-slate-500 font-bold mb-1">$ viala --sync-registers</div>
                      <div><span className="text-slate-400">// Connection Status:</span> <span className="text-[#34D399] font-bold">SUCCESS</span></div>
                      <div>GET /api/v1/inventory/sync - <span className="text-[#34D399]">200 OK</span></div>
                      <div>Parsed: <span className="text-[#F8FAFC] font-bold">1,480</span> active medicine SKU records synced.</div>
                    </div>
                  </div>
                )}

                {activeArchStep === 1 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-[#F8FAFC]">
                      <Activity className="w-4 h-4 text-[#34D399]" />
                      <h4 className="text-sm font-bold">Automated Expiry Assessment</h4>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">
                      Every scanned medicine lot is cataloged by date. The system predicts velocity trends to alert stores if stock will expire before getting sold.
                    </p>
                    <div className="rounded-lg border bg-[#0F172A] border-[#1E293B] p-3 text-[9px] font-mono space-y-1 text-[#94A3B8] shadow-inner">
                      <div className="text-slate-500 font-bold mb-1">$ viala --predict-velocity</div>
                      <div><span className="text-slate-400">// Expiry Check Engine active</span></div>
                      <div><span className="text-rose-400 font-bold">ALERT:</span> SKU_BATCH_AMX-453 has 45 days left.</div>
                      <div>Calculated surplus risk score: <span className="text-rose-400 font-bold">92/100</span></div>
                    </div>
                  </div>
                )}

                {activeArchStep === 2 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-[#F8FAFC]">
                      <Zap className="w-4 h-4 text-[#34D399]" />
                      <h4 className="text-sm font-bold">Distributor Agreement Engine</h4>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">
                      The core AI matches distributor returns policies, vendor agreement credits, and local shortage needs to verify the highest-value recovery path.
                    </p>
                    <div className="rounded-lg border bg-[#0F172A] border-[#1E293B] p-3 text-[9px] font-mono space-y-1 text-[#94A3B8] shadow-inner">
                      <div className="text-slate-500 font-bold mb-1">$ viala --optimize-agreements</div>
                      <div><span className="text-slate-400">// Optimization query initialized</span></div>
                      <div>Distributor Returns Rule Match: <span className="text-[#34D399] font-bold">Verified</span> (72 days left)</div>
                      <div>Inter-branch Transfer Route: <span className="text-[#34D399] font-bold">Verified</span> (Delhi - Mumbai)</div>
                    </div>
                  </div>
                )}

                {activeArchStep === 3 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-[#F8FAFC]">
                      <Package className="w-4 h-4 text-[#34D399]" />
                      <h4 className="text-sm font-bold">Automated Logistics & Claims</h4>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">
                      Generates internal branch transfer manifests, supplier claims documents, or tax-deductible donation records automatically without paperwork.
                    </p>
                    <div className="rounded-lg border bg-[#0F172A] border-[#1E293B] p-3 text-[9px] font-mono space-y-1 text-[#94A3B8] shadow-inner">
                      <div className="text-slate-500 font-bold mb-1">$ viala --dispatch-gateway</div>
                      <div><span className="text-slate-400">// Dispatch Gateway status:</span> <span className="text-amber-400 font-bold">ON_STANDBY</span></div>
                      <div>PDF claim payload compiled & locked in memory.</div>
                      <div>Courier shipping manifest ID created: <span className="text-[#F8FAFC] font-bold">TRN-9082</span></div>
                    </div>
                  </div>
                )}

                {activeArchStep === 4 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-[#F8FAFC]">
                      <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                      <h4 className="text-sm font-bold">Immutable Security Audit Trail</h4>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">
                      All operations are compiled in secure ledger logs. VIALA logs role permissions, dispatch manifests, and compliance signatures so you are audit-ready at any second.
                    </p>
                    <div className="rounded-lg border bg-[#0F172A] border-[#1E293B] p-3 text-[9px] font-mono space-y-1 text-[#94A3B8] shadow-inner">
                      <div className="text-slate-500 font-bold mb-1">$ viala --audit-log --verify</div>
                      <div><span className="text-slate-400">// Log encrypted successfully</span></div>
                      <div>SHA-256 Hash: <span className="text-slate-400">e3b0c44298fc1c149afbf4c8996fb924</span></div>
                      <div>Regulatory ready Schedule M status: <span className="text-[#34D399] font-bold">COMPLIANT</span></div>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-[#1E293B] flex justify-between items-center text-[10px] text-[#94A3B8]">
                  <span>Component: {activeArchStep + 1} of 5</span>
                  <a href="/how-it-works" className="font-bold text-[#34D399] hover:underline flex items-center gap-0.5">
                    Read SDK doc <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAND  (kept dark — it works well)
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: '#0A0A0A', padding: '72px 0' }}>
        <div className="container-tight">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x"
            style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}>
            {STATS.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} custom={i * 0.12} className="text-center lg:px-10">
                <div className="text-[3.2rem] font-extrabold tracking-[-0.05em] leading-none mb-2"
                  style={{ fontFamily: 'var(--font-jakarta)', color: '#FFFFFF' }}>
                  <StatCounter value={s.value} />
                </div>
                <div className="text-sm font-semibold mb-1" style={{ color: '#AAAAAA' }}>{s.label}</div>
                <div className="text-xs" style={{ color: '#555555' }}>{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTELLIGENT WORKFLOW (Formerly PROBLEM / SOLUTION) ── */}
      <section style={{ padding: '120px 0', background: PALETTE.surface }} className="relative">
        <div className="container-tight">

          {/* Section header */}
          <div className="max-w-[700px] mb-20">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] mb-5 px-3.5 py-1.5 rounded-full border"
              style={{ background: PALETTE.card, borderColor: PALETTE.border, color: PALETTE.indigo }}>
              Operations Workflow
            </span>
            <h2 className="display-lg mt-2" style={{ color: PALETTE.ink, letterSpacing: '-0.03em' }}>
              Stop Tracking Inventory.<br />Start Recovering Value.
            </h2>
            <p className="mt-5 text-[1.1rem] leading-relaxed" style={{ color: PALETTE.inkMuted }}>
              Traditional systems tell you what you have. VIALA tells you what to do next — converting risk into dynamic fulfillment outcomes.
            </p>
          </div>

          {/* Three-part Workflow Wrapper */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-stretch">

            {/* Left Card: Traditional Operations */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="lg:col-span-4 rounded-[20px] p-8 border flex flex-col justify-between"
              style={{ background: '#F4F3F0', borderColor: PALETTE.border, opacity: 0.8 }}
            >
              <div>
                <div className="text-[0.68rem] font-bold tracking-[0.15em] uppercase text-[#717171] mb-6 inline-block bg-[#E8E5DF] px-2.5 py-1 rounded">
                  Traditional Operations
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-5" style={{ color: PALETTE.inkLight }}>
                  Traditional Inventory Management
                </h3>
                <ul className="space-y-4">
                  {[
                    'Expiry identified too late during audits',
                    'Manual return window calculation',
                    'Zero chain-of-custody audit logs',
                    'Lost inventory value is written off',
                  ].map((pt) => (
                    <li key={pt} className="flex gap-2.5 items-start">
                      <span className="text-red-500 font-bold text-sm leading-none mt-1">✕</span>
                      <span className="text-sm text-[#717171] leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12 pt-6 border-t border-[#E8E5DF]">
                <div className="text-xs font-semibold mb-1" style={{ color: PALETTE.inkMuted }}>Average Annual Loss</div>
                <div className="text-[2.2rem] font-extrabold tracking-tight" style={{ color: '#DC2626', fontFamily: 'var(--font-jakarta)' }}>
                  ₹4M+
                </div>
                <div className="text-[10px]" style={{ color: PALETTE.inkMuted }}>per 100-branch network, written off</div>
              </div>
            </motion.div>

            {/* Center: VIALA Decision Engine matching visual */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center py-8 lg:py-0 relative">
              
              {/* Outer SVG connector lines container */}
              <div className="absolute inset-0 hidden lg:block pointer-events-none">
                <svg className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Left to center path */}
                  <path d="M 0 160 Q 50 160, 100 200" stroke="#E8E5DF" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 0 260 Q 50 260, 100 220" stroke="#E8E5DF" strokeWidth="2" strokeDasharray="4 4" />
                  {/* Center to right path 1 */}
                  <path d="M 200 180 Q 250 120, 300 120" stroke="#E8E5DF" strokeWidth="2" />
                  {/* Center to right path 2 */}
                  <path d="M 200 240 Q 250 300, 300 300" stroke="#E8E5DF" strokeWidth="2" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-6 w-full px-4">
                
                {/* Medicine box */}
                <div className="bg-white border border-[#E8E5DF] rounded-xl px-4 py-2.5 shadow-sm text-center w-full max-w-[200px]">
                  <div className="text-[9px] font-bold text-[#717171] uppercase tracking-wider mb-0.5">Scanned Stock</div>
                  <div className="text-[11px] font-bold" style={{ color: PALETTE.ink }}>Amoxicillin 500mg</div>
                  <div className="text-[9px] text-[#DC2626] font-semibold mt-0.5">Expires in 28 Days</div>
                </div>

                {/* Arrow */}
                <div className="text-[#B45309] animate-bounce text-sm">↓</div>

                {/* Core Engine Box */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-[#0B1713] border border-[#152520] rounded-[18px] p-5 text-center w-full max-w-[200px] shadow-lg relative overflow-hidden"
                >
                  {/* Glowing background animation */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)' }} />

                  <div className="text-[8px] font-bold text-[#A7F3D0] uppercase tracking-[0.18em] mb-1 relative z-10">AI Pipeline</div>
                  <div className="text-[13px] font-extrabold text-white mb-2 relative z-10" style={{ fontFamily: 'var(--font-jakarta)' }}>Decision Engine</div>
                  
                  {/* Confidence Pill */}
                  <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5 relative z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
                    <span className="text-[9px] font-bold text-[#34D399]">96% Confidence</span>
                  </div>
                </motion.div>

                {/* Arrow */}
                <div className="text-[#059669] animate-pulse text-sm">↓</div>

                {/* Recommended outcome previews */}
                <div className="space-y-2 w-full max-w-[200px]">
                  <div className="bg-emerald-50 border border-emerald-200/50 rounded-lg px-3 py-1.5 flex justify-between items-center text-[10px]">
                    <span className="font-bold text-emerald-800">1. Vendor Return</span>
                    <span className="font-mono text-emerald-600 font-bold">100% Credit</span>
                  </div>
                  <div className="bg-orange-50 border border-orange-200/50 rounded-lg px-3 py-1.5 flex justify-between items-center text-[10px]">
                    <span className="font-bold text-orange-800">2. Branch Transfer</span>
                    <span className="font-mono text-orange-600 font-bold">Rescued SKU</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Card: Intelligent Outcomes (With VIALA) */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.15}
              className="lg:col-span-5 rounded-[24px] p-8 border-2 flex flex-col justify-between shadow-xl relative overflow-hidden"
              style={{ background: '#FFFFFF', borderColor: '#059669' }}
            >
              {/* Highlight ribbon */}
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#059669]" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="text-[0.68rem] font-bold tracking-[0.15em] uppercase text-white bg-[#059669] px-2.5 py-1 rounded">
                    Powered by VIALA
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Live System Active
                  </span>
                </div>

                <h3 className="text-xl font-bold tracking-tight mb-5" style={{ color: PALETTE.ink }}>
                  Intelligent Value Recovery
                </h3>

                <ul className="space-y-3.5 mb-8">
                  {[
                    'Real-time expiry forecasting per batch',
                    'Recommends optimal route (Return, Transfer, Sell)',
                    'Automated workflows & instant routing triggers',
                    'Audit trail generated and locked automatically',
                  ].map((pt) => (
                    <li key={pt} className="flex gap-2.5 items-start">
                      <span className="text-emerald-600 font-bold text-sm leading-none mt-1">✓</span>
                      <span className="text-sm leading-relaxed" style={{ color: PALETTE.inkLight }}>{pt}</span>
                    </li>
                  ))}
                </ul>

                {/* Interactive Mini-Dashboard Snippet */}
                <div className="rounded-xl border border-[#E8E5DF] bg-[#FAFAF9] p-4 relative overflow-hidden mb-6 shadow-sm">
                  <div className="flex justify-between items-start border-b border-[#E8E5DF]/60 pb-2.5 mb-3">
                    <div>
                      <div className="text-[11px] font-bold" style={{ color: PALETTE.ink }}>Amoxicillin 500mg</div>
                      <div className="text-[9px] text-[#717171] mt-0.5">Batch: AMX-453 · Exp: 15 Oct</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-[#B45309] bg-amber-50 border border-amber-200/50 rounded px-1.5 py-0.5 inline-block">
                        Risk Score: 89
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-[9px] text-[#717171] uppercase tracking-wider">Recommended Action</div>
                      <div className="text-[11px] font-bold text-[#059669]">Vendor Return (Full Credit)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-[#717171] uppercase tracking-wider">Est. Credit</div>
                      <div className="text-xs font-extrabold text-[#059669]">₹12,000</div>
                    </div>
                  </div>

                  {/* Interactive Button & Animation */}
                  {demoState === 'idle' && (
                    <button
                      onClick={startDemoSimulation}
                      className="w-full py-2 bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold rounded-lg transition-all shadow-sm hover:scale-[1.01]"
                    >
                      Initiate Recovery Path
                    </button>
                  )}
                  {demoState === 'running' && (
                    <div className="w-full py-2 bg-[#E8E5DF] text-[#717171] text-[11px] font-bold rounded-lg text-center flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                      Scanning Supplier Agreements...
                    </div>
                  )}
                  {demoState === 'completed' && (
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold rounded-lg text-center flex items-center justify-center gap-1.5"
                    >
                      <span>✓</span> Authorized & Submitted (Reclaimed ₹12,000)
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-[#E8E5DF] flex items-end justify-between">
                <div>
                  <div className="text-xs font-semibold mb-1" style={{ color: PALETTE.inkMuted }}>Value Recovered</div>
                  <div className="text-[2.2rem] font-extrabold tracking-tight leading-none" style={{ color: '#059669', fontFamily: 'var(--font-jakarta)' }}>
                    ₹12M
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: PALETTE.inkMuted }}>8–12x average annual ROI</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#059669] bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 inline-block">
                    +300% efficiency
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          OUTCOMES — Premium numbered cards
      ══════════════════════════════════════════════════════ */}
      <section id="outcomes" style={{ padding: '120px 0', background: PALETTE.surfaceAlt }}>
        <div className="container-tight">
          <div className="max-w-[600px] mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] mb-5 px-3 py-1.5 rounded-full border"
              style={{ background: PALETTE.card, borderColor: PALETTE.border, color: PALETTE.indigo }}>
              Outcome Journey
            </span>
            <h2 className="display-lg mt-2" style={{ color: PALETTE.ink }}>
              Every medicine gets<br />its highest-value path.
            </h2>
            <p className="mt-5 text-[1rem]" style={{ color: PALETTE.inkMuted }}>
              VIALA evaluates demand, margin, expiry windows, and logistics in real time —
              then surfaces the single best action.
            </p>
          </div>

          {/* Outcome Ecosystem Flowchart Banner */}
          <div className="hidden lg:flex items-center justify-between bg-white border border-[#E8E5DF] rounded-2xl p-6 mb-12 shadow-sm relative overflow-hidden">
            {/* Background pattern lines */}
            <div className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: 'linear-gradient(90deg, #F0EDE8 1px, transparent 1px)',
                backgroundSize: '32px 100%'
              }} />

            {/* Node 1 */}
            <div className="relative z-10 flex flex-col items-start gap-1">
              <span className="text-[9px] font-bold text-[#717171] uppercase tracking-wider">Input Stream</span>
              <div className="bg-[#F4F3F0] border border-[#E8E5DF] rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                Medicine Received
              </div>
            </div>

            {/* Path connector arrow */}
            <div className="flex-1 h-[2px] bg-[#E8E5DF] mx-4 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[9px] text-[#717171] font-mono">
                Scan & Analyze
              </div>
            </div>

            {/* Node 2 */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Evaluation</span>
              <div className="bg-[#0B1713] border border-[#152520] rounded-lg px-4 py-1.5 text-xs font-extrabold text-white flex items-center gap-2 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                Decision Engine
              </div>
            </div>

            {/* Path connector arrow */}
            <div className="flex-1 h-[2px] bg-[#E8E5DF] mx-4 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[9px] text-[#717171] font-mono">
                Determine Route
              </div>
            </div>

            {/* Node 3 */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold text-teal-600 uppercase tracking-wider">Dynamic Channels</span>
              <div className="bg-white border border-[#E8E5DF] rounded-lg px-3 py-1 text-[11px] font-bold flex gap-1 shadow-sm">
                <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">Sell</span>
                <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-100">Return</span>
                <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100">Transfer</span>
              </div>
            </div>

            {/* Path connector arrow */}
            <div className="flex-1 h-[2px] bg-[#E8E5DF] mx-4 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[9px] text-[#717171] font-mono">
                Execution
              </div>
            </div>

            {/* Node 4 */}
            <div className="relative z-10 flex flex-col items-end gap-1">
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Output Value</span>
              <div className="bg-[#059669] border border-emerald-700 text-white rounded-lg px-3 py-1.5 text-xs font-extrabold shadow-sm">
                Recovered Value
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OUTCOMES.map((o, i) => (
              <motion.div
                key={o.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i * 0.08}
                whileHover={{
                  y: -5,
                  boxShadow: `0 12px 40px ${o.color}16`,
                  borderColor: o.color,
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOutcome(o)}
                className="group rounded-[16px] p-7 border cursor-pointer transition-all duration-300 relative overflow-hidden"
                style={{ background: PALETTE.card, borderColor: PALETTE.border }}
              >
                {/* Visual hover background accent */}
                <div
                  className="absolute top-0 right-0 w-[80px] h-[80px] rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-[0.06] transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${o.color}, transparent)` }}
                />

                {/* Top row: number + icon */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl font-mono font-black tracking-tight" style={{ color: o.color }}>{o.id}</span>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                    style={{ background: o.lightBg }}>
                    <o.icon className="w-5 h-5" style={{ color: o.color }} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-[1.05rem] font-bold tracking-tight mb-1" style={{ color: PALETTE.ink }}>{o.title}</h3>

                {/* Status sub-labels */}
                <div className="flex items-center justify-between mb-4 text-[9px] font-bold tracking-tight">
                  <span style={{ color: o.color }}>{o.metaLabel}</span>
                  <span className="opacity-60">{o.metaValue}</span>
                </div>

                {/* Desc */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: PALETTE.inkMuted }}>{o.desc}</p>

                {/* Dynamic Real UI Preview Snippet */}
                <div className="mb-5 p-3 bg-[#FAFAF8] rounded-xl border border-[#E8E5DF] text-[9px] font-medium text-[#717171] space-y-1.5 font-mono">
                  {o.id === '01' && (
                    <>
                      <div className="text-[8px] font-bold text-[#0F172A] border-b pb-1 mb-1">Active Bid Registry</div>
                      <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        <span>Apollo Pharma (Delhi)</span>
                        <span>₹480/unit</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>MedPlus (Mumbai Hub)</span>
                        <span>₹460/unit</span>
                      </div>
                    </>
                  )}
                  {o.id === '02' && (
                    <>
                      <div className="text-[8px] font-bold text-[#0F172A] border-b pb-1 mb-1">Distributor Credit Claim</div>
                      <div className="flex justify-between">
                        <span>Distributor:</span>
                        <span className="font-bold text-[#0F172A]">Cipla Ltd</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Refund Policy:</span>
                        <span>100% Credit Match</span>
                      </div>
                    </>
                  )}
                  {o.id === '03' && (
                    <>
                      <div className="text-[8px] font-bold text-[#0F172A] border-b pb-1 mb-1">Transit Route Manifest</div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#0F172A]">Delhi Hub</span>
                        <span className="text-emerald-500">──►</span>
                        <span className="font-bold text-[#0F172A]">Mumbai Hub</span>
                      </div>
                      <div className="text-[8px] font-bold text-[#10B981] animate-pulse">✓ Courier Manifest Ready</div>
                    </>
                  )}
                  {o.id === '04' && (
                    <>
                      <div className="text-[8px] font-bold text-[#0F172A] border-b pb-1 mb-1">Turnover Forecast Index</div>
                      <div className="flex justify-between">
                        <span>Loc A (Deficit):</span>
                        <span className="font-bold text-emerald-600">9.2/10 Index</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loc B (Surplus):</span>
                        <span className="font-bold text-[#D4A017]">1.8/10 Index</span>
                      </div>
                    </>
                  )}
                  {o.id === '05' && (
                    <>
                      <div className="text-[8px] font-bold text-[#0F172A] border-b pb-1 mb-1">Schedule M Donation Certificate</div>
                      <div className="flex justify-between">
                        <span>NGO Partner:</span>
                        <span className="font-bold text-[#0F172A]">Red Cross India</span>
                      </div>
                      <div className="text-[8px] text-emerald-600 font-bold">✓ Tax Deductible Code Sync</div>
                    </>
                  )}
                  {o.id === '06' && (
                    <>
                      <div className="text-[8px] font-bold text-[#0F172A] border-b pb-1 mb-1">Secure Destruction ledger</div>
                      <div className="flex justify-between">
                        <span>Licensed Handler:</span>
                        <span className="font-bold text-[#0F172A]">MediWaste Ltd</span>
                      </div>
                      <div className="text-[7px] text-[#717171] truncate">SHA-256: 8b29cf...902a</div>
                    </>
                  )}
                </div>

                {/* Metric bar */}
                <div className="pt-5 border-t flex items-end justify-between" style={{ borderColor: PALETTE.borderLight }}>
                  <div>
                    <div className="text-[1.5rem] font-extrabold leading-none"
                      style={{ fontFamily: 'var(--font-jakarta)', color: o.color, letterSpacing: '-0.03em' }}>
                      {o.metric}
                    </div>
                    <div className="text-[0.7rem] mt-1" style={{ color: PALETTE.inkMuted }}>{o.metricLabel}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200"
                    style={{ color: o.color }}>
                    Details <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/outcomes"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-[10px] border transition-all"
              style={{ background: PALETTE.card, color: PALETTE.ink, borderColor: PALETTE.border }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F0EDE8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = PALETTE.card; }}
            >
              Explore all six outcomes in detail <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          OPERATIONAL ENVIRONMENTS — Premium cards with flow diagrams
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '120px 0', background: PALETTE.surface }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flowDot {
            0% { left: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
          }
          .animate-flow-dot {
            animation: flowDot 3s infinite linear;
          }
        `}} />
        <div className="container-tight">
          <div className="max-w-[540px] mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] mb-5 px-3 py-1.5 rounded-full border"
              style={{ background: PALETTE.card, borderColor: PALETTE.border, color: PALETTE.indigo }}>
              Operational Environments
            </span>
            <h2 className="display-lg mt-2" style={{ color: PALETTE.ink }}>
              Designed for your<br />operational reality.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Card: Pharmacy Chains (Col Span 7) */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.1}
              className="lg:col-span-7 flex flex-col rounded-[18px] border overflow-hidden group hover:border-[#059669] transition-all duration-300"
              style={{ background: PALETTE.card, borderColor: PALETTE.border, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
            >
              {/* Accent top bar */}
              <div className="h-1 bg-[#059669]" />

              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  {/* Tag */}
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded self-start mb-6 inline-block bg-[#ECFDF5] text-[#059669]">
                    RETAIL PHARMACY
                  </span>

                  <h3 className="text-2xl font-bold mb-4 tracking-tight" style={{ color: PALETTE.ink, fontFamily: 'var(--font-jakarta)' }}>
                    Pharmacy Chains
                  </h3>
                  <p className="text-sm leading-[1.75] mb-8 text-[#717171]">
                    Multi-location visibility. See every SKU across every branch — with AI-ranked recommendations before anything expires.
                  </p>
                  {/* Visual Image */}
                  <div className="relative overflow-hidden rounded-xl border border-[#E8E5DF] bg-[#FAFAF9] h-[340px] mb-8 group">
                    <Image
                      src="/images/pharmacy_inventory.png"
                      alt="Pharmacy Inventory"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-[#059669] px-2.5 py-1 rounded">
                        Active Shelf Scan
                      </span>
                      <span className="text-[10px] text-emerald-100 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
                        AI Track Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics footer */}
                <div className="pt-6 border-t flex flex-wrap gap-8 items-center justify-start" style={{ borderColor: PALETTE.borderLight }}>
                  <div>
                    <div className="text-[2.2rem] font-extrabold leading-tight tracking-tight text-[#059669]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                      ₹18L
                    </div>
                    <div className="text-xs text-[#717171]">Recovered annually</div>
                  </div>
                  <div className="w-[1px] h-10 bg-[#E8E5DF] hidden sm:block" />
                  <div>
                    <div className="text-[2.2rem] font-extrabold leading-tight tracking-tight text-[#059669]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                      91%
                    </div>
                    <div className="text-xs text-[#717171]">Waste reduction</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Stacked Hospital and Healthcare Cards (Col Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Stack Card 1: Hospital Networks */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.2}
                className="flex flex-col rounded-[18px] border overflow-hidden flex-1 group hover:border-[#0D9488] transition-all duration-300"
                style={{ background: PALETTE.card, borderColor: PALETTE.border, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
              >
                {/* Accent top bar */}
                <div className="h-1 bg-[#0D9488]" />

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded self-start mb-4 inline-block bg-[#F0FDFA] text-[#0D9488]">
                      HEALTH SYSTEMS
                    </span>
                    <h3 className="text-lg font-bold mb-2 tracking-tight text-[#0A0A0A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                      Hospital Networks
                    </h3>
                    <p className="text-xs leading-relaxed mb-4 text-[#717171]">
                      Hospital-grade compliance architecture. Department-level control with a full audit trail built for your next regulatory review.
                    </p>
                    {/* Visual Image */}
                    <div className="relative overflow-hidden rounded-xl border border-[#E8E5DF] bg-[#FAFAF9] h-36 mb-4 group">
                      <Image
                        src="/images/hospital_inventory.png"
                        alt="Hospital Clinical Cold Storage"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 30vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10">
                        <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-[#0D9488] px-2 py-0.5 rounded">
                          Cold-Chain Vault
                        </span>
                        <span className="text-[9px] text-teal-100 font-mono font-bold">
                          +4.2°C Locked
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stat */}
                  <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: PALETTE.borderLight }}>
                    <div>
                      <div className="text-[1.8rem] font-extrabold leading-none tracking-tight text-[#0D9488]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                        0
                      </div>
                      <div className="text-[10px] mt-1 text-[#717171]">Audit failures (HIPAA Compliance)</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stack Card 2: Healthcare Networks */}
              <motion.div
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.3}
                className="flex flex-col rounded-[18px] border overflow-hidden flex-1 group hover:border-[#B45309] transition-all duration-300"
                style={{ background: PALETTE.card, borderColor: PALETTE.border, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
              >
                {/* Accent top bar */}
                <div className="h-1 bg-[#B45309]" />

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded self-start mb-4 inline-block bg-[#FFFBEB] text-[#B45309]">
                      NETWORKED CARE
                    </span>
                    <h3 className="text-lg font-bold mb-2 tracking-tight text-[#0A0A0A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                      Healthcare Networks
                    </h3>
                    <p className="text-xs leading-relaxed mb-4 text-[#717171]">
                      Intelligence at scale. Redistribute inventory across your entire network to where it is needed most — automatically.
                    </p>
                    {/* Visual Image */}
                    <div className="relative overflow-hidden rounded-xl border border-[#E8E5DF] bg-[#FAFAF9] h-36 mb-4 group">
                      <Image
                        src="/images/network_map.png"
                        alt="Network Logistics Map"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 30vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10">
                        <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-[#B45309] px-2 py-0.5 rounded">
                          Logistics Routing
                        </span>
                        <span className="text-[9px] text-orange-100 font-bold flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-orange-400 animate-ping" />
                          98.2% Efficiency
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stat */}
                  <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: PALETTE.borderLight }}>
                    <div>
                      <div className="text-[1.8rem] font-extrabold leading-none tracking-tight text-[#B45309]" style={{ fontFamily: 'var(--font-jakarta)' }}>
                        8×
                      </div>
                      <div className="text-[10px] mt-1 text-[#717171]">Year-One Average ROI</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MISSION CONTROL SHOWCASE — Full-width interactive dashboard UI
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 relative bg-white border-b" style={{ borderColor: PALETTE.border }}>
        <div className="container-tight">
          
          <div className="text-center max-w-[620px] mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#10B981] bg-[#ECFDF5] px-3 py-1 rounded-full border border-emerald-100">
              Product Demo
            </span>
            <h2 className="text-3xl font-extrabold mt-3 tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Interactive Mission Control
            </h2>
            <p className="mt-3 text-sm text-[#717171]">
              This is the actual VIALA software. Click the action button below to witness how a pharmacist approves an automated rebalancing match in real-time.
            </p>
          </div>

          {/* Browser Window Wrapper */}
          <div className="rounded-2xl border bg-[#FAFAF8] overflow-hidden shadow-2xl relative" style={{ borderColor: PALETTE.border }}>
            {/* macOS Chrome Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-[#ECEAE6]" style={{ borderColor: PALETTE.border }}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <span className="w-3 h-3 rounded-full bg-[#28CA41]" />
                <span className="text-[11px] font-mono text-[#717171] ml-4 bg-white px-3 py-1 rounded border">
                  app.viala.in/mission-control/dashboard
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-800">PMS API ONLINE</span>
              </div>
            </div>

            {/* Dashboard Shell */}
            <div className="flex flex-col lg:flex-row min-h-[480px] bg-white">
              
              {/* Sidebar */}
              <div className="w-full lg:w-[200px] bg-[#0F172A] text-white p-4 flex flex-col justify-between border-r border-[#1E293B] flex-shrink-0">
                <div className="space-y-6">
                  <div className="font-bold text-sm tracking-widest text-[#10B981]">VIALA INTEL</div>
                  <div className="space-y-1">
                    {[
                      { name: 'Mission Control', active: true },
                      { name: 'Expiry Monitor', active: false },
                      { name: 'Vendor returns', active: false },
                      { name: 'Transfer ledger', active: false },
                      { name: 'Compliance check', active: false }
                    ].map(item => (
                      <div key={item.name} className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${item.active ? 'bg-slate-800 text-white border-l-2 border-[#10B981]' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500">
                  Store ID: DEL-90823
                </div>
              </div>

              {/* Main Panel Content */}
              <div className="flex-1 p-6 flex flex-col justify-between min-w-0 bg-[#FAFAF8]">
                <div>
                  
                  {/* Top Stats Band */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                      <div className="text-[10px] font-bold text-[#717171] uppercase tracking-wider mb-1">Total Recoverable</div>
                      <div className="text-xl font-extrabold text-[#0F172A]">₹12,40,200</div>
                      <div className="text-[9px] text-[#10B981] font-bold mt-1">1,480 items scanned</div>
                    </div>
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                      <div className="text-[10px] font-bold text-[#717171] uppercase tracking-wider mb-1">Rebalance Matches</div>
                      <div className="text-xl font-extrabold text-[#10B981]">14 Opportunities</div>
                      <div className="text-[9px] text-[#717171] mt-1">Average delivery time: 6 hrs</div>
                    </div>
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                      <div className="text-[10px] font-bold text-[#717171] uppercase tracking-wider mb-1">Action Progress</div>
                      <div className="text-xl font-extrabold text-[#D4A017]">84% Automated</div>
                      <div className="text-[9px] text-[#10B981] font-bold mt-1">98.4% Accuracy</div>
                    </div>
                  </div>

                  {/* Active Expiry Risk Monitor Row Item */}
                  <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b bg-[#FAFAF8] flex justify-between items-center">
                      <span className="text-xs font-bold text-[#0F172A]">Active Expiry Action Center</span>
                      <span className="text-[10px] text-[#717171] font-mono">Filter: Expiry &lt; 60 Days</span>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Active Row that changes based on demoState */}
                      <div className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 ${demoState === 'completed' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-[#E8E5DF]'}`}>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-[#0F172A]">Amoxicillin 500mg (Batch AMX-453)</span>
                            <span className="text-[9px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">28 Days Left</span>
                          </div>
                          <div className="text-[10px] text-[#717171] space-y-0.5 font-mono">
                            <div>From: <span className="font-bold text-[#0F172A]">Delhi Hub</span> (Surplus, 120 units)</div>
                            <div>To: <span className="font-bold text-[#0F172A]">Mumbai</span> (Shortage matched)</div>
                          </div>
                        </div>

                        {/* Interactive trigger Button */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-emerald-600">₹48,000 Value</div>
                            <div className="text-[9px] text-[#717171]">100% margin recovery</div>
                          </div>

                          {demoState === 'idle' && (
                            <button
                              onClick={startDemoSimulation}
                              className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all bg-[#10B981] hover:bg-emerald-600 shadow-sm w-full sm:w-auto text-center"
                            >
                              Approve Transfer Match
                            </button>
                          )}
                          {demoState === 'running' && (
                            <button
                              disabled
                              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600/80 cursor-not-allowed w-full sm:w-auto text-center flex items-center justify-center gap-2"
                            >
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                              Authorizing...
                            </button>
                          )}
                          {demoState === 'completed' && (
                            <div className="px-4 py-2 rounded-lg text-xs font-bold bg-[#ECFDF5] border border-emerald-200 text-emerald-700 w-full sm:w-auto text-center flex items-center justify-center gap-1.5 shadow-sm">
                              <Check className="w-3.5 h-3.5" /> Approved & Dispatched
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Log trace preview displayed under active row if completed */}
                      {demoState === 'completed' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg bg-[#0F172A] text-emerald-400 p-3 font-mono text-[9px] space-y-1 shadow-inner"
                        >
                          <div>[SYSTEM_OK] Transfer authorization matches validated successfully.</div>
                          <div>[LOGISTICS] Manifest TRN-908234-DEL-MUM locked in network database.</div>
                          <div>[PMS_INTEGRATION] Pushed stock record updates: Delhi (-120 units), Mumbai (+120 units).</div>
                          <div>[LEDGER] Hash encrypted: 8a9df2...92bf (Schedule M Audit Safe)</div>
                        </motion.div>
                      )}

                    </div>
                  </div>

                </div>

                <div className="mt-6 pt-4 border-t border-[#E8E5DF] flex items-center justify-between text-[10px] text-[#717171]">
                  <span>Operational Status: Fully Integrated</span>
                  <span>PMS Sync: 90s ago</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          ENTERPRISE TRUST — Image + bullets
      ══════════════════════════════════════════════════════ */}
      <section style={{ padding: '120px 0', background: PALETTE.surfaceAlt }}>
        <div className="container-tight">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Mock Audit Trail UI Screen */}
            <motion.div
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="rounded-[20px] overflow-hidden border border-[#E8E5DF] order-2 lg:order-1 shadow-2xl bg-[#FAFAF8]"
            >
              {/* Terminal header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-[#ECEAE6]" style={{ borderColor: PALETTE.border }}>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-700" />
                  <span className="text-[10px] font-mono text-[#717171] uppercase tracking-wider font-bold">Secure Compliance Audit Ledger</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">IMMUTABLE LOGS</span>
              </div>
              
              {/* Ledger log lines */}
              <div className="p-5 font-mono text-[9.5px] leading-relaxed space-y-2 bg-[#0F172A] text-slate-300 min-h-[300px]">
                <div className="text-slate-500">// CDSCO & FDA Compliance Active Sync</div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[#10B981]">[VERIFIED]</span>
                  <span>Batch AMX-453 Transfer Approved</span>
                  <span className="text-slate-500 font-bold">02:14:10</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[#10B981]">[VERIFIED]</span>
                  <span>Distributor Cipla Return Claim Sent</span>
                  <span className="text-slate-500 font-bold">02:12:04</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-amber-500">[OVERRIDE]</span>
                  <span>Admin AK Authorized Delhi Hub Sync</span>
                  <span className="text-slate-500 font-bold">02:10:00</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[#10B981]">[SECURE]</span>
                  <span>SHA-256 Block Encrypted & Recorded</span>
                  <span className="text-slate-500 font-bold">02:08:44</span>
                </div>
                <div className="text-slate-500 pt-2 text-[8px]">
                  System signature keys: cdsco-guideline-v2-active | fda-cfr-11-verified
                </div>
              </div>

              {/* Badges footer */}
              <div className="p-4 bg-white border-t border-[#E8E5DF] flex flex-wrap gap-4 justify-around items-center">
                <div className="text-center">
                  <div className="text-[10px] font-extrabold text-[#0F172A]">HIPAA</div>
                  <div className="text-[8px] text-[#717171] uppercase font-semibold">Compliant</div>
                </div>
                <div className="w-[1px] h-6 bg-[#E8E5DF]" />
                <div className="text-center">
                  <div className="text-[10px] font-extrabold text-[#0F172A]">SOC-2</div>
                  <div className="text-[8px] text-[#717171] uppercase font-semibold">Certified</div>
                </div>
                <div className="w-[1px] h-6 bg-[#E8E5DF]" />
                <div className="text-center">
                  <div className="text-[10px] font-extrabold text-[#0F172A]">FDA</div>
                  <div className="text-[8px] text-[#717171] uppercase font-semibold">CFR Part 11</div>
                </div>
                <div className="w-[1px] h-6 bg-[#E8E5DF]" />
                <div className="text-center">
                  <div className="text-[10px] font-extrabold text-[#0F172A]">CDSCO</div>
                  <div className="text-[8px] text-[#717171] uppercase font-semibold">Compliant</div>
                </div>
              </div>
            </motion.div>

            {/* Text side */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.15}
              className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] mb-6 px-3 py-1.5 rounded-full border"
                style={{ background: PALETTE.card, borderColor: PALETTE.border, color: PALETTE.inkLight }}>
                Enterprise-Grade
              </span>
              <h2 className="display-md mt-2 mb-6" style={{ color: PALETTE.ink }}>
                Built to meet the highest standards of healthcare compliance.
              </h2>
              <p className="text-[1rem] leading-relaxed mb-10" style={{ color: PALETTE.inkMuted }}>
                VIALA is architected from the ground up for healthcare operations — not retrofitted.
                Every component is built with compliance, auditability, and resilience in mind.
              </p>

              <div className="space-y-6">
                {[
                  { icon: ShieldCheck, title: 'HIPAA-aligned architecture', desc: 'End-to-end encryption, role-based access controls, and comprehensive audit logs.' },
                  { icon: Clock, title: 'Real-time across your network', desc: 'Live inventory visibility updated every 90 seconds across every location.' },
                  { icon: Zap, title: 'Instant PMS integration', desc: 'Works alongside your existing pharmacy management system with zero disruption.' },
                ].map((t) => (
                  <div key={t.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0"
                      style={{ background: '#ECFDF5' }}>
                      <t.icon className="w-5 h-5" style={{ color: '#059669' }} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1" style={{ color: PALETTE.ink }}>{t.title}</div>
                      <div className="text-sm leading-relaxed" style={{ color: PALETTE.inkMuted }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link href="/get-started"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] text-sm font-semibold transition-all"
                  style={{ background: PALETTE.ink, color: '#FFFFFF' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.22)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  Talk to our solutions team <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ── INTERACTIVE OUTCOME DETAILS OVERLAY ── */}
      <AnimatePresence>
        {selectedOutcome && (() => {
          const details = OUTCOME_DETAILS[selectedOutcome.id];
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-md"
              onClick={() => setSelectedOutcome(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="relative bg-[#FAFAF9] border border-[#E8E5DF] rounded-[24px] shadow-2xl max-w-[900px] w-full overflow-hidden flex flex-col md:flex-row"
                style={{ maxHeight: '90vh' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedOutcome(null)}
                  className="absolute top-5 right-5 z-10 p-2 rounded-full border bg-white/80 hover:bg-white border-[#E8E5DF] text-[#717171] hover:text-[#0A0A0A] shadow-sm transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Left Side: CSS Visual Node Diagram */}
                <div className="w-full md:w-[48%] p-8 border-b md:border-b-0 md:border-r border-[#E8E5DF] flex flex-col justify-between" style={{ background: '#F4F3F0' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[0.65rem] font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded" style={{ color: selectedOutcome.color, background: selectedOutcome.lightBg }}>
                        Outcome {selectedOutcome.id}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight mb-3" style={{ color: PALETTE.ink, fontFamily: 'var(--font-jakarta)' }}>
                      {selectedOutcome.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-8" style={{ color: PALETTE.inkMuted }}>
                      Interactive visual of how VIALA automated systems route stock items to this outcome.
                    </p>

                    {/* Pipeline diagram */}
                    <div className="space-y-6 relative pl-3">
                      {/* Vertical line indicator */}
                      <div className="absolute left-[21px] top-4 bottom-4 w-[2px] bg-[#E8E5DF]" />

                      {details?.pipeline.map((p, idx) => (
                        <div key={p.step} className="flex gap-4 items-start relative z-10">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                            style={{ background: idx === 2 ? selectedOutcome.color : '#717171' }}>
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-xs font-bold" style={{ color: PALETTE.ink }}>{p.step}</div>
                            <div className="text-[10px] mt-0.5" style={{ color: PALETTE.inkMuted }}>{p.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#E8E5DF]">
                    <div className="text-xs font-semibold mb-1" style={{ color: PALETTE.inkMuted }}>Key Value Reclaimed</div>
                    <div className="text-[1.8rem] font-extrabold tracking-tight" style={{ color: selectedOutcome.color, fontFamily: 'var(--font-jakarta)' }}>
                      {details?.recovered}
                    </div>
                    <div className="text-[10px] mt-1" style={{ color: PALETTE.inkMuted }}>
                      {details?.timeline}
                    </div>
                  </div>
                </div>

                {/* Right Side: Mock DB Diagnostics & Monospace logs */}
                <div className="w-full md:w-[52%] p-8 flex flex-col justify-between bg-white">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.08em] mb-4" style={{ color: PALETTE.inkLight }}>
                      System Trace Logs
                    </h4>
                    
                    {/* Dark terminal-like log screen */}
                    <div className="rounded-xl p-5 font-mono text-[10px] leading-relaxed overflow-y-auto mb-6 shadow-inner"
                      style={{ background: '#0B1713', color: '#A7F3D0', height: '240px' }}>
                      <div className="opacity-40 mb-2">// VIALA Core-AI Expiry Engine. Version 1.0.4</div>
                      {details?.logs.map((log, lidx) => (
                        <div key={lidx} className="mb-2.5 last:mb-0">
                          <span className="opacity-30 mr-1.5">{`0${lidx + 1}:`}</span>
                          {log}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg p-3.5 border border-[#E8E5DF] bg-[#FAFAF9]">
                        <div className="text-[9px] font-bold uppercase tracking-[0.05em] opacity-50 mb-0.5">Automation Rate</div>
                        <div className="text-lg font-bold text-[#059669]">98.4%</div>
                      </div>
                      <div className="rounded-lg p-3.5 border border-[#E8E5DF] bg-[#FAFAF9]">
                        <div className="text-[9px] font-bold uppercase tracking-[0.05em] opacity-50 mb-0.5">Compliance SLA</div>
                        <div className="text-lg font-bold text-[#0D9488]">Zero Risk</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#E8E5DF] flex gap-3">
                    <button
                      onClick={() => setSelectedOutcome(null)}
                      className="flex-1 py-3 px-4 rounded-xl text-center text-xs font-semibold border border-[#E8E5DF] hover:bg-[#F4F3F0] transition-colors"
                    >
                      Close Trace
                    </button>
                    <Link
                      href="/get-started"
                      className="flex-1 py-3 px-4 rounded-xl text-center text-xs font-semibold text-white transition-all shadow-sm"
                      style={{ background: selectedOutcome.color }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(0.92)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'none'; }}
                    >
                      Authorize Execution →
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
