'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  plan: 'free' | 'premium'
  hasStripeCustomer: boolean
}

export default function BillingSection({ plan, hasStripeCustomer }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleManageBilling() {
    setLoading(true)
    const res = await fetch('/api/v1/subscriptions/portal', { method: 'POST' })
    if (res.ok) {
      const { url } = await res.json() as { url: string }
      if (url) window.location.href = url
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="text-sm font-medium text-zinc-300 mb-0.5">Current Plan</p>
        {plan === 'premium' ? (
          <span className="inline-flex items-center gap-1.5 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full font-medium">
            Premium
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs bg-gray-700/50 text-zinc-400 border border-gray-600 px-3 py-1 rounded-full font-medium">
            Free
          </span>
        )}
      </div>

      {plan === 'premium' && hasStripeCustomer ? (
        <button
          onClick={handleManageBilling}
          disabled={loading}
          className="border border-gray-700 text-zinc-400 hover:text-white hover:border-gray-500 font-medium px-5 py-2 rounded-full text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Manage Billing'}
        </button>
      ) : (
        <Link
          href="/pricing"
          className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-full hover:bg-yellow-300 transition-all uppercase tracking-widest text-sm"
        >
          Upgrade to Premium
        </Link>
      )}
    </div>
  )
}
