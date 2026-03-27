import Link from 'next/link'
import StatusBadge from './StatusBadge'
import type { ContestStatus } from '@/lib/contest'

interface ContestCardProps {
  id: string
  title: string
  slug: string
  status: ContestStatus
  prizePoolTotal: number | string
  thumbnailUrl?: string | null
  entryCount: number
  daysRemaining: number
}

export default function ContestCard({
  title,
  slug,
  status,
  prizePoolTotal,
  thumbnailUrl,
  entryCount,
  daysRemaining,
}: ContestCardProps) {
  const amount =
    typeof prizePoolTotal === 'string' ? parseFloat(prizePoolTotal) : prizePoolTotal

  function getCountdownLabel(): string {
    if (status === 'voting') return 'Voting Open'
    if (status === 'completed' || status === 'archived') return 'Ended'
    if (daysRemaining === 0) return 'Ends today'
    return `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`
  }

  return (
    <Link
      href={`/contests/${slug}`}
      className="group block rounded-3xl overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-gray-600 hover:shadow-2xl transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-900 via-blue-900 to-zinc-900" />
        )}
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif font-semibold text-white text-base leading-snug line-clamp-2 group-hover:text-yellow-400 transition-colors">
          {title}
        </h3>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-white">${amount.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-0.5">Prize Pool</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-zinc-300">{entryCount.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-0.5">Entries</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-zinc-400 font-medium">{getCountdownLabel()}</div>
      </div>
    </Link>
  )
}
