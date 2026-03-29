import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@collabworld/db'
import { getRoleFromMetadata } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function UploadPage() {
  const { userId, sessionClaims } = auth()
  if (!userId) redirect('/sign-in')

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (role !== 'creator') {
    redirect('/dashboard')
  }

  const [contests, dbUser] = await Promise.all([
    db.contest.findMany({
      where: { status: 'active' },
      orderBy: { entryDeadline: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        entryDeadline: true,
        thumbnailUrl: true,
        prizes: {
          select: { rank: true, prizeAmount: true },
          orderBy: { rank: 'asc' },
          take: 1,
        },
      },
    }),
    db.user.findUnique({ where: { clerkId: userId }, select: { id: true } }),
  ])

  // Get the user's existing entries to show which contests they've already entered
  const enteredContestIds = dbUser
    ? (
        await db.contestEntry.findMany({
          where: { creatorId: dbUser.id, contestId: { in: contests.map((c) => c.id) } },
          select: { contestId: true },
        })
      ).map((e) => e.contestId)
    : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Submit an Entry</h1>
        <p className="text-zinc-400">Choose an active contest to submit your video to.</p>
      </div>

      {contests.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-12 text-center">
          <p className="text-zinc-500 text-sm mb-4">No active contests right now.</p>
          <Link
            href="/contests"
            className="inline-block bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-zinc-100 transition-all uppercase tracking-widest text-sm"
          >
            Browse All Contests
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contests.map((contest) => {
            const alreadyEntered = enteredContestIds.includes(contest.id)
            const daysLeft = Math.max(
              0,
              Math.ceil((new Date(contest.entryDeadline).getTime() - Date.now()) / 86_400_000)
            )

            return (
              <div
                key={contest.id}
                className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex items-center gap-6"
              >
                {/* Thumbnail */}
                {contest.thumbnailUrl && (
                  <div
                    className="w-24 h-16 rounded-2xl bg-center bg-cover shrink-0"
                    style={{ backgroundImage: `url(${contest.thumbnailUrl})` }}
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif font-bold text-white text-lg truncate">{contest.title}</h2>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-zinc-500">
                    {contest.prizes[0] && (
                      <span className="text-yellow-400 font-medium">
                        Top prize: ${Number(contest.prizes[0].prizeAmount).toLocaleString()}
                      </span>
                    )}
                    <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Closing today'}</span>
                  </div>
                </div>

                {/* CTA */}
                {alreadyEntered ? (
                  <span className="shrink-0 text-xs px-4 py-2 rounded-full border border-green-700 text-green-400 bg-green-900/20">
                    Entered ✓
                  </span>
                ) : (
                  <Link
                    href={`/contests/${contest.slug}/enter`}
                    className="shrink-0 bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-full hover:bg-yellow-300 transition-all uppercase tracking-widest text-sm"
                  >
                    Enter →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
