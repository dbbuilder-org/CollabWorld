import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { LeaderboardEntry } from '@/lib/leaderboard'

export const dynamic = 'force-dynamic'

interface LeaderboardResponse {
  contestId: string
  contestTitle: string
  entries: LeaderboardEntry[]
  updatedAt: string
}

type TimeFilter = 'today' | 'week' | 'all'

async function getLeaderboard(slug: string, timeFilter: TimeFilter): Promise<LeaderboardResponse | null> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  try {
    const res = await fetch(
      `${baseUrl}/api/v1/contests/${slug}/leaderboard?timeFilter=${timeFilter}`,
      { next: { revalidate: 30 } }
    )
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

interface PageProps {
  params: { slug: string }
  searchParams: { timeFilter?: string }
}

function getRankLabel(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

export default async function LeaderboardPage({ params, searchParams }: PageProps) {
  const rawFilter = searchParams.timeFilter ?? 'all'
  const timeFilter: TimeFilter =
    rawFilter === 'today' ? 'today' :
    rawFilter === 'week'  ? 'week'  :
    'all'

  const data = await getLeaderboard(params.slug, timeFilter)
  if (!data) notFound()

  const tabOptions: { value: TimeFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week',  label: 'This Week' },
    { value: 'all',   label: 'All Time' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/contests/${params.slug}`}
            className="text-zinc-400 hover:text-white text-sm transition-colors mb-4 inline-block"
          >
            ← Back to Contest
          </Link>
          <h1 className="font-serif font-bold text-3xl text-white">Leaderboard</h1>
          <p className="text-zinc-400 mt-1">{data.contestTitle}</p>
        </div>

        {/* Time filter tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-full p-1 border border-gray-800 mb-8 w-fit">
          {tabOptions.map((opt) => (
            <Link
              key={opt.value}
              href={`?timeFilter=${opt.value}`}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                timeFilter === opt.value
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        {data.entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No entries for this time period</p>
            <p className="text-zinc-600 text-sm mt-2">
              Try a different time filter or check back later.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wide border-b border-gray-800">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Entry</th>
                  <th className="pb-3 pr-4">Creator</th>
                  <th className="pb-3 pr-4 text-right">Score</th>
                  <th className="pb-3 pr-4 text-right">Likes</th>
                  <th className="pb-3 pr-4 text-right">Votes</th>
                  <th className="pb-3 text-right">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900">
                {data.entries.map((entry) => (
                  <tr
                    key={entry.entryId}
                    className={`${
                      entry.rank === 1
                        ? 'bg-yellow-500/5'
                        : 'hover:bg-gray-900/40'
                    } transition-colors`}
                  >
                    <td className="py-4 pr-4">
                      <span
                        className={`text-lg font-bold ${
                          entry.rank === 1
                            ? 'text-yellow-400'
                            : entry.rank <= 3
                            ? 'text-zinc-300'
                            : 'text-zinc-500'
                        }`}
                      >
                        {getRankLabel(entry.rank)}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <Link href={`/watch/${entry.entryId}`} className="flex items-center gap-3 group">
                        <div className="relative w-12 h-8 rounded overflow-hidden shrink-0 bg-gray-800">
                          {entry.thumbnailUrl ? (
                            <Image
                              src={entry.thumbnailUrl}
                              alt={entry.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <span className="text-white font-medium text-sm group-hover:text-yellow-400 transition-colors">
                          {entry.title}
                        </span>
                      </Link>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        {entry.creatorAvatar ? (
                          <Image
                            src={entry.creatorAvatar}
                            alt={entry.creatorName}
                            width={24}
                            height={24}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-xs text-yellow-400 font-bold">
                            {entry.creatorName[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-zinc-300 text-sm">{entry.creatorName}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className="text-yellow-400 font-bold">
                        {Number(entry.compositeScore).toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right text-zinc-400 text-sm">
                      {entry.likeCount}
                    </td>
                    <td className="py-4 pr-4 text-right text-zinc-400 text-sm">
                      {entry.voteCount}
                    </td>
                    <td className="py-4 text-right text-zinc-400 text-sm">
                      {entry.commentCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-zinc-600 mt-8 text-center">
          Updated {new Date(data.updatedAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
