'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function UpgradeButton() {
  const router = useRouter()

  async function handleUpgrade() {
    const res = await fetch('/api/v1/subscriptions/checkout', { method: 'POST' })
    if (res.ok) {
      const { url } = await res.json()
      if (url) router.push(url)
    } else {
      const err = await res.json().catch(() => ({}))
      console.error('[pricing] checkout error:', err)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      className="mt-8 block w-full rounded-lg bg-indigo-600 px-6 py-3 text-center font-medium text-white hover:bg-indigo-700"
    >
      Upgrade Now
    </button>
  )
}

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-center text-4xl font-bold text-gray-900">Simple Pricing</h1>
      <p className="mt-4 text-center text-lg text-gray-600">Choose the plan that works for you.</p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {/* Free Plan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Free</h2>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            $0<span className="text-base font-normal text-gray-500">/mo</span>
          </p>
          <ul className="mt-6 space-y-3 text-gray-600">
            <li>✓ Join contests</li>
            <li>✓ Submit up to 3 entries</li>
            <li>✓ Vote and engage</li>
            <li>✓ Basic analytics</li>
          </ul>
          <Link
            href="/sign-up"
            className="mt-8 block rounded-lg bg-gray-900 px-6 py-3 text-center font-medium text-white hover:bg-gray-800"
          >
            Get Started
          </Link>
        </div>

        {/* Premium Plan */}
        <div className="rounded-2xl border-2 border-indigo-500 bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Premium</h2>
            <span className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-medium text-white">Popular</span>
          </div>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            $14.99<span className="text-base font-normal text-gray-500">/mo</span>
          </p>
          <ul className="mt-6 space-y-3 text-gray-600">
            <li>✓ Everything in Free</li>
            <li>✓ Unlimited entries</li>
            <li>✓ Advanced analytics</li>
            <li>✓ Analytics export</li>
            <li>✓ Priority support</li>
          </ul>
          <UpgradeButton />
        </div>
      </div>
    </main>
  )
}
