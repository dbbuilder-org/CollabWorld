'use client'

import { useState } from 'react'

interface Props {
  affiliateLink: string
}

export default function InfluencerAffiliateClient({ affiliateLink }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(affiliateLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex items-center gap-2 bg-black/40 border border-gray-700 rounded-xl px-3 py-2">
      <span className="text-zinc-400 text-xs truncate flex-1 font-mono">{affiliateLink}</span>
      <button
        onClick={handleCopy}
        className="shrink-0 text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}
