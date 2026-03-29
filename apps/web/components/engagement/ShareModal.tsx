'use client'

import { useState, useEffect } from 'react'

interface ShareModalProps {
  entryId: string
  entryTitle: string
  isOpen: boolean
  onClose: () => void
}

const PLATFORMS = [
  { id: 'tiktok',    label: 'TikTok',     icon: '🎵', color: 'hover:border-pink-500/50 hover:text-pink-400' },
  { id: 'instagram', label: 'Instagram',  icon: '📸', color: 'hover:border-purple-500/50 hover:text-purple-400' },
  { id: 'facebook',  label: 'Facebook',   icon: '👥', color: 'hover:border-blue-500/50 hover:text-blue-400' },
  { id: 'twitter',   label: 'X / Twitter',icon: '🐦', color: 'hover:border-sky-500/50 hover:text-sky-400' },
]

export default function ShareModal({ entryId, entryTitle, isOpen, onClose }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activePlatform, setActivePlatform] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setShareUrl(null)
      setCopied(false)
      setActivePlatform(null)
    }
  }, [isOpen])

  async function generateLink(platform?: string) {
    if (loading) return
    setLoading(true)
    setActivePlatform(platform ?? 'copy')
    try {
      const res = await fetch(`/api/v1/entries/${entryId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform ?? null }),
      })
      const data = await res.json()
      if (data.shareUrl) {
        setShareUrl(data.shareUrl)
        if (!platform) {
          await navigator.clipboard.writeText(data.shareUrl)
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
        } else {
          openPlatformShare(platform, data.shareUrl)
        }
      }
    } catch (err) {
      console.error('Share error:', err)
    } finally {
      setLoading(false)
    }
  }

  function openPlatformShare(platform: string, url: string) {
    const encoded = encodeURIComponent(url)
    const text = encodeURIComponent(`Check out "${entryTitle}" on Collab World! 🎬 #ViralMovieTrailerContest`)
    const platformUrls: Record<string, string> = {
      facebook:  `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      twitter:   `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`,
      tiktok:    url, // TikTok share is via copy
      instagram: url, // Instagram share is via copy
    }
    if (platformUrls[platform] !== url) {
      window.open(platformUrls[platform], '_blank', 'width=600,height=500')
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-3xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-xl text-white">Share This Video</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-zinc-400 text-sm line-clamp-2">{entryTitle}</p>

        {/* Copy link */}
        <button
          onClick={() => generateLink()}
          disabled={loading && activePlatform === 'copy'}
          className="w-full flex items-center justify-between gap-3 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 hover:border-yellow-500/50 hover:text-yellow-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔗</span>
            <span className="text-sm font-medium text-white">Copy Link</span>
          </div>
          {copied ? (
            <span className="text-yellow-400 text-xs font-medium">Copied!</span>
          ) : (
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>

        {/* Platform buttons */}
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => generateLink(p.id)}
              disabled={loading}
              className={`flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 text-zinc-300 transition-all ${p.color}`}
            >
              <span className="text-xl">{p.icon}</span>
              <span className="text-sm font-medium">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
