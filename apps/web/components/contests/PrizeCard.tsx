interface Prize {
  rank: number
  prizeAmount: number | string
  description?: string | null
}

const RANK_STYLES: Record<number, string> = {
  1: 'border-yellow-500/50 bg-yellow-500/10',
  2: 'border-zinc-400/50 bg-zinc-400/10',
  3: 'border-amber-600/50 bg-amber-600/10',
}

const RANK_LABELS: Record<number, string> = {
  1: '🥇 1st Place',
  2: '🥈 2nd Place',
  3: '🥉 3rd Place',
}

interface PrizeCardProps {
  prize: Prize
}

export default function PrizeCard({ prize }: PrizeCardProps) {
  const borderStyle = RANK_STYLES[prize.rank] ?? 'border-zinc-700/50 bg-zinc-800/50'
  const label = RANK_LABELS[prize.rank] ?? `${prize.rank}th Place`
  const amount =
    typeof prize.prizeAmount === 'string'
      ? parseFloat(prize.prizeAmount)
      : prize.prizeAmount

  return (
    <div className={`rounded-xl border p-4 ${borderStyle}`}>
      <div className="text-sm font-medium text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">
        ${amount.toLocaleString()}
      </div>
      {prize.description && (
        <div className="mt-1 text-xs text-zinc-500">{prize.description}</div>
      )}
    </div>
  )
}
