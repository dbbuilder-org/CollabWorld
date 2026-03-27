import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Official Rules for Influencers',
  description: 'Contest rules, eligibility, requirements, and scoring for Collab World influencer participants.',
}

const TIERS = [
  { name: 'Nano',     range: '1,000 – 10,000 followers' },
  { name: 'Micro',    range: '10,000 – 50,000 followers' },
  { name: 'Mid-Tier', range: '50,000 – 100,000 followers' },
  { name: 'Macro',    range: '100,000 – 500,000 followers' },
  { name: 'Mega',     range: '500,000+ followers' },
]

const SCORING = [
  { action: 'View',                    points: '1 point' },
  { action: 'Like',                    points: '5 points' },
  { action: 'Comment',                 points: '10 points' },
  { action: 'Share',                   points: '20 points' },
  { action: 'Affiliate sale',          points: '30 points' },
  { action: 'Post with 10%+ engagement', points: '100 points' },
]

export default function RulesInfluencersPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-20">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors mb-10">
          ← Back to Home
        </Link>

        <h1 className="font-serif font-bold text-5xl md:text-6xl mb-4">Official Rules for Influencers</h1>
        <p className="text-purple-400 font-semibold tracking-widest text-sm uppercase mb-16">
          Nano • Micro • Mid-Tier • Macro • Mega
        </p>

        {/* Eligibility */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Eligibility</h2>
          <ul className="space-y-3 text-zinc-400">
            <li className="flex gap-3"><span className="text-yellow-400 shrink-0">→</span>Must be 18+ years old</li>
            <li className="flex gap-3"><span className="text-yellow-400 shrink-0">→</span>Active public account on minimum 3 platforms: Instagram, TikTok, Facebook</li>
            <li className="flex gap-3"><span className="text-yellow-400 shrink-0">→</span>Minimum 5% engagement rate</li>
            <li className="flex gap-3"><span className="text-yellow-400 shrink-0">→</span>Minimum 25,000 followers to qualify for guaranteed payout</li>
          </ul>
        </section>

        {/* Tiers */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Influencer Divisions</h2>
          <p className="text-zinc-400 mb-6">Competition is tiered by audience size for fair comparison:</p>
          <div className="space-y-3">
            {TIERS.map((tier) => (
              <div key={tier.name} className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 hover:border-purple-500/30 transition-colors">
                <span className="font-semibold text-white">{tier.name} Influencers</span>
                <span className="text-zinc-400 text-sm">{tier.range}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Promotion Requirements */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Promotion Requirements</h2>
          <ul className="space-y-4 text-zinc-400">
            <li className="flex gap-3"><span className="text-purple-400 shrink-0">•</span>Share 1 pre-made movie trailer per day to &ldquo;Stories&rdquo; on all 3 platforms (Instagram, TikTok, Facebook)</li>
            <li className="flex gap-3"><span className="text-purple-400 shrink-0">•</span>Must post for 30 consecutive days during the contest period</li>
            <li className="flex gap-3"><span className="text-purple-400 shrink-0">•</span>Must include the official hashtag: <span className="text-white font-mono">#ViralMovieTrailerContest</span></li>
            <li className="flex gap-3"><span className="text-purple-400 shrink-0">•</span>Must use your unique affiliate tracking link in every post</li>
            <li className="flex gap-3"><span className="text-purple-400 shrink-0">•</span>Maintain minimum 5%+ engagement rate throughout the contest</li>
          </ul>
        </section>

        {/* Scoring */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Scoring System</h2>
          <p className="text-zinc-400 mb-6">Your total score is calculated across all posts and platforms:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SCORING.map((s) => (
              <div key={s.action} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 text-center hover:border-purple-500/30 transition-colors">
                <div className="text-2xl font-black text-purple-400 mb-1">{s.points}</div>
                <div className="text-zinc-400 text-xs leading-snug">per {s.action}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Guaranteed Payout */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Guaranteed Payout</h2>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-8 mb-6">
            <p className="text-yellow-400 font-semibold text-lg mb-3">How it works:</p>
            <ul className="space-y-2 text-zinc-300 text-sm">
              <li className="flex gap-3"><span className="text-yellow-400 shrink-0">→</span>Earn commissions through your unique affiliate link</li>
              <li className="flex gap-3"><span className="text-yellow-400 shrink-0">→</span>If total commissions fall below your guaranteed payout amount, we cover the difference</li>
              <li className="flex gap-3"><span className="text-yellow-400 shrink-0">→</span>Requirements: 25k+ followers, 5%+ engagement, post every day for 30 days</li>
            </ul>
          </div>
          <p className="text-zinc-500 text-sm text-center">
            See the full payout schedule on our{' '}
            <Link href="/affiliate-compensation-plan" className="text-yellow-400 hover:text-yellow-300 underline">
              Affiliate Compensation Plan
            </Link>
          </p>
        </section>

        {/* Prizes */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Contest Prizes</h2>
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-8">
              <p className="text-yellow-400 font-bold text-lg mb-3">🥇 Grand Prize</p>
              <ul className="space-y-2 text-zinc-300 text-sm">
                <li>$10,000 cash</li>
                <li>2 tickets to red carpet and premiere in Hollywood with flight and hotel accommodations</li>
                <li>Multiple high-value brand prizes</li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
              <p className="text-zinc-300 font-bold text-lg mb-3">🥈 Runners-Up (Top 100)</p>
              <p className="text-zinc-400 text-sm">High-value brand prizes and luxury experiences</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
              <p className="text-zinc-300 font-bold text-lg mb-3">⚡ Top Performer of the Week</p>
              <p className="text-zinc-400 text-sm">Special rewards for the influencer who drives the most engagement in a single week</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/affiliate-compensation-plan" className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-full hover:bg-yellow-300 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_30px_rgba(250,204,21,0.35)] tracking-widest uppercase text-sm">
            View Full Compensation Plan
          </Link>
          <Link href="/sign-up" className="inline-block border-2 border-white/50 text-white font-bold px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-1 tracking-widest uppercase text-sm">
            Sign Up as Influencer
          </Link>
        </div>
      </div>
    </main>
  )
}
