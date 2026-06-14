'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { label: 'Product', href: '/outcomes' },
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
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150"
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
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ color: '#404040' }}
            >
              Sign in
            </Link>
            <Link
              href="/get-started"
              className="text-sm font-semibold px-5 py-2.5 rounded-[10px] transition-all"
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
              Request Access →
            </Link>
          </div>

          {/* Hamburger — mobile/tablet only */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl gap-[5px] transition-colors"
            style={{ background: menuOpen ? '#F2F0ED' : 'transparent' }}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
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
          className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: menuOpen ? '500px' : '0px',
            opacity: menuOpen ? 1 : 0,
          }}
        >
          <div className="border-t" style={{ borderColor: '#E4E0D9' }}>
            <nav className="container-tight py-4 flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="px-4 py-3 text-base font-medium rounded-xl transition-colors duration-150"
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
                className="px-4 py-3 text-base font-semibold rounded-xl text-center transition-colors"
                style={{ color: '#404040', background: '#F2F0ED' }}
              >
                Sign in
              </Link>
              <Link
                href="/get-started"
                onClick={closeMenu}
                className="px-4 py-3.5 text-base font-semibold rounded-xl text-center transition-all mt-1"
                style={{ background: '#059669', color: '#FFFFFF' }}
              >
                Request Access →
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 w-full pt-[68px]">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative overflow-hidden" style={{ background: '#040C0A', color: '#FFFFFF' }}>

        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] pointer-events-none opacity-30 select-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.35) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[200px] pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(37,99,235,0.3) 0%, transparent 60%)' }} />

        {/* ── FOOTER GRID ── */}
        <div className="relative z-10 container-tight py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">

            {/* Brand column */}
            <div className="md:col-span-4">
              <Link href="/" className="inline-flex items-center mb-5">
                <Image
                  src="/logo/viala_logo_white.png"
                  alt="VIALA"
                  width={110}
                  height={44}
                  className="h-[38px] w-auto object-contain"
                />
              </Link>
              <p className="text-sm leading-relaxed mb-6 max-w-[260px]" style={{ color: '#5A8A7A' }}>
                The intelligence platform for medicine lifecycle management. Every medicine deserves a second chance.
              </p>

              {/* Social links */}
              <div className="flex items-center gap-3">
                {[
                  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/viala', path: 'M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.5 6h-2v5h2V6zm-1-1.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 1.5h-2v2.5c0 .55-.45 1-1 1s-1-.45-1-1V6h-2v5h2V9.27c.35.45.9.73 1.5.73C12.88 10 13.5 9.38 13.5 8.5V6z' },
                  { label: 'Twitter', href: 'https://twitter.com/viala_app', path: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border"
                    style={{ borderColor: '#1A3D30', background: 'rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#34D399';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.1)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#1A3D30';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" style={{ color: '#5A8A7A' }}>
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {[
                {
                  heading: 'Platform',
                  links: [
                    { label: 'Product', href: '/outcomes' },
                    { label: 'How It Works', href: '/how-it-works' },
                    { label: 'Impact', href: '/impact' },
                    { label: 'Pricing', href: '/pricing' },
                    { label: 'Roadmap', href: '#' },
                  ],
                },
                {
                  heading: 'Company',
                  links: [
                    { label: 'About', href: '/about' },
                    { label: 'Blog', href: '/blog' },
                    { label: 'Careers', href: '/careers' },
                    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/viala' },
                    { label: 'Contact', href: '/contact' },
                  ],
                },
                {
                  heading: 'Legal & Security',
                  links: [
                    { label: 'Documentation', href: '/documentation' },
                    { label: 'Security', href: '/security' },
                    { label: 'Privacy Policy', href: '/privacy-policy' },
                    { label: 'Terms of Service', href: '/terms-of-service' },
                    { label: 'Cookie Policy', href: '/cookie-policy' },
                  ],
                },
              ].map((col) => (
                <div key={col.heading}>
                  <h5 className="text-[10px] font-black uppercase tracking-[0.12em] mb-5" style={{ color: '#2A5A48' }}>
                    {col.heading}
                  </h5>
                  <ul className="space-y-3">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        {l.href.startsWith('http') ? (
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] transition-all duration-150 block"
                            style={{ color: '#5A8A7A' }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                              (e.currentTarget as HTMLElement).style.paddingLeft = '4px';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.color = '#5A8A7A';
                              (e.currentTarget as HTMLElement).style.paddingLeft = '0';
                            }}
                          >
                            {l.label}
                          </a>
                        ) : (
                          <Link
                            href={l.href}
                            className="text-[13px] transition-all duration-150 block"
                            style={{ color: '#5A8A7A' }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                              (e.currentTarget as HTMLElement).style.paddingLeft = '4px';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.color = '#5A8A7A';
                              (e.currentTarget as HTMLElement).style.paddingLeft = '0';
                            }}
                          >
                            {l.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="relative z-10 border-t" style={{ borderColor: '#0F2420' }}>
          <div className="container-tight py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-[11px]" style={{ color: '#2A5A48' }}>
              © {new Date().getFullYear()} VIALA Technologies Pvt. Ltd. · Built for Indian Healthcare.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
              {[
                { label: 'Privacy', href: '/privacy-policy' },
                { label: 'Terms', href: '/terms-of-service' },
                { label: 'Security', href: '/security' },
              ].map(l => (
                <Link key={l.label} href={l.href} className="text-[11px] transition-colors"
                  style={{ color: '#2A5A48' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#34D399'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#2A5A48'}
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
