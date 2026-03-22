import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { LeaderboardEntry } from '@/lib/leaderboard'

interface LeaderboardResponse {
  contestId: string
  contestTitle: string
  entries: LeaderboardEntry[]
  updatedAt: string
}

async function getLeaderboard(slug: string): Promise<LeaderboardResponse | null> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/v1/contests/${slug}/leaderboard`, {
      next: { revalidate: 30 },
    })
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

interface PageProps {
  params: { slug: string }
}

function getRankLabel(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

export default async function LeaderboardPage({ params }: PageProps) {
  const data = await getLeaderboard(params.slug)
  if (!data) notFound()

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
          <h1 className="text-3xl font-black text-white">Leaderboard</h1>
          <p className="text-zinc-400 mt-1">{data.contestTitle}</p>
        </div>

        {/* Table */}
        {data.entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No entries yet</p>
            <p className="text-zinc-600 text-sm mt-2">
              Be the first to submit an entry!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-800">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Entry</th>
                  <th className="pb-3 pr-4">Creator</th>
                  <th className="pb-3 pr-4 text-right">Score</th>
                  <th className="pb-3 pr-4 text-right">Likes</th>
                  <th className="pb-3 pr-4 text-right">Votes</th>
                  <th className="pb-3 text-right">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {data.entries.map((entry) => (
                  <tr
                    key={entry.entryId}
                    className={`${
                      entry.rank === 1
                        ? 'border border-yellow-500/30 bg-yellow-500/5 rounded-xl'
                        : ''
                    }`}
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
                      <div className="flex items-center gap-3">
                        {entry.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={entry.thumbnailUrl}
                            alt={entry.title}
                            className="w-12 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-8 rounded bg-zinc-800" />
                        )}
                        <span className="text-white font-medium text-sm">{entry.title}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        {entry.creatorAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={entry.creatorAvatar}
                            alt={entry.creatorName}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300">
                            {entry.creatorName[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-zinc-300 text-sm">{entry.creatorName}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className="text-white font-bold">
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
