import { notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import LikeButton from '@/components/engagement/LikeButton'
import VoteButton from '@/components/engagement/VoteButton'
import ShareButton from '@/components/engagement/ShareButton'
import CommentSection from '@/components/engagement/CommentSection'
import MuxVideoPlayer from '@/components/entries/MuxVideoPlayer'

interface EntryDetail {
  id: string
  title: string
  description?: string | null
  muxPlaybackId?: string | null
  thumbnailUrl?: string | null
  status: string
  contestId: string
  likeCount: number
  voteCount: number
  commentCount: number
  shareCount: number
  creator: {
    id: string
    displayName: string
    avatarUrl?: string | null
  }
  contest: {
    id: string
    title: string
    slug: string
    status: string
  }
}

async function getEntry(entryId: string): Promise<EntryDetail | null> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/v1/entries/${entryId}`, { cache: 'no-store' })
    if (res.status === 404) return null
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

interface PageProps {
  params: { slug: string; entryId: string }
}

export default async function EntryDetailPage({ params }: PageProps) {
  const entry = await getEntry(params.entryId)
  if (!entry) notFound()

  const { userId } = auth()
  const isAuthenticated = !!userId

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href={`/contests/${params.slug}`}
          className="text-zinc-400 hover:text-white text-sm transition-colors mb-6 inline-block"
        >
          ← Back to Entries
        </Link>

        {/* Video player */}
        {entry.muxPlaybackId && (
          <div className="mb-6 rounded-2xl overflow-hidden">
            <MuxVideoPlayer playbackId={entry.muxPlaybackId} />
          </div>
        )}

        {/* Entry info */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white mb-3">{entry.title}</h1>

          {/* Creator info */}
          <div className="flex items-center gap-3 mb-4">
            {entry.creator.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.creator.avatarUrl}
                alt={entry.creator.displayName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm text-zinc-300">
                {entry.creator.displayName[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-zinc-300">{entry.creator.displayName}</span>
          </div>

          {entry.description && (
            <p className="text-zinc-400 leading-relaxed">{entry.description}</p>
          )}
        </div>

        {/* Engagement row */}
        <div className="flex items-center gap-2 py-4 border-t border-b border-zinc-800 mb-8">
          <LikeButton
            entryId={entry.id}
            initialLiked={false}
            initialCount={entry.likeCount}
            isAuthenticated={isAuthenticated}
          />

          {entry.contest.status === 'voting' && (
            <VoteButton
              entryId={entry.id}
              contestStatus={entry.contest.status}
              hasVoted={false}
              voteCount={entry.voteCount}
              isAuthenticated={isAuthenticated}
            />
          )}

          <div className="flex items-center gap-1.5 px-3 py-2 text-zinc-400">
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-sm font-medium">{entry.commentCount}</span>
          </div>

          <ShareButton entryId={entry.id} isAuthenticated={isAuthenticated} />
        </div>

        {/* Comments */}
        <CommentSection entryId={entry.id} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  )
}
