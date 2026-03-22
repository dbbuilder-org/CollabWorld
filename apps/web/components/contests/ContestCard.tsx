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
      className="group block rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
    >
      {/* Thumbnail */}
      <div className="relative h-40 w-full overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-900 via-blue-900 to-zinc-900" />
        )}
        <div className="absolute top-3 left-3">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-base leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
          {title}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-white">
              ${amount.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500">Prize Pool</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-zinc-300">{entryCount.toLocaleString()}</div>
            <div className="text-xs text-zinc-500">Entries</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-zinc-400 font-medium">{getCountdownLabel()}</div>
      </div>
    </Link>
  )
}
