import Link from 'next/link'
import Image from 'next/image'

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
  thumbnailUrl?: string | null
  creator: EntryCreator
  likeCount: number
  voteCount: number
  commentCount: number
  viewCount?: number
  href?: string
}

export default function EntryCard({
  id,
  title,
  contestSlug,
  contestName,
  muxPlaybackId,
  thumbnailUrl: propThumbnailUrl,
  creator,
  likeCount,
  voteCount,
  commentCount,
  viewCount,
  href,
}: EntryCardProps) {
  const thumbnailUrl = propThumbnailUrl
    ?? (muxPlaybackId ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg` : null)

  const linkHref = href ?? `/watch/${id}`

  return (
    <Link
      href={linkHref}
      className="group block rounded-3xl overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-yellow-900/30 via-gray-900 to-black flex items-center justify-center">
            <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Contest badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm">
            {contestName}
          </span>
        </div>
        {viewCount !== undefined && viewCount > 0 && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/70 text-zinc-300 text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
              {viewCount.toLocaleString()} views
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-serif font-semibold text-white text-sm leading-snug line-clamp-2 group-hover:text-yellow-400 transition-colors">
          {title}
        </h3>

        {/* Creator */}
        <div className="flex items-center gap-2">
          {creator.avatarUrl ? (
            <Image
              src={creator.avatarUrl}
              alt={creator.displayName}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-xs font-bold shrink-0">
              {creator.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-zinc-400 text-xs truncate">{creator.displayName}</span>
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
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            {voteCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {commentCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
