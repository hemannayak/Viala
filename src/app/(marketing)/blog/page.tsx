'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Clock, Tag } from 'lucide-react';

const POSTS = [
  {
    slug: 'medicine-expiry-crisis-india',
    category: 'Industry',
    title: "India's ₹15,000 Crore Medicine Waste Problem",
    excerpt: 'Every year, Indian pharmacies and hospitals write off billions in expired inventory. We break down why this happens and how AI-driven lifecycle management is changing the equation.',
    author: 'VIALA Research',
    date: 'June 12, 2026',
    readTime: '8 min',
    featured: true,
    tag: '#inventory #waste #india',
  },
  {
    slug: 'vendor-return-automation',
    category: 'Product',
    title: 'Automating Vendor Returns: From 4 Weeks to 48 Hours',
    excerpt: "Manual vendor return claims are error-prone and slow. See how VIALA's automated filing system recovers credits that would otherwise be left on the table.",
    author: 'Product Team',
    date: 'June 8, 2026',
    readTime: '6 min',
    featured: false,
    tag: '#vendor #automation',
  },
  {
    slug: 'cold-chain-compliance',
    category: 'Compliance',
    title: 'Cold Chain Monitoring: The Silent Compliance Risk',
    excerpt: "Temperature-sensitive medicines represent a growing share of pharmacy inventory. Here's what real compliance looks like beyond manual temperature logs.",
    author: 'VIALA Research',
    date: 'June 3, 2026',
    readTime: '5 min',
    featured: false,
    tag: '#cold-chain #compliance',
  },
  {
    slug: 'multi-branch-transfers',
    category: 'Product',
    title: 'Smart Branch Transfers: The Network Advantage',
    excerpt: 'Why redistributing near-expiry stock across locations before it expires is the most underused lever in multi-location pharmacy chains.',
    author: 'Product Team',
    date: 'May 28, 2026',
    readTime: '7 min',
    featured: false,
    tag: '#transfers #network',
  },
  {
    slug: 'roi-pharma-ai',
    category: 'Business',
    title: "Calculating ROI for AI-Driven Inventory: A CFO's Guide",
    excerpt: 'A practical framework for finance leaders evaluating intelligent inventory platforms — with real numbers from VIALA customer deployments.',
    author: 'VIALA Research',
    date: 'May 22, 2026',
    readTime: '10 min',
    featured: false,
    tag: '#roi #finance',
  },
  {
    slug: 'donation-compliance-framework',
    category: 'Compliance',
    title: 'Medicine Donation Without the Compliance Headache',
    excerpt: "Donating near-expiry medicine is a regulatory minefield. VIALA's donation module generates signed documentation and NGO coordination automatically.",
    author: 'Product Team',
    date: 'May 15, 2026',
    readTime: '6 min',
    featured: false,
    tag: '#donation #ngo',
  },
];

const CATEGORIES = ['All', 'Product', 'Industry', 'Compliance', 'Business'];

const TAG_COLORS: Record<string, string> = {
  Product: 'bg-blue-50 text-blue-600 border-blue-100',
  Industry: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Compliance: 'bg-purple-50 text-purple-600 border-purple-100',
  Business: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function BlogPage() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? POSTS : POSTS.filter(p => p.category === active);
  const [featured, ...rest] = filtered;

  return (
    <main className="min-h-screen bg-[#F8F7F5]">
      {/* Hero */}
      <section className="bg-white border-b border-[#E8E5DF] py-20">
        <div className="container-tight text-center">
          <span className="label-tag mb-4 inline-flex">Blog</span>
          <h1 className="display-lg mb-4">Insights on medicine lifecycle.</h1>
          <p className="body-lg text-[#6B7280] max-w-xl mx-auto">
            Research, product updates, and industry perspectives on pharmaceutical inventory management.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-white border-b border-[#E8E5DF] sticky top-0 z-30">
        <div className="container-tight">
          <div className="flex gap-1 py-3 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  active === cat
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#6B7280] hover:text-[#0F172A] hover:bg-[#F3F4F6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-tight">
          {/* Featured post */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group block mb-12">
              <div className="bg-white rounded-2xl border border-[#E8E5DF] p-8 md:p-12 shadow-sm hover:shadow-md transition-all hover:border-[#0F172A]/20">
                <div className="flex items-center gap-3 mb-6">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${TAG_COLORS[featured.category]}`}>
                    {featured.category}
                  </span>
                  <span className="text-xs font-bold bg-[#FFF9EC] text-[#B45309] border border-[#FEF3C7] px-2.5 py-1 rounded-full">✦ Featured</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] mb-4 leading-tight group-hover:text-[#059669] transition-colors" style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {featured.title}
                </h2>
                <p className="text-[#4B5563] text-base leading-relaxed mb-8 max-w-2xl">{featured.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
                    <span className="font-semibold text-[#374151]">{featured.author}</span>
                    <span>·</span>
                    <span>{featured.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.readTime}</span>
                  </div>
                  <span className="flex items-center gap-2 text-sm font-bold text-[#059669] group-hover:gap-3 transition-all">
                    Read article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Article grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <article className="bg-white rounded-xl border border-[#E8E5DF] p-6 shadow-sm hover:shadow-md transition-all hover:border-[#0F172A]/20 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${TAG_COLORS[post.category]}`}>
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-[#0F172A] mb-3 leading-snug group-hover:text-[#059669] transition-colors flex-1" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    {post.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] mb-5 leading-relaxed line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-[#9CA3AF] mt-auto">
                    <span className="font-semibold text-[#374151]">{post.author}</span>
                    <div className="flex items-center gap-2">
                      <span>{post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24 text-[#9CA3AF]">
              <Tag className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="font-semibold">No posts in this category yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
