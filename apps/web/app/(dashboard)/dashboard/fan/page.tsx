import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@collabworld/db'

export const dynamic = 'force-dynamic'

export default async function FanDashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const name = user?.firstName ?? user?.username ?? 'there'

  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })

  const [myLikes, myVotes] = dbUser
    ? await Promise.all([
        db.entryEngagement.findMany({
          where: { userId: dbUser.id, type: 'like' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            createdAt: true,
            entry: {
              select: {
                id: true,
                title: true,
                likeCount: true,
                contest: { select: { slug: true, title: true } },
              },
            },
          },
        }),
        db.entryEngagement.findMany({
          where: { userId: dbUser.id, type: 'vote' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            createdAt: true,
            entry: {
              select: {
                id: true,
                title: true,
                voteCount: true,
                contest: { select: { slug: true, title: true } },
              },
            },
          },
        }),
      ])
    : [[], []]

  const totalLikes = myLikes.length
  const totalVotes = myVotes.length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Welcome, {name}!</h1>
        <p className="text-zinc-400">Discover contests and support your favorite creators.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Videos Liked', value: String(totalLikes) },
          { label: 'Votes Cast', value: String(totalVotes) },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-zinc-500 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center col-span-2 md:col-span-2">
          <Link
            href="/feed"
            className="inline-block bg-white text-black font-bold px-6 py-2 rounded-full text-sm hover:bg-zinc-100 transition-colors uppercase tracking-widest"
          >
            Browse Videos
          </Link>
        </div>
      </div>

      {/* Liked Videos */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-xl text-white">Liked Videos</h2>
          <Link href="/feed" className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors">
            Discover more →
          </Link>
        </div>
        {myLikes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm mb-4">No liked videos yet.</p>
            <Link
              href="/feed"
              className="inline-block bg-white text-black font-bold px-6 py-3 rounded-full text-sm hover:bg-zinc-100 transition-colors uppercase tracking-widest"
            >
              Browse Videos
            </Link>
          </div>
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
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-zinc-300 group-hover:text-yellow-400 transition-colors truncate block">
                    {like.entry.title}
                  </span>
                  <span className="text-xs text-zinc-600">{like.entry.contest.title}</span>
                </div>
                <span className="text-xs text-zinc-600 shrink-0">
                  {new Date(like.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Voting History */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-xl text-white">Voting History</h2>
          <Link href="/contests" className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors">
            Vote in contests →
          </Link>
        </div>
        {myVotes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm mb-4">No votes cast yet.</p>
            <Link
              href="/contests"
              className="inline-block bg-white text-black font-bold px-6 py-3 rounded-full text-sm hover:bg-zinc-100 transition-colors uppercase tracking-widest"
            >
              Browse Contests
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myVotes.map((vote) => (
              <Link
                key={vote.id}
                href={`/watch/${vote.entry.id}`}
                className="flex items-center gap-3 py-2 hover:text-yellow-400 transition-colors group"
              >
                <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-zinc-300 group-hover:text-yellow-400 transition-colors truncate block">
                    {vote.entry.title}
                  </span>
                  <span className="text-xs text-zinc-600">{vote.entry.contest.title}</span>
                </div>
                <span className="text-xs text-zinc-600 shrink-0">
                  {new Date(vote.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Active Contests CTA */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-8 text-center">
        <h2 className="font-serif font-bold text-2xl text-white mb-3">Ready to Vote?</h2>
        <p className="text-zinc-400 mb-6 max-w-md mx-auto text-sm leading-relaxed">
          Browse active contests, watch creator entries, and vote for your favorites.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/contests"
            className="inline-block bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-all hover:-translate-y-0.5 tracking-widest uppercase text-sm"
          >
            Browse Contests
          </Link>
          <Link
            href="/feed"
            className="inline-block bg-transparent border border-yellow-400 text-yellow-400 font-bold px-8 py-3 rounded-full hover:bg-yellow-400/10 transition-all hover:-translate-y-0.5 tracking-widest uppercase text-sm"
          >
            Watch Videos
          </Link>
        </div>
      </div>
    </div>
  )
}
