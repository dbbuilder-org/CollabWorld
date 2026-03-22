import Link from 'next/link'

interface EntryCreator {
  displayName: string
  avatarUrl?: string | null
}

export interface EntryCardProps {
  id: string
  title: string
  contestSlug: string
  contestName: string
  muxPlaybackId?: string | null
  creator: EntryCreator
  likeCount: number
  voteCount: number
  commentCount: number
}

export default function EntryCard({
  id,
  title,
  contestSlug,
  contestName,
  muxPlaybackId,
  creator,
  likeCount,
  voteCount,
  commentCount,
}: EntryCardProps) {
  const thumbnailUrl = muxPlaybackId
    ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg`
    : null

  return (
    <Link
      href={`/contests/${contestSlug}/entries/${id}`}
      className="group block rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-900 via-blue-900 to-zinc-900 flex items-center justify-center">
            <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Contest badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm">
            {contestName}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
          {title}
        </h3>

        {/* Creator */}
        <div className="flex items-center gap-2">
          {creator.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={creator.avatarUrl}
              alt={creator.displayName}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-purple-800 flex items-center justify-center text-white text-xs font-bold">
              {creator.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-zinc-400 text-xs">{creator.displayName}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-zinc-500 text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            {likeCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 0116 0 8 8 0 01-16 0zm10-3a1 1 0 10-2 0v3H7a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V7z" />
            </svg>
            {voteCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            {commentCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
