'use client';
import { useState } from 'react';
import { Cookie, ToggleLeft, ToggleRight, Info } from 'lucide-react';

const COOKIE_TYPES = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    required: true,
    desc: 'Required for the platform to function. Cannot be disabled.',
    examples: ['Session authentication', 'CSRF protection tokens', 'Load balancing', 'User preferences (language, theme)'],
    icon: '🔒',
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    required: false,
    desc: 'Help us understand how the platform is used so we can improve it.',
    examples: ['Page view counts (anonymised)', 'Feature usage heatmaps', 'Error rate monitoring', 'Session duration'],
    icon: '📊',
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    required: false,
    desc: 'Enable enhanced features and personalisation.',
    examples: ['Remembered dashboard layouts', 'Last visited report', 'Notification preferences'],
    icon: '⚙️',
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    required: false,
    desc: 'Used on our public marketing site only — never inside the platform.',
    examples: ['Campaign attribution', 'Landing page A/B tests'],
    icon: '📣',
  },
];

export default function CookiePolicyPage() {
  const [consents, setConsents] = useState<Record<string, boolean>>({
    analytics: true,
    functional: true,
    marketing: false,
  });

  return (
    <main className="min-h-screen bg-[#F8F7F5]">
      {/* Hero */}
      <section className="bg-white border-b border-[#E8E5DF] py-16">
        <div className="container-tight max-w-[800px]">
          <span className="label-tag mb-4 inline-flex">Legal</span>
          <h1 className="display-lg mb-3">Cookie Policy</h1>
          <p className="text-sm text-[#9CA3AF]">Last updated: June 1, 2026</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-tight max-w-[800px] space-y-8">

          {/* Intro */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFF9EC] border border-[#FEF3C7] flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-[#B45309]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#0F172A] mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>What are cookies?</h2>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Cookies are small text files stored on your device when you visit a website or use a web application. They allow the service to remember your preferences, keep you logged in, and understand how the product is used. VIALA uses cookies only for the purposes described below.
                </p>
              </div>
            </div>
          </div>

          {/* Cookie types with toggles */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-[#0F172A] px-1" style={{ fontFamily: 'var(--font-jakarta)' }}>Cookie Categories</h2>

            {COOKIE_TYPES.map(ct => (
              <div key={ct.id} className="bg-white rounded-xl border border-[#E8E5DF] p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{ct.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>{ct.name}</h3>
                        {ct.required && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#059669] border border-[#D1FAE5]">Always On</span>
                        )}
                      </div>
                      <p className="text-sm text-[#6B7280] mt-1">{ct.desc}</p>
                    </div>
                  </div>
                  {ct.required ? (
                    <div className="flex-shrink-0 opacity-40 cursor-not-allowed">
                      <ToggleRight className="w-9 h-9 text-[#059669]" />
                    </div>
                  ) : (
                    <button
                      onClick={() => setConsents(prev => ({ ...prev, [ct.id]: !prev[ct.id] }))}
                      className="flex-shrink-0 transition-transform hover:scale-105"
                    >
                      {consents[ct.id]
                        ? <ToggleRight className="w-9 h-9 text-[#059669]" />
                        : <ToggleLeft className="w-9 h-9 text-[#D1D5DB]" />
                      }
                    </button>
                  )}
                </div>

                <div className="bg-[#F8F7F5] rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Info className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Examples</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ct.examples.map(ex => (
                      <span key={ex} className="text-xs text-[#4B5563] bg-white border border-[#E8E5DF] px-2.5 py-1 rounded-md">{ex}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button className="px-6 py-2.5 rounded-lg bg-[#059669] text-white text-sm font-bold hover:bg-[#047857] transition-colors shadow-sm">
              Save my preferences
            </button>
          </div>

          {/* Legal text */}
          <div className="bg-white rounded-2xl border border-[#E8E5DF] p-8 shadow-sm prose prose-slate max-w-none">
            <h2>Managing Cookies in Your Browser</h2>
            <p>You can also control cookies through your browser settings. Note that blocking essential cookies will prevent the VIALA platform from functioning correctly.</p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener">Firefox</a></li>
              <li><a href="https://support.apple.com/en-us/HT201265" target="_blank" rel="noopener">Safari</a></li>
            </ul>

            <h2>Third-Party Cookies</h2>
            <p>Our marketing website may include third-party cookies from analytics tools. Our platform (app.viala.app) does not include third-party advertising cookies.</p>

            <h2>Contact</h2>
            <p>Questions about our cookie practices: <a href="mailto:privacy@viala.app">privacy@viala.app</a></p>
          </div>
        </div>
      </section>
    </main>
  );
}
