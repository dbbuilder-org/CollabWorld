import type { ContestStatus } from '@/lib/contest'

const STATUS_STYLES: Record<ContestStatus, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  upcoming: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  active: 'bg-green-500/20 text-green-400 border border-green-500/30',
  voting: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  completed: 'bg-zinc-600/40 text-zinc-400 border border-zinc-600/30',
  archived: 'bg-zinc-700/40 text-zinc-500',
}

const STATUS_LABELS: Record<ContestStatus, string> = {
  draft: 'Draft',
  upcoming: 'Upcoming',
  active: 'Active',
  voting: 'Voting Open',
  completed: 'Completed',
  archived: 'Archived',
}

interface StatusBadgeProps {
  status: ContestStatus
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]} ${className}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
