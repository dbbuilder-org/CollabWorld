'use client'

import { useState } from 'react'
import LoginModal from './LoginModal'

interface VoteButtonProps {
  entryId: string
  contestStatus: string
  hasVoted: boolean
  voteCount: number
  isAuthenticated: boolean
}

export default function VoteButton({
  entryId,
  contestStatus,
  hasVoted,
  voteCount,
  isAuthenticated,
}: VoteButtonProps) {
  const [voted, setVoted] = useState(hasVoted)
  const [count, setCount] = useState(voteCount)
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const isVotingOpen = contestStatus === 'voting'
  const isDisabled = voted || !isVotingOpen || loading

  async function handleClick() {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }

    if (isDisabled) return

    const confirmed = window.confirm(
      'Cast your vote for this entry? You can only vote once in this contest.'
    )
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await fetch(`/api/v1/entries/${entryId}/vote`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Failed to vote')
        return
      }
      const data = await res.json()
      setVoted(true)
      setCount(data.voteCount)
    } catch {
      alert('Failed to vote. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isDisabled}
        aria-pressed={voted ? 'true' : 'false'}
        title={
          !isVotingOpen
            ? 'Voting is not open yet'
            : voted
            ? 'You have already voted'
            : 'Cast your vote'
        }
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
          voted
            ? 'text-yellow-400 cursor-default'
            : isVotingOpen
            ? 'text-zinc-400 hover:text-yellow-400'
            : 'text-zinc-600 cursor-not-allowed'
        } disabled:opacity-50`}
      >
        {/* Trophy/star icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={voted ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span className="text-sm font-medium">{count}</span>
      </button>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
