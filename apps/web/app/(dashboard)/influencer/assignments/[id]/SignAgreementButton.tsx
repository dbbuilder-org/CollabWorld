'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SignAgreementButtonProps {
  assignmentId: string
}

export function SignAgreementButton({ assignmentId }: SignAgreementButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSign() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/influencers/assignments/${assignmentId}/sign`, {
        method: 'POST',
      })
      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to sign agreement')
        return
      }
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <p className="text-red-400 text-sm mb-3">{error}</p>
      )}
      <button
        onClick={handleSign}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-colors"
      >
        {loading ? 'Signing...' : 'Sign Agreement'}
      </button>
    </div>
  )
}
