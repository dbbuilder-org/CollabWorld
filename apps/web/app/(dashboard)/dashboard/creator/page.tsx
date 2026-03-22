import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EntryStatusBanner from '@/components/entries/EntryStatusBanner'
import ContestCard from '@/components/contests/ContestCard'

interface EntryStatus {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'winner'
  rejectionReason?: string | null
  title: string
  muxPlaybackId?: string | null
  voteCount: number
  likeCount: number
  commentCount: number
  contest: { slug: string; title: string }
}

interface ContestItem {
  id: string
  title: string
  slug: string
  status: string
  prizePoolTotal: number | string
  thumbnailUrl?: string | null
  entryCount: number
  daysRemaining: number
}

async function getCreatorData(clerkId: string): Promise<{ entries: EntryStatus[]; contests: ContestItem[] }> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

  const [entriesRes, contestsRes] = await Promise.allSettled([
    fetch(`${baseUrl}/api/v1/entries`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/v1/contests?status=active`, { cache: 'no-store' }),
  ])

  const entries: EntryStatus[] =
    entriesRes.status === 'fulfilled' && entriesRes.value.ok
      ? ((await entriesRes.value.json()) as { data: EntryStatus[] }).data ?? []
      : []

  const contests: ContestItem[] =
    contestsRes.status === 'fulfilled' && contestsRes.value.ok
      ? ((await contestsRes.value.json()) as { data: ContestItem[] }).data ?? []
      : []

  // suppress unused warning
  void clerkId

  return { entries, contests }
}

export default async function CreatorDashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const name = user?.firstName ?? user?.username ?? 'Creator'

  const { entries, contests } = await getCreatorData(userId)

  const latestEntry = entries[0] ?? null

  const totalVotes = entries.reduce((sum, e) => sum + (e.voteCount ?? 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Welcome, {name}!</h1>
        <p className="text-zinc-400">Submit your work to contests and track your performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Contest Entries', value: String(entries.length) },
          { label: 'Total Votes', value: String(totalVotes) },
          { label: 'Total Earnings', value: '$0' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-zinc-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* My Contest Entry */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">My Contest Entry</h2>
        {latestEntry ? (
          <div className="space-y-4">
            <EntryStatusBanner
              status={latestEntry.status}
              rejectionReason={latestEntry.rejectionReason}
            />
            <div className="flex items-center justify-between">
              <p className="text-zinc-300 text-sm font-medium">{latestEntry.title}</p>
              <Link
                href={`/contests/${latestEntry.contest.slug}/entries/${latestEntry.id}`}
                className="text-purple-400 text-sm hover:underline"
              >
                View entry →
              </Link>
            </div>
            {latestEntry.status === 'approved' && (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-zinc-800 rounded-xl p-3">
                  <div className="text-white font-bold">{latestEntry.voteCount}</div>
                  <div className="text-zinc-500 text-xs">Votes</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3">
                  <div className="text-white font-bold">{latestEntry.likeCount}</div>
                  <div className="text-zinc-500 text-xs">Likes</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3">
                  <div className="text-white font-bold">{latestEntry.commentCount}</div>
                  <div className="text-zinc-500 text-xs">Comments</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm mb-4">No active contest entries yet.</p>
            <Link
              href="/contests"
              className="inline-block bg-white text-black font-medium px-6 py-3 rounded-xl text-sm hover:bg-zinc-100 transition-colors"
            >
              Browse Active Contests
            </Link>
          </div>
        )}
      </div>

      {/* Active Contests */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Active Contests</h2>
        {contests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">No active contests right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contests.map((contest) => (
              <ContestCard
                key={contest.id}
                id={contest.id}
                title={contest.title}
                slug={contest.slug}
                status={contest.status as import('@/lib/contest').ContestStatus}
                prizePoolTotal={contest.prizePoolTotal}
                thumbnailUrl={contest.thumbnailUrl}
                entryCount={contest.entryCount}
                daysRemaining={contest.daysRemaining}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
