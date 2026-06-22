'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import {
  ArrowRight, AlertCircle, Loader2,
  TrendingUp, RotateCcw, Shield,
} from 'lucide-react';



// ── Value Cards (Left Panel) ──────────────────────────────────────────────────
const VALUE_CARDS = [
  {
    icon: TrendingUp,
    title: 'Expiry Prevention',
    desc: 'Identify at-risk inventory 60–90 days before losses occur.',
  },
  {
    icon: RotateCcw,
    title: 'Inventory Recovery',
    desc: 'Automated returns, transfers, and redistribution pathways.',
  },
  {
    icon: Shield,
    title: 'Compliance Intelligence',
    desc: 'Audit-ready documentation for every recovery action.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');


  const { signIn } = useAuth();

  const router = useRouter();

  // ── Email / Password ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await signIn(email, password);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex flex-col lg:flex-row bg-[#F8FAF9]">

      {/* ── LEFT PANEL — Brand Story (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between bg-[#022C22] p-12 xl:p-16 relative overflow-hidden">

        {/* Ambient Glow */}
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(16,185,129,0.18) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[300px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(6,95,70,0.4) 0%, transparent 60%)' }}
        />

        {/* Abstract Data Grid — subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.5) 39px, rgba(255,255,255,0.5) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.5) 39px, rgba(255,255,255,0.5) 40px)',
          }}
        />

        <div className="relative z-10">
          {/* Headline */}
          <div className="mb-10">
            <h1 className="text-3xl xl:text-4xl font-black text-white leading-[1.2] tracking-tight mb-4">
              Recover More<br />
              <span className="text-[#34D399]">Than You Spend.</span>
            </h1>
            <p className="text-[14px] text-[#4A7A68] leading-relaxed max-w-[320px]">
              Transform medicine lifecycle management into measurable recovery outcomes across your healthcare network.
            </p>
          </div>

          {/* Value Cards */}
          <div className="space-y-3">
            {VALUE_CARDS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-xl border border-[#0D3D2C] bg-[#031A13]">
                <div className="w-8 h-8 rounded-lg bg-[#065F46] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-[#34D399]" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white mb-0.5">{title}</p>
                  <p className="text-[11px] text-[#4A7A68] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <div className="relative z-10 mt-10">
          <p className="text-[10px] text-[#1E4030] font-mono">
            VIALA Technologies Pvt. Ltd. · Healthcare Recovery Intelligence
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Auth Card ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-14 lg:py-0">


        <div className="w-full max-w-[400px]">

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0D2B1A] tracking-tight">
              Sign in to VIALA
            </h2>
            <p className="mt-2 text-sm text-[#9CA3AF]">
              Enterprise Healthcare Recovery Platform
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-5"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3 mb-5">
            {/* Google — Coming Soon */}
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 px-4 py-3 min-h-[44px] rounded-xl border border-[#E4E0D9] bg-[#FAFAF8] text-sm font-semibold text-[#C4BDB4] cursor-not-allowed shadow-sm"
              title="Google Sign-In — coming soon"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9086c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4" opacity="0.4"/>
                <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9086-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5832-5.036-3.7105H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853" opacity="0.4"/>
                <path d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 000 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z" fill="#FBBC05" opacity="0.4"/>
                <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1632 6.656 3.5795 9 3.5795z" fill="#EA4335" opacity="0.4"/>
              </svg>
              Continue with Google
              <span className="ml-auto text-[9px] font-bold bg-[#F0EDE8] text-[#B0AA9F] px-1.5 py-0.5 rounded uppercase tracking-wide">Soon</span>
            </button>

            {/* Microsoft — Coming Soon */}
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 px-4 py-3 min-h-[44px] rounded-xl border border-[#E4E0D9] bg-[#FAFAF8] text-sm font-semibold text-[#C4BDB4] cursor-not-allowed shadow-sm"
              title="Microsoft SSO — coming soon"
            >
              <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true">
                <path d="M10 0H0V10H10V0Z" fill="#F25022" opacity="0.4"/>
                <path d="M21 0H11V10H21V0Z" fill="#7FBA00" opacity="0.4"/>
                <path d="M10 11H0V21H10V11Z" fill="#00A4EF" opacity="0.4"/>
                <path d="M21 11H11V21H21V11Z" fill="#FFB900" opacity="0.4"/>
              </svg>
              Continue with Microsoft
              <span className="ml-auto text-[9px] font-bold bg-[#F0EDE8] text-[#B0AA9F] px-1.5 py-0.5 rounded uppercase tracking-wide">Soon</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#E4E0D9]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#F8FAF9] px-4 text-[11px] uppercase font-bold tracking-widest text-[#C4BDB4]">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-[#525252] mb-2">
                Work Email
              </label>
              <input
                id="email" type="email" required
                autoComplete="email" inputMode="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-[#E4E0D9] bg-white text-sm text-[#0D2B1A] focus:outline-none focus:ring-2 focus:ring-[#059669]/25 focus:border-[#059669] placeholder-[#C4BDB4]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-[#525252]">
                  Password
                </label>
                <a href="#" className="text-[10px] font-bold text-[#059669] hover:text-[#047857] hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                id="password" type="password" required
                autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full px-4 py-3 min-h-[44px] rounded-lg border border-[#E4E0D9] bg-white text-sm text-[#0D2B1A] focus:outline-none focus:ring-2 focus:ring-[#059669]/25 focus:border-[#059669] placeholder-[#C4BDB4]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 min-h-[48px] rounded-xl bg-[#065F46] hover:bg-[#047857] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

            <p className="mt-8 flex flex-col items-center gap-3">
              <span className="text-[12px] text-[#9CA3AF]">
                Don&apos;t have access?{' '}
                <Link href="/get-started" className="font-bold text-[#059669] hover:underline">
                  Book a Demo
                </Link>
              </span>
            </p>
        </div>
      </div>
    </div>
  );
}
