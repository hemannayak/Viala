'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Lock, Mail, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isMagicLinkSent, setIsMagicLinkSent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await signIn(email, password);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsMagicLinkSent(true);
    }, 1200);
  };

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full max-w-md space-y-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#E8E5DF] shadow-xl relative mx-auto">
        
        {/* Top brand ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-2xl" />

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>Sign in to VIALA</h2>
          <p className="mt-2 text-xs text-[#717171]">
            Enter your credentials or use Enterprise SSO options to sync.
          </p>
        </div>

        {/* Error Message banner */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Mode Toggle Tabs */}
        <div className="flex bg-[#FAFAF8] border border-[#E8E5DF] rounded-xl p-1">
          <button
            onClick={() => { setAuthMode('password'); setIsMagicLinkSent(false); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all ${authMode === 'password' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#717171]'}`}
          >
            Password
          </button>
          <button
            onClick={() => { setAuthMode('magic-link'); setIsMagicLinkSent(false); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all ${authMode === 'magic-link' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#717171]'}`}
          >
            Magic Link
          </button>
        </div>

        {/* SSO Buttons */}
        <div className="space-y-2.5">
          <Button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="outline" 
            className="w-full bg-white text-[#0F172A] border-[#E8E5DF] hover:bg-[#FAFAF8] h-10 flex items-center justify-center gap-2 text-xs font-bold rounded-xl shadow-sm cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9086c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9086-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5832-5.036-3.7105H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853" />
              <path d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 000 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z" fill="#FBBC05" />
              <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1632 6.656 3.5795 9 3.5795z" fill="#EA4335" />
            </svg>
            {isLoading ? 'Connecting...' : 'Sign in with Google'}
          </Button>

          <Button 
            disabled 
            variant="outline" 
            className="w-full bg-white text-[#9CA3AF] border-[#E8E5DF] h-10 flex items-center justify-center gap-2 text-xs font-bold rounded-xl shadow-sm opacity-50 cursor-not-allowed"
          >
            <svg width="14" height="14" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
              <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
              <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
              <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
            </svg>
            Sign in with Microsoft
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-[#E8E5DF]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-white px-4 text-[#717171]">Or continue with email</span>
          </div>
        </div>

        {/* PASSWORD FORM */}
        {authMode === 'password' && (
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Work Email</label>
              <input
                id="email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-[#E8E5DF] bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none placeholder-[#B0ABAB]"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Password</label>
              <input
                id="password" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-[#E8E5DF] bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none placeholder-[#B0ABAB]"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-xs text-[#717171] cursor-pointer select-none">
                <input id="remember-me" type="checkbox" className="h-3.5 w-3.5 rounded border-[#E8E5DF] text-emerald-600 focus:ring-emerald-500" />
                <span className="ml-2">Remember me</span>
              </label>
              <a href="#" className="text-xs font-bold text-emerald-600 hover:underline">Forgot password?</a>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold h-11 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isLoading ? 'Signing In...' : 'Sign In with Password'}
            </Button>
          </form>
        )}

        {/* MAGIC LINK FORM */}
        {authMode === 'magic-link' && (
          <form className="space-y-4" onSubmit={handleMagicLinkSubmit}>
            <div>
              <label htmlFor="magic-email" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Work Email</label>
              <input
                id="magic-email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-[#E8E5DF] bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none placeholder-[#B0ABAB]"
                placeholder="you@company.com"
              />
            </div>

            {isMagicLinkSent && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-pulse">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Check your email for secure Magic Link.
              </div>
            )}

            <Button
              type="submit" disabled={isLoading || isMagicLinkSent}
              className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold h-11 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              {isLoading && <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />}
              {isMagicLinkSent ? 'Magic Link Sent' : 'Send Secure Magic Link'}
            </Button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-[#717171]">
          Don&apos;t have an account?{' '}
          <Link href="/get-started" className="font-bold text-emerald-600 hover:underline">
            Contact sales
          </Link>
        </p>
      </div>
    </div>
  );
}
