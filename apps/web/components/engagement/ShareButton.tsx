'use client'

import { useState } from 'react'
import LoginModal from './LoginModal'

interface ShareButtonProps {
  entryId: string
  isAuthenticated: boolean
}

export default function ShareButton({ entryId, isAuthenticated }: ShareButtonProps) {
  const [showLogin, setShowLogin] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }

    if (loading) return
    setLoading(true)

    try {
      const res = await fetch(`/api/v1/entries/${entryId}/share`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to share')
      const data = await res.json()
      const shareUrl: string = data.shareUrl

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleSocialShare(platform: 'twitter' | 'facebook') {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/v1/entries/${entryId}/share`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to share')
      const data = await res.json()
      const shareUrl: string = data.shareUrl
      const encodedUrl = encodeURIComponent(shareUrl)

      let intentUrl: string
      if (platform === 'twitter') {
        intentUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=Check+out+this+entry+on+Collab+World!`
      } else {
        intentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
      }
      window.open(intentUrl, '_blank', 'noopener,noreferrer')
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={handleShare}
          disabled={loading}
          title="Copy share link"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {copied ? (
            <>
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm font-medium text-green-400">Copied!</span>
            </>
          ) : (
            <>
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
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span className="text-sm font-medium">Share</span>
            </>
          )}
        </button>

        {/* Twitter/X */}
        <button
          onClick={() => handleSocialShare('twitter')}
          disabled={loading}
          title="Share on X (Twitter)"
          className="p-2 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Share on X"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleSocialShare('facebook')}
          disabled={loading}
          title="Share on Facebook"
          className="p-2 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Share on Facebook"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
