import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EntryStatusBanner from '@/components/entries/EntryStatusBanner'
import ContestCard from '@/components/contests/ContestCard'
import { db } from '@collabworld/db'

export const dynamic = 'force-dynamic'

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

async function getCreatorData(clerkId: string): Promise<{ entries: EntryStatus[]; contests: ContestItem[]; dbUserId: string | null }> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

  const dbUser = await db.user.findUnique({ where: { clerkId }, select: { id: true } })

  const [dbEntries, contestsRes] = await Promise.allSettled([
    dbUser
      ? db.contestEntry.findMany({
          where: { creatorId: dbUser.id },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            rejectionReason: true,
            muxPlaybackId: true,
            voteCount: true,
            likeCount: true,
            commentCount: true,
            contest: { select: { slug: true, title: true } },
          },
        })
      : Promise.resolve([]),
    fetch(`${baseUrl}/api/v1/contests?status=active`, { cache: 'no-store' }),
  ])

  const entries: EntryStatus[] =
    dbEntries.status === 'fulfilled' ? (dbEntries.value as EntryStatus[]) : []

  const contests: ContestItem[] =
    contestsRes.status === 'fulfilled' && contestsRes.value.ok
      ? ((await contestsRes.value.json()) as { data: ContestItem[] }).data ?? []
      : []

  return { entries, contests, dbUserId: dbUser?.id ?? null }
}

export default async function CreatorDashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const name = user?.firstName ?? user?.username ?? 'Creator'

  const { entries, contests, dbUserId } = await getCreatorData(userId)

  const [myLikes, myComments] = dbUserId
    ? await Promise.all([
        db.entryEngagement.findMany({
          where: { userId: dbUserId!, type: 'like' },
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: {
            entry: {
              select: { id: true, title: true, contest: { select: { slug: true } } },
            },
          },
        }),
        db.entryEngagement.findMany({
          where: { userId: dbUserId!, type: 'comment' },
          orderBy: { createdAt: 'desc' },
          take: 6,
          include: {
            entry: {
              select: { id: true, title: true, contest: { select: { slug: true } } },
            },
          },
        }),
      ])
    : [[], []]

  const totalVotes = entries.reduce((sum, e) => sum + (e.voteCount ?? 0), 0)
  const totalLikes = entries.reduce((sum, e) => sum + (e.likeCount ?? 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Welcome, {name}!</h1>
        <p className="text-zinc-400">Submit your work to contests and track your performance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Entries Submitted', value: String(entries.length) },
          { label: 'Total Votes', value: String(totalVotes) },
          { label: 'Total Likes', value: String(totalLikes) },
          { label: 'Approved', value: String(entries.filter((e) => e.status === 'approved').length) },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-zinc-500 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* My Video Library */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-xl text-white">My Videos</h2>
          <Link href="/contests" className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors">
            Submit to a contest →
          </Link>
        </div>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm mb-4">No entries yet.</p>
            <Link
              href="/contests"
              className="inline-block bg-white text-black font-bold px-6 py-3 rounded-full text-sm hover:bg-zinc-100 transition-colors uppercase tracking-widest"
            >
              Browse Active Contests
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-black/30 border border-gray-700 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-medium text-sm truncate">{entry.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <EntryStatusBanner
                        status={entry.status}
                        rejectionReason={entry.rejectionReason}
                      />
                      <span className="text-zinc-600 text-xs">{entry.contest.title}</span>
                    </div>
                    {entry.status === 'approved' && (
                      <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                        <span>{entry.voteCount} votes</span>
                        <span>{entry.likeCount} likes</span>
                        <span>{entry.commentCount} comments</span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/watch/${entry.id}`}
                    className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors shrink-0"
                  >
                    Watch →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Likes */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-xl text-white">My Likes</h2>
          <Link href="/api/v1/account/likes" className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors">
            View all
          </Link>
        </div>
        {myLikes.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-6">No liked videos yet.</p>
        ) : (
          <div className="space-y-2">
            {myLikes.map((like) => (
              <Link
                key={like.id}
                href={`/watch/${like.entry.id}`}
                className="flex items-center gap-3 py-2 hover:text-yellow-400 transition-colors group"
              >
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                <span className="text-sm text-zinc-300 group-hover:text-yellow-400 transition-colors truncate">{like.entry.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* My Comments */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-xl text-white">My Comments</h2>
        </div>
        {myComments.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-6">No comments posted yet.</p>
        ) : (
          <div className="space-y-3">
            {myComments.map((comment) => (
              <div key={comment.id} className="bg-black/30 rounded-2xl p-3">
                <Link href={`/watch/${comment.entry.id}`} className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
                  {comment.entry.title}
                </Link>
                <p className="text-zinc-300 text-sm mt-1 line-clamp-2">{comment.content}</p>
                <p className="text-zinc-600 text-xs mt-1">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Contests */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
        <h2 className="font-serif font-bold text-xl text-white mb-4">Active Contests</h2>
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
