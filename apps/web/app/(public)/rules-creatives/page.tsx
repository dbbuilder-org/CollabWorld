import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Official Rules for Creators',
  description: 'Contest rules, eligibility, scoring, and prizes for Collab World creator submissions.',
}

const TIERS = [
  { name: 'Nano',     range: '1,000 – 10,000 followers' },
  { name: 'Micro',    range: '10,000 – 50,000 followers' },
  { name: 'Mid-Tier', range: '50,000 – 100,000 followers' },
  { name: 'Macro',    range: '100,000 – 500,000 followers' },
  { name: 'Mega',     range: '500,000+ followers' },
]

const SCORING = [
  { action: 'View',    points: '1 point' },
  { action: 'Like',    points: '5 points' },
  { action: 'Comment', points: '10 points' },
  { action: 'Share',   points: '20 points' },
]

export default function RulesCreativesPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-20">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors mb-10">
          ← Back to Home
        </Link>

        <h1 className="font-serif font-bold text-5xl md:text-6xl mb-4">Official Rules for Creators</h1>
        <p className="text-yellow-400 font-semibold tracking-widest text-sm uppercase mb-16">
          Film Makers • Music Artists • Videographers • Editors
        </p>

        {/* Eligibility */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Eligibility</h2>
          <ul className="space-y-3 text-zinc-400">
            <li className="flex gap-3"><span className="text-yellow-400 shrink-0">→</span>Must be 18+ years old</li>
            <li className="flex gap-3"><span className="text-yellow-400 shrink-0">→</span>Must create an original movie trailer or music video for the active contest</li>
            <li className="flex gap-3"><span className="text-yellow-400 shrink-0">→</span>Must have an active Collab World creator account</li>
          </ul>
        </section>

        {/* Creator Tiers */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Creator Divisions</h2>
          <p className="text-zinc-400 mb-6">Competition is tiered by audience size for fair comparison:</p>
          <div className="space-y-3">
            {TIERS.map((tier, i) => (
              <div key={tier.name} className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-4 hover:border-gray-700 transition-colors">
                <span className="font-semibold text-white">{tier.name} Creators</span>
                <span className="text-zinc-400 text-sm">{tier.range}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Entry Guidelines */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Entry Guidelines</h2>
          <ul className="space-y-4 text-zinc-400">
            <li className="flex gap-3"><span className="text-blue-400 shrink-0">•</span>Trailers must feature official clips provided by Collab World (actor clips and organic brand placement scenes)</li>
            <li className="flex gap-3"><span className="text-blue-400 shrink-0">•</span>Must include at least 3 brand placements from provided brand video clips</li>
            <li className="flex gap-3"><span className="text-blue-400 shrink-0">•</span>Must be posted publicly on at least 3 major social media platforms: Instagram, TikTok, Facebook</li>
            <li className="flex gap-3"><span className="text-blue-400 shrink-0">•</span>Must use the official hashtag: <span className="text-white font-mono">#ViralMovieTrailerContest</span></li>
            <li className="flex gap-3"><span className="text-blue-400 shrink-0">•</span>Trailer length: 60–180 seconds</li>
            <li className="flex gap-3"><span className="text-blue-400 shrink-0">•</span>No professional editing required — simple video apps are encouraged</li>
          </ul>
        </section>

        {/* Scoring */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Scoring System</h2>
          <p className="text-zinc-400 mb-6">Your total score is the sum of engagement points across all platforms:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SCORING.map((s) => (
              <div key={s.action} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 text-center hover:border-blue-500/30 transition-colors">
                <div className="text-2xl font-black text-blue-400 mb-1">{s.points}</div>
                <div className="text-zinc-400 text-sm">per {s.action}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Prizes */}
        <section className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-6 text-white">Prizes</h2>
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-8">
              <p className="text-yellow-400 font-bold text-lg mb-3">🥇 Grand Prize</p>
              <ul className="space-y-2 text-zinc-300 text-sm">
                <li>$10,000 cash</li>
                <li>2 tickets to red carpet and premiere in Hollywood with flight and hotel accommodations</li>
                <li>Multiple high-value brand prizes</li>
                <li>Your trailer becomes The Official Movie Trailer with residual monetization</li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
              <p className="text-zinc-300 font-bold text-lg mb-3">🥈 Runners-Up (Top 100)</p>
              <p className="text-zinc-400 text-sm">High-value brand prizes and luxury experiences</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
              <p className="text-zinc-300 font-bold text-lg mb-3">⚡ Top Performer of the Week</p>
              <p className="text-zinc-400 text-sm">Special rewards for the creator who drives the most engagement in a single week</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link href="/sign-up" className="inline-block bg-white text-black font-bold px-12 py-4 rounded-full hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_40px_rgba(255,255,255,0.25)] tracking-widest uppercase">
            Sign Up as a Creator
          </Link>
        </div>
      </div>
    </main>
  )
}
