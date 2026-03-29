'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function UpgradeButton() {
  const router = useRouter()

  async function handleUpgrade() {
    const res = await fetch('/api/v1/subscriptions/checkout', { method: 'POST' })
    if (res.ok) {
      const { url } = await res.json() as { url: string }
      if (url) router.push(url)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      className="mt-8 block w-full bg-yellow-400 text-black font-bold px-6 py-3 rounded-full text-center hover:bg-yellow-300 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_30px_rgba(250,204,21,0.3)] tracking-wide uppercase"
    >
      Upgrade Now
    </button>
  )
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif font-bold text-center text-5xl md:text-6xl mb-4">Simple Pricing</h1>
        <p className="mt-4 text-center text-lg text-zinc-400 mb-14">
          Choose the plan that works for you.
        </p>

        <div className="grid gap-8 md:grid-cols-2 max-w-2xl mx-auto">
          {/* Free Plan */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-10 hover:border-gray-700 hover:shadow-2xl transition-all duration-300">
            <h2 className="font-serif font-semibold text-2xl mb-2">Free</h2>
            <p className="text-5xl font-black text-white mt-3">
              $0<span className="text-base font-normal text-zinc-400">/mo</span>
            </p>
            <ul className="mt-8 space-y-3 text-zinc-400">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Join contests</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Submit up to 3 entries</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Vote and engage</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Basic analytics</li>
            </ul>
            <Link
              href="/sign-up"
              className="mt-8 block w-full bg-white text-black font-bold px-6 py-3 rounded-full text-center hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-0.5 tracking-wide uppercase"
            >
              Get Started
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="relative bg-gray-900/50 border-2 border-yellow-500/50 rounded-3xl p-10 hover:border-yellow-400/70 hover:shadow-2xl transition-all duration-300 shadow-[0_0_40px_rgba(250,204,21,0.15)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full tracking-widest uppercase">
                Popular
              </span>
            </div>
            <h2 className="font-serif font-semibold text-2xl mb-2">Premium</h2>
            <p className="text-5xl font-black text-white mt-3">
              $14.99<span className="text-base font-normal text-zinc-400">/mo</span>
            </p>
            <ul className="mt-8 space-y-3 text-zinc-400">
              <li className="flex items-center gap-2"><span className="text-yellow-400">✓</span> Everything in Free</li>
              <li className="flex items-center gap-2"><span className="text-yellow-400">✓</span> Unlimited entries</li>
              <li className="flex items-center gap-2"><span className="text-yellow-400">✓</span> Advanced analytics</li>
              <li className="flex items-center gap-2"><span className="text-yellow-400">✓</span> Analytics export</li>
              <li className="flex items-center gap-2"><span className="text-yellow-400">✓</span> Priority support</li>
            </ul>
            <UpgradeButton />
          </div>
        </div>
      </div>
    </main>
  )
}
