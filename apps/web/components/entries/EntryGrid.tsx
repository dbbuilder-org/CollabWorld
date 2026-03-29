'use client'

import EntryCard from './EntryCard'

interface EntryGridItem {
  id: string
  title: string
  muxPlaybackId: string | null
  thumbnailUrl: string | null
  likeCount: number
  voteCount: number
  commentCount: number
  viewCount: number
  creator: { displayName: string; avatarUrl: string | null }
  contest: { id: string; title: string; slug: string }
}

interface EntryGridProps {
  entries: EntryGridItem[]
  loading?: boolean
}

export default function EntryGrid({ entries, loading }: EntryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-3xl overflow-hidden bg-gray-900/50 border border-gray-800 animate-pulse">
            <div className="h-44 w-full bg-gray-800" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
              <div className="h-3 bg-gray-800 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-zinc-600 text-5xl mb-4">🎬</div>
        <p className="text-zinc-400 text-lg font-medium">No videos yet</p>
        <p className="text-zinc-600 text-sm mt-2">Check back soon — entries are on their way.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          id={entry.id}
          title={entry.title}
          contestSlug={entry.contest.slug}
          contestName={entry.contest.title}
          muxPlaybackId={entry.muxPlaybackId}
          thumbnailUrl={entry.thumbnailUrl}
          creator={entry.creator}
          likeCount={entry.likeCount}
          voteCount={entry.voteCount}
          commentCount={entry.commentCount}
          viewCount={entry.viewCount}
        />
      ))}
    </div>
  )
}
