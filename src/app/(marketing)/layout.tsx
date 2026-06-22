'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Platform', href: '/outcomes' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Impact', href: '/impact' },
  { label: 'Pricing', href: '/pricing' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change (link click)
  const closeMenu = () => setMenuOpen(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── NAVIGATION ── */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled || menuOpen ? 'rgba(248,247,245,0.97)' : 'transparent',
          backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
          borderBottom: scrolled || menuOpen ? '1px solid #E4E0D9' : '1px solid transparent',
        }}
      >
        <div className="container-tight flex h-[68px] items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center group" onClick={closeMenu}>
            <Image
              src="/logo/viala_logo_black.png"
              alt="VIALA Logo"
              width={129}
              height={50}
              className="h-[40px] sm:h-[46px] w-auto object-contain"
              priority
            />
          </Link>

          {/* Center Nav — desktop only */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2.5 min-h-[44px] text-sm font-medium rounded-lg transition-colors duration-150 flex items-center"
                style={{ color: '#404040' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#0D0D0D';
                  (e.currentTarget as HTMLElement).style.background = '#F2F0ED';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = '#404040';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions — desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2.5 min-h-[44px] rounded-lg transition-colors flex items-center"
              style={{ color: '#404040' }}
            >
              Sign in
            </Link>
            <Link
              href="/get-started"
              className="text-sm font-semibold px-5 py-2.5 min-h-[44px] rounded-[10px] transition-all flex items-center"
              style={{ background: '#059669', color: '#FFFFFF' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = '#047857';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(5,150,105,0.4)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = '#059669';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.transform = 'none';
              }}
            >
              Book a Demo →
            </Link>
          </div>

          {/* Hamburger — mobile/tablet only (hidden at lg+) */}
          <button
            id="mobile-menu-btn"
            className="lg:hidden flex flex-col justify-center items-center w-11 h-11 rounded-xl gap-[5px] transition-colors"
            style={{ background: menuOpen ? '#F2F0ED' : 'transparent' }}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu-panel"
          >
            <span
              className="block w-5 h-[2px] rounded-full transition-all duration-300 origin-center"
              style={{
                background: '#0D0D0D',
                transform: menuOpen ? 'rotate(45deg) translate(0, 7px)' : 'none',
              }}
            />
            <span
              className="block w-5 h-[2px] rounded-full transition-all duration-200"
              style={{
                background: '#0D0D0D',
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? 'scaleX(0)' : 'none',
              }}
            />
            <span
              className="block w-5 h-[2px] rounded-full transition-all duration-300 origin-center"
              style={{
                background: '#0D0D0D',
                transform: menuOpen ? 'rotate(-45deg) translate(0, -7px)' : 'none',
              }}
            />
          </button>
        </div>

        {/* ── MOBILE MENU PANEL ── */}
        <div
          id="mobile-menu-panel"
          className="lg:hidden overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: menuOpen ? '520px' : '0px',
            opacity: menuOpen ? 1 : 0,
          }}
          aria-hidden={!menuOpen}
        >
          <div className="border-t" style={{ borderColor: '#E4E0D9' }}>
            <nav className="container-tight py-4 flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="px-4 py-3 min-h-[44px] text-base font-medium rounded-xl transition-colors duration-150 flex items-center"
                  style={{ color: '#404040' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = '#F2F0ED';
                    (e.currentTarget as HTMLElement).style.color = '#0D0D0D';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#404040';
                  }}
                >
                  {item.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="my-2 h-px" style={{ background: '#E4E0D9' }} />

              {/* CTA buttons stacked */}
              <Link
                href="/login"
                onClick={closeMenu}
                className="px-4 py-3 min-h-[44px] text-base font-semibold rounded-xl text-center transition-colors flex items-center justify-center"
                style={{ color: '#404040', background: '#F2F0ED' }}
              >
                Sign in
              </Link>
              <Link
                href="/get-started"
                onClick={closeMenu}
                className="px-4 py-3.5 min-h-[44px] text-base font-semibold rounded-xl text-center transition-all mt-1 flex items-center justify-center"
                style={{ background: '#059669', color: '#FFFFFF' }}
              >
                Book a Demo →
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full pt-[68px] outline-none">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #040F0A 0%, #020808 100%)', color: '#FFFFFF' }}>

        {/* Ambient top glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[280px] pointer-events-none opacity-40 select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.28) 0%, transparent 68%)', filter: 'blur(70px)' }}
        />

        {/* ── FOOTER GRID ── */}
        <div className="relative z-10 container-wide pt-16 pb-10 sm:pt-20 sm:pb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20">

            {/* ── COL 1: BRAND ── */}
            <div className="sm:col-span-2 lg:col-span-3">
              <Link href="/" className="inline-flex items-center mb-6">
                <Image
                  src="/logo/viala_logo_white.png"
                  alt="VIALA"
                  width={110}
                  height={44}
                  className="h-[38px] w-auto object-contain"
                />
              </Link>

              <p className="text-[13px] leading-[1.75] mb-5 max-w-[270px]" style={{ color: '#4A7A68' }}>
                VIALA helps healthcare organizations recover inventory value, reduce medicine waste, and improve lifecycle visibility through intelligent recovery workflows.
              </p>

              {/* Contact */}
              <div className="space-y-2 mb-6">
                <a
                  href="mailto:viala.health@gmail.com"
                  className="flex items-center gap-2 text-[12px] transition-colors group"
                  style={{ color: '#4A7A68' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#34D399'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#4A7A68'}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  viala.health@gmail.com
                </a>
                <div className="flex items-center gap-2 text-[12px]" style={{ color: '#4A7A68' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Hyderabad, Telangana, India
                </div>
              </div>

              {/* LinkedIn only */}
              <a
                href="https://www.linkedin.com/company/viala"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="VIALA on LinkedIn"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[11px] font-semibold transition-all"
                style={{ borderColor: '#1A3D30', background: 'rgba(255,255,255,0.03)', color: '#4A7A68' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#34D399';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.08)';
                  (e.currentTarget as HTMLElement).style.color = '#34D399';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#1A3D30';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                  (e.currentTarget as HTMLElement).style.color = '#4A7A68';
                }}
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Follow on LinkedIn
              </a>
            </div>

            {/* ── LINK COLUMNS ── */}
            <div className="sm:col-span-2 lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-10 lg:gap-16 xl:gap-24">
              {[
                {
                  heading: 'Platform',
                  links: [
                    { label: 'Platform', href: '/outcomes' },
                    { label: 'How It Works', href: '/how-it-works' },
                    { label: 'Impact', href: '/impact' },
                    { label: 'Pricing', href: '/pricing' },
                  ],
                },
                {
                  heading: 'Solutions',
                  links: [
                    { label: 'Expiry Intelligence', href: '/how-it-works' },
                    { label: 'Recovery Automation', href: '/outcomes' },
                    { label: 'Compliance Documentation', href: '/outcomes' },
                    { label: 'Multi-Location Visibility', href: '/impact' },
                  ],
                },
                {
                  heading: 'Legal & Security',
                  links: [
                    { label: 'Privacy Policy', href: '/privacy-policy' },
                    { label: 'Terms of Service', href: '/terms-of-service' },
                    { label: 'Security', href: '/security' },
                    { label: 'Documentation', href: '/documentation' },
                  ],
                },
              ].map((col) => (
                <div key={col.heading}>
                  <h5
                    className="text-[9px] font-black uppercase tracking-[0.14em] mb-5"
                    style={{ color: '#1E5A3F', letterSpacing: '0.14em' }}
                  >
                    {col.heading}
                  </h5>
                  <ul className="space-y-3.5">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="text-[13px] transition-all duration-150 block"
                          style={{ color: '#4A7A68' }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                            (e.currentTarget as HTMLElement).style.paddingLeft = '5px';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.color = '#4A7A68';
                            (e.currentTarget as HTMLElement).style.paddingLeft = '0';
                          }}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── TRUST INDICATOR BAR ── */}
        <div className="relative z-10 border-t" style={{ borderColor: '#0A2018' }}>
          <div className="container-wide py-5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-7 gap-y-3">
              {[
                'Audit Trail Logging',
                'Enterprise Security',
                'Healthcare Focused',
                'Multi-Location Ready',
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <svg
                    width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[11px] font-semibold tracking-wide" style={{ color: '#2A5A48' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── COPYRIGHT BAR ── */}
        <div className="relative z-10 border-t" style={{ borderColor: '#071410' }}>
          <div
            className="container-wide py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          >
            <div className="space-y-0.5">
              <p className="text-[11px]" style={{ color: '#1E4030' }}>
                &copy; {new Date().getFullYear()} VIALA Technologies Pvt. Ltd. &middot; Built for Indian Healthcare.
              </p>
              <p className="text-[10px]" style={{ color: '#163328' }}>
                Version 1.0 &nbsp;&bull;&nbsp; Healthcare Recovery Intelligence Platform
              </p>
            </div>
            <div className="flex items-center gap-5 flex-wrap justify-center">
              {[
                { label: 'Privacy', href: '/privacy-policy' },
                { label: 'Terms', href: '/terms-of-service' },
                { label: 'Security', href: '/security' },
              ].map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[11px] transition-colors py-1.5 min-h-[44px] flex items-center"
                  style={{ color: '#1E4030' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#34D399'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#1E4030'}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </footer>

    </div>
  );
}

