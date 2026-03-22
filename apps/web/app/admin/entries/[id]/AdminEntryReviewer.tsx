'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminEntryReviewerProps {
  entryId: string
  currentStatus: string
}

export default function AdminEntryReviewer({ entryId, currentStatus }: AdminEntryReviewerProps) {
  const router = useRouter()
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submitReview(action: 'approve' | 'reject') {
    setError(null)
    if (action === 'reject' && !rejectionReason.trim()) {
      setError('Rejection reason is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/v1/admin/entries/${entryId}/review`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          action === 'approve'
            ? { action: 'approve' }
            : { action: 'reject', reason: rejectionReason.trim() }
        ),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Failed to submit review')
        return
      }

      router.push('/admin/entries')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (currentStatus !== 'pending') {
    return (
      <div className="text-zinc-500 text-sm italic">
        This entry has already been reviewed ({currentStatus}).
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-300">Review Decision</h3>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {showRejectForm ? (
        <div className="space-y-3">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection (shown to creator)"
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500 resize-none"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => submitReview('reject')}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-5 rounded-xl text-sm transition-colors"
            >
              {isSubmitting ? 'Rejecting…' : 'Confirm Rejection'}
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              disabled={isSubmitting}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2 px-5 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => submitReview('approve')}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-5 rounded-xl text-sm transition-colors"
          >
            {isSubmitting ? 'Approving…' : 'Approve'}
          </button>
          <button
            type="button"
            onClick={() => setShowRejectForm(true)}
            disabled={isSubmitting}
            className="bg-red-900/40 hover:bg-red-600 border border-red-700 text-red-400 hover:text-white font-medium py-2 px-5 rounded-xl text-sm transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
