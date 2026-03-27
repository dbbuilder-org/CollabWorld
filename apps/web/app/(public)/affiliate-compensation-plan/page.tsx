import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Compensation Plan',
  description: 'Guaranteed payout schedule for Collab World influencer partners — from $1,650 to $25,000.',
}

const PAYOUTS = [
  { range: '25k – 50k',    followers: '25,000 – 50,000',   amount: '$1,650',  tier: 'Nano' },
  { range: '50k – 75k',    followers: '50,000 – 75,000',   amount: '$3,300',  tier: 'Micro' },
  { range: '75k – 100k',   followers: '75,000 – 100,000',  amount: '$5,000',  tier: 'Micro' },
  { range: '100k – 150k',  followers: '100,000 – 150,000', amount: '$6,600',  tier: 'Mid-Tier' },
  { range: '150k – 200k',  followers: '150,000 – 200,000', amount: '$9,900',  tier: 'Mid-Tier' },
  { range: '200k – 250k',  followers: '200,000 – 250,000', amount: '$12,500', tier: 'Macro' },
  { range: '250k – 300k',  followers: '250,000 – 300,000', amount: '$15,000', tier: 'Macro' },
  { range: '300k – 400k',  followers: '300,000 – 400,000', amount: '$17,000', tier: 'Macro' },
  { range: '400k – 500k',  followers: '400,000 – 500,000', amount: '$19,250', tier: 'Macro' },
  { range: '500k+',        followers: '500,000+',           amount: '$25,000', tier: 'Mega' },
]

const TIER_COLORS: Record<string, string> = {
  'Nano':     'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Micro':    'text-purple-400 bg-purple-500/10 border-purple-500/30',
  'Mid-Tier': 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  'Macro':    'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  'Mega':     'text-green-400 bg-green-500/10 border-green-500/30',
}

export default function AffiliateCompensationPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors mb-10">
          ← Back to Home
        </Link>

        <h1 className="font-serif font-bold text-5xl md:text-6xl mb-4">Affiliate Compensation Plan</h1>
        <p className="text-yellow-400 font-semibold tracking-widest text-sm uppercase mb-6">
          Guaranteed Payouts for Qualifying Influencers
        </p>
        <p className="text-zinc-400 text-lg leading-relaxed mb-16 max-w-2xl">
          Collab World guarantees your payout when you meet the requirements. If your total commissions
          fall short of your tier&apos;s guaranteed amount, we cover the difference — no excuses, no fine print.
        </p>

        {/* Requirements box */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-8 mb-14">
          <h2 className="font-serif font-semibold text-2xl mb-5 text-yellow-400">Requirements to Qualify</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">25K+</div>
              <div className="text-zinc-400 text-sm">followers minimum</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">5%+</div>
              <div className="text-zinc-400 text-sm">engagement rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-2">30</div>
              <div className="text-zinc-400 text-sm">days of daily posts</div>
            </div>
          </div>
          <p className="text-zinc-400 text-sm text-center mt-6">
            Post 1 trailer per day to Stories on Instagram, TikTok, and Facebook with your unique affiliate link and official hashtag.
          </p>
        </div>

        {/* Payout Table */}
        <div className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-8 text-white">Guaranteed Payout Schedule</h2>
          <div className="overflow-hidden rounded-3xl border border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="text-left px-6 py-4 text-zinc-400 font-medium text-sm">Tier</th>
                  <th className="text-left px-6 py-4 text-zinc-400 font-medium text-sm">Followers</th>
                  <th className="text-right px-6 py-4 text-zinc-400 font-medium text-sm">Guaranteed Payout</th>
                </tr>
              </thead>
              <tbody>
                {PAYOUTS.map((row, i) => (
                  <tr
                    key={row.range}
                    className={`border-b border-gray-800/50 hover:bg-gray-900/40 transition-colors ${
                      i === PAYOUTS.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TIER_COLORS[row.tier]}`}>
                        {row.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{row.followers} followers</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xl font-black text-yellow-400">{row.amount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-14">
          <h2 className="font-serif font-bold text-3xl mb-8 text-white">How It Works</h2>
          <div className="space-y-4">
            {[
              { n: '01', title: 'Sign Up as an Influencer', desc: 'Create your free Collab World account and select the Influencer role during onboarding.' },
              { n: '02', title: 'Receive Your Affiliate Package', desc: 'Get your unique tracking link, contest assets (pre-made trailer), and posting schedule.' },
              { n: '03', title: 'Post Daily for 30 Days', desc: 'Share the trailer to Stories on Instagram, TikTok, and Facebook once per day with your affiliate link and #ViralMovieTrailerContest.' },
              { n: '04', title: 'Track Your Earnings', desc: 'Your affiliate dashboard shows real-time commission earnings, click-throughs, and engagement metrics.' },
              { n: '05', title: 'Receive Your Guaranteed Payout', desc: 'At the end of the 30-day period, receive your guaranteed payout if you met the requirements — regardless of commission performance.' },
            ].map((step) => (
              <div key={step.n} className="flex gap-6 items-start bg-gray-900/40 border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-all">
                <div className="bg-yellow-500/20 text-yellow-400 rounded-xl w-10 h-10 flex items-center justify-center shrink-0 font-black text-xs">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4 flex flex-wrap gap-4 justify-center">
          <Link href="/sign-up" className="inline-block bg-yellow-400 text-black font-bold px-12 py-4 rounded-full hover:bg-yellow-300 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_40px_rgba(250,204,21,0.35)] tracking-widest uppercase">
            Start Earning
          </Link>
          <Link href="/rules-influencers" className="inline-block border-2 border-zinc-600 text-white font-bold px-12 py-4 rounded-full hover:border-white transition-all duration-300 hover:-translate-y-1 tracking-widest uppercase">
            View Full Rules
          </Link>
        </div>
      </div>
    </main>
  )
}
