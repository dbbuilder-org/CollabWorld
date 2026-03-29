'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@clerk/nextjs'
import MuxVideoPlayer from '@/components/entries/MuxVideoPlayer'
import LikeButton from '@/components/engagement/LikeButton'
import VoteButton from '@/components/engagement/VoteButton'
import CommentSection from '@/components/engagement/CommentSection'
import ShareModal from '@/components/engagement/ShareModal'

interface WatchEntry {
  id: string
  title: string
  description: string | null
  muxPlaybackId: string | null
  thumbnailUrl: string | null
  voteCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  viewCount: number
  createdAt: string
  creator: { id: string; displayName: string; avatarUrl: string | null; accountType: string; bio: string | null }
  contest: { id: string; title: string; slug: string; status: string }
}

interface UpNextEntry {
  id: string
  title: string
  muxPlaybackId: string | null
  thumbnailUrl: string | null
  likeCount: number
  viewCount: number
  creator: { displayName: string; avatarUrl: string | null }
  contest: { title: string; slug: string }
}

interface Props {
  entry: WatchEntry
  upNext: UpNextEntry[]
  initialLiked: boolean
  initialVoted: boolean
}

export default function WatchPageClient({ entry, upNext, initialLiked, initialVoted }: Props) {
  const { isSignedIn } = useAuth()
  const [showShareModal, setShowShareModal] = useState(false)

  const thumbnailUrl =
    entry.thumbnailUrl ??
    (entry.muxPlaybackId ? `https://image.mux.com/${entry.muxPlaybackId}/thumbnail.jpg` : null)

  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
          <Link href="/feed" className="hover:text-white transition-colors">Feed</Link>
          <span>→</span>
          <Link href={`/contests/${entry.contest.slug}`} className="hover:text-white transition-colors">
            {entry.contest.title}
          </Link>
          <span>→</span>
          <span className="text-zinc-300 truncate max-w-[200px]">{entry.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main column */}
          <div className="space-y-6">
            {/* Video player */}
            <div className="rounded-3xl overflow-hidden bg-gray-950 border border-gray-800">
              {entry.muxPlaybackId ? (
                <MuxVideoPlayer
                  playbackId={entry.muxPlaybackId}
                  thumbnailUrl={thumbnailUrl ?? undefined}
                  title={entry.title}
                  className="aspect-video w-full"
                />
              ) : (
                <div className="aspect-video w-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                  <p className="text-zinc-500">Video processing...</p>
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div>
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-white mb-2">{entry.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-zinc-500 text-sm">
                <span>{entry.viewCount.toLocaleString()} views</span>
                <span>•</span>
                <span>{formattedDate}</span>
                <span>•</span>
                <Link href={`/contests/${entry.contest.slug}`} className="text-yellow-400 hover:text-yellow-300 transition-colors">
                  {entry.contest.title}
                </Link>
              </div>
            </div>

            {/* Engagement row */}
            <div className="flex flex-wrap items-center gap-3 border-t border-b border-gray-800 py-4">
              <LikeButton
                entryId={entry.id}
                initialLiked={initialLiked}
                initialCount={entry.likeCount}
                isAuthenticated={!!isSignedIn}
              />
              <VoteButton
                entryId={entry.id}
                contestStatus={entry.contest.status}
                hasVoted={initialVoted}
                voteCount={entry.voteCount}
                isAuthenticated={!!isSignedIn}
              />
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-700 text-zinc-300 hover:border-yellow-500/50 hover:text-yellow-400 transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share ({entry.shareCount})
              </button>
            </div>

            {/* Creator info */}
            <div className="flex items-start gap-4 bg-gray-900/50 border border-gray-800 rounded-3xl p-5">
              {entry.creator.avatarUrl ? (
                <Image
                  src={entry.creator.avatarUrl}
                  alt={entry.creator.displayName}
                  width={56}
                  height={56}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-xl font-bold shrink-0">
                  {entry.creator.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white">{entry.creator.displayName}</span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full capitalize">
                    {entry.creator.accountType}
                  </span>
                </div>
                {entry.creator.bio && (
                  <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{entry.creator.bio}</p>
                )}
              </div>
            </div>

            {/* Description */}
            {entry.description && (
              <div className="bg-gray-900/30 rounded-2xl p-4">
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{entry.description}</p>
              </div>
            )}

            {/* Comments */}
            <CommentSection
              entryId={entry.id}
              isAuthenticated={!!isSignedIn}
            />
          </div>

          {/* Up Next sidebar */}
          <aside className="space-y-4">
            <h2 className="font-serif font-semibold text-lg text-white">Up Next</h2>
            <div className="space-y-3">
              {upNext.map((item) => {
                const thumb = item.thumbnailUrl ?? (item.muxPlaybackId ? `https://image.mux.com/${item.muxPlaybackId}/thumbnail.jpg` : null)
                return (
                  <Link
                    key={item.id}
                    href={`/watch/${item.id}`}
                    className="flex gap-3 group hover:bg-gray-900/50 rounded-2xl p-2 -mx-2 transition-colors"
                  >
                    <div className="relative w-28 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-800">
                      {thumb ? (
                        <Image src={thumb} alt={item.title} fill sizes="112px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium line-clamp-2 group-hover:text-yellow-400 transition-colors leading-snug">
                        {item.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">{item.creator.displayName}</p>
                      <p className="text-xs text-zinc-600">{item.viewCount.toLocaleString()} views</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </aside>
        </div>
      </div>

      <ShareModal
        entryId={entry.id}
        entryTitle={entry.title}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </main>
  )
}
