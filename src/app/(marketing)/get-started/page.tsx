'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, TrendingUp, RotateCcw,
  Shield, Clock, Loader2, AlertCircle, ChevronRight,
} from 'lucide-react';


// ── Types ─────────────────────────────────────────────────────────────────────
type FormData = {
  full_name: string;
  work_email: string;
  phone: string;
  organization_name: string;
  organization_type: string;
  locations: string;
  message: string;
};

const INITIAL_FORM: FormData = {
  full_name: '',
  work_email: '',
  phone: '',
  organization_name: '',
  organization_type: 'Pharmacy Chain',
  locations: '',
  message: '',
};

const VALUE_PROPS = [
  { icon: TrendingUp, label: 'Recover Hidden Inventory Value', desc: 'Identify recoverable medicine stock 60–90 days before expiry.' },
  { icon: RotateCcw, label: 'Intelligent Recovery Workflows', desc: 'Automated pathways for returns, transfers, and redistribution.' },
  { icon: Shield, label: 'Compliance Documentation', desc: 'Audit-ready records for every recovery action taken.' },
  { icon: Clock, label: '14-Day Implementation', desc: 'Connected to your PMS in read-only mode with zero downtime.' },
];

// ── Input Component ────────────────────────────────────────────────────────────
function Field({
  id, label, required, children,
}: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="block text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-2 transition-colors group-focus-within:text-[#059669]"
      >
        {label}{required && <span className="text-[#F87171] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-3 min-h-[46px] rounded-xl border border-[#E4E0D9] bg-white/80 text-sm text-[#0D2B1A] placeholder-[#C4BDB4] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] transition-all';

const selectCls =
  'w-full px-4 py-3 min-h-[46px] rounded-xl border border-[#E4E0D9] bg-white/80 text-sm text-[#0D2B1A] focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] transition-all appearance-none cursor-pointer';

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GetStartedPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [requestId, setRequestId] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/book-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Something went wrong.');
      const now = new Date();
      setRequestId(`VLA-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getTime()).slice(-5)}`);
      setSubmittedAt(now.toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
      setStep(2);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex flex-col lg:flex-row bg-[#F8FAF9]">

      {/* ══════════════════════════════════════════════════════════════════════
          LEFT PANEL — Dark brand column
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:w-[42%] xl:w-[38%] bg-[#022C22] relative overflow-hidden flex flex-col">

        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(255,255,255,1) 47px, rgba(255,255,255,1) 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(255,255,255,1) 47px, rgba(255,255,255,1) 48px)' }}
        />
        {/* Emerald glow */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%)' }}
        />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 100%, rgba(6,95,70,0.35) 0%, transparent 60%)' }}
        />

        <div className="relative z-10 flex flex-col flex-1 p-8 xl:p-12">

          {/* Step 1 left content */}
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-8">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-[#34D399] bg-[#034032] px-3 py-1.5 rounded-full mb-5 border border-[#065F46]">
                  Book a Demo
                </span>
                <h1 className="text-3xl xl:text-[2.6rem] font-black text-white leading-[1.15] tracking-tight mb-4">
                  Talk to Our<br />
                  <span className="text-[#34D399]">Solutions</span><br />
                  <span className="text-[#34D399]">Team.</span>
                </h1>
                <p className="text-[13px] text-[#4A7A68] leading-relaxed max-w-[300px]">
                  Tell us about your healthcare network. Our solutions team will analyze your inventory operations.
                </p>
              </div>

              {/* Value props */}
              <div className="space-y-2.5">
                {VALUE_PROPS.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3.5 p-3.5 rounded-xl border border-[#0D3D2C] bg-[#031A13]/80 backdrop-blur-sm">
                    <div className="w-7 h-7 rounded-lg bg-[#065F46] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-[#34D399]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white mb-0.5">{label}</p>
                      <p className="text-[11px] text-[#3A6B58] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[10px] text-[#1E4030]">
                No commitment required · Response within 24 hours
              </p>
            </div>
          )}

          {/* Step 2 left content */}
          {step === 2 && (
            <div className="flex-1 flex flex-col justify-center">
              <div className="w-16 h-16 rounded-full bg-[#065F46] border border-[#047857] flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#34D399]" />
              </div>
              <h2 className="text-2xl xl:text-3xl font-black text-white mb-3 leading-tight">
                Your request<br />is confirmed.
              </h2>
              <p className="text-[13px] text-[#4A7A68] leading-relaxed max-w-[280px] mb-8">
                Our healthcare solutions team will review your requirements and reach out within 24 hours.
              </p>
              <div className="space-y-3">
                {['Team reviews your profile', 'Solutions specialist contacts you', 'Tailored assessment presented'].map((t, i) => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#034032] border border-[#065F46] text-[#34D399] text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</div>
                    <span className="text-[12px] text-[#3A6B58]">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom branding */}
          <p className="relative z-10 text-[9px] text-[#1A3D2B] font-mono mt-8">
            VIALA Technologies · Healthcare Recovery Intelligence
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT PANEL — Form / Success
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-14 lg:py-12">

        {/* ── STEP 1 — Form ── */}
        {step === 1 && (
          <div className="w-full max-w-[520px]">

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#059669] flex items-center justify-center">
                  <span className="text-[9px] font-black text-white">1</span>
                </div>
                <span className="text-[11px] font-bold text-[#059669]">Your Details</span>
              </div>
              <ChevronRight className="w-3 h-3 text-[#D1CEC9]" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#E4E0D9] flex items-center justify-center">
                  <span className="text-[9px] font-bold text-[#9CA3AF]">2</span>
                </div>
                <span className="text-[11px] font-medium text-[#9CA3AF]">Confirmation</span>
              </div>
            </div>

            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0D2B1A] tracking-tight mb-2">
                Book a Demo
              </h2>
              <p className="text-[13px] text-[#9CA3AF]">
                Tell us about your organization and we&apos;ll prepare a personalized walkthrough.
              </p>
            </div>

            {/* Error */}
            {errorMsg && (
              <div role="alert" aria-live="assertive" className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-5">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field id="full_name" label="Full Name" required>
                  <input id="full_name" name="full_name" type="text" required autoComplete="name"
                    value={formData.full_name} onChange={handleChange} placeholder="Dr. Anish Patel" className={inputCls} />
                </Field>
                <Field id="phone" label="Phone Number">
                  <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel"
                    value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputCls} />
                </Field>
              </div>

              {/* Work Email */}
              <Field id="work_email" label="Work Email" required>
                <input id="work_email" name="work_email" type="email" required autoComplete="email" inputMode="email"
                  value={formData.work_email} onChange={handleChange} placeholder="anish@apollocare.com" className={inputCls} />
              </Field>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field id="organization_name" label="Organization" required>
                  <input id="organization_name" name="organization_name" type="text" required autoComplete="organization"
                    value={formData.organization_name} onChange={handleChange} placeholder="Apollo Care Network" className={inputCls} />
                </Field>
                <Field id="organization_type" label="Organization Type">
                  <div className="relative">
                    <select id="organization_type" name="organization_type"
                      value={formData.organization_type} onChange={handleChange} className={selectCls}>
                      <option>Pharmacy Chain</option>
                      <option>Hospital Group</option>
                      <option>Clinic Network</option>
                      <option>Distributor</option>
                      <option>Healthcare Enterprise</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] rotate-90 pointer-events-none" />
                  </div>
                </Field>
              </div>

              {/* Locations */}
              <Field id="locations" label="Number of Locations">
                <div className="relative">
                  <select id="locations" name="locations" value={formData.locations} onChange={handleChange} className={selectCls}>
                    <option value="">Select range</option>
                    <option>1–5</option>
                    <option>6–20</option>
                    <option>21–50</option>
                    <option>51–100</option>
                    <option>100+</option>
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] rotate-90 pointer-events-none" />
                </div>
              </Field>

              {/* Message */}
              <Field id="message" label="Tell Us About Your Challenge">
                <textarea id="message" name="message" rows={3} value={formData.message} onChange={handleChange}
                  placeholder="Describe your current inventory challenges, expiry losses, or what you'd like VIALA to solve..."
                  className={`${inputCls} resize-none`} />
              </Field>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-4 min-h-[52px] rounded-xl bg-[#065F46] hover:bg-[#047857] active:bg-[#065F46] text-white font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 mt-1"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                  : <>Book a Demo <ArrowRight className="w-4 h-4" /></>
                }
              </button>

              <p className="text-center text-[10px] text-[#B0AA9F] pt-1">
                Your information is secure and will never be shared with third parties.
              </p>
            </form>

            <p className="mt-8 text-center text-[12px] text-[#9CA3AF]">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#059669] hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* ── STEP 2 — Confirmation ── */}
        {step === 2 && (
          <div className="w-full max-w-[480px]">

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#E4E0D9] flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                </div>
                <span className="text-[11px] font-medium text-[#9CA3AF]">Your Details</span>
              </div>
              <ChevronRight className="w-3 h-3 text-[#D1CEC9]" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#059669] flex items-center justify-center">
                  <span className="text-[9px] font-black text-white">2</span>
                </div>
                <span className="text-[11px] font-bold text-[#059669]">Confirmation</span>
              </div>
            </div>

            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0D2B1A] tracking-tight mb-2">
                Demo Request<br />Received
              </h2>
              <p className="text-[13px] text-[#9CA3AF]">
                Our healthcare solutions team will review your details and contact you within 24 hours to schedule your demo.
              </p>
            </div>

            {/* Demo Details */}
            <div className="bg-white rounded-2xl border border-[#E4E0D9] shadow-sm overflow-hidden mb-5">
              <div className="px-6 py-4 border-b border-[#F0EDE8] bg-[#FAFAF9]">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#9CA3AF]">Demo Details</p>
              </div>
              <div className="divide-y divide-[#F0EDE8]">
                {[
                  { label: 'Booking ID', value: requestId, mono: true },
                  { label: 'Organization', value: formData.organization_name, mono: false },
                  { label: 'Contact Email', value: formData.work_email, mono: false },
                  { label: 'Submitted', value: submittedAt, mono: false },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-6 py-3.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF] flex-shrink-0">{label}</span>
                    <span className={`text-[12px] font-semibold text-[#0D2B1A] text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-xl bg-[#065F46] text-white text-sm font-bold hover:bg-[#047857] transition-all shadow-sm"
              >
                Return to Homepage
              </Link>
              <Link href="/how-it-works"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 min-h-[48px] rounded-xl border border-[#E4E0D9] bg-white text-[#0D2B1A] text-sm font-bold hover:bg-[#F8F7F5] transition-all"
              >
                Platform Overview <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
