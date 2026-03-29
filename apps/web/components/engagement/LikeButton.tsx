'use client'

import { useState } from 'react'
import LoginModal from './LoginModal'

interface LikeButtonProps {
  entryId: string
  initialLiked: boolean
  initialCount: number
  isAuthenticated: boolean
}

export default function LikeButton({
  entryId,
  initialLiked,
  initialCount,
  isAuthenticated,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  async function handleClick() {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }

    if (loading) return

    // Optimistic update
    const prevLiked = liked
    const prevCount = count
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)
    setLoading(true)

    try {
      const res = await fetch(`/api/v1/entries/${entryId}/like`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to like')
      const data = await res.json()
      setLiked(data.liked)
      setCount(data.likeCount)
    } catch {
      // Revert on error
      setLiked(prevLiked)
      setCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-pressed={liked ? 'true' : 'false'}
        aria-label={liked ? `Unlike (${count} likes)` : `Like (${count} likes)`}
        disabled={loading}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
          liked
            ? 'text-red-400 hover:text-red-300'
            : 'text-zinc-400 hover:text-zinc-300'
        } disabled:opacity-50`}
      >
        {liked ? (
          // Filled heart
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        ) : (
          // Outline heart
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )}
        <span className="text-sm font-medium">{count}</span>
      </button>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
