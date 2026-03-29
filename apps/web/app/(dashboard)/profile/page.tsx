import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@collabworld/db'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      accountType: true,
      isVerified: true,
      subscriptionPlan: true,
      createdAt: true,
      entries: {
        where: { status: 'approved', isPrivate: false },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          title: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
          likeCount: true,
          voteCount: true,
          viewCount: true,
          contest: { select: { title: true, slug: true } },
        },
      },
    },
  })

  if (!user) redirect('/sign-in')

  const totalLikes = user.entries.reduce((sum, e) => sum + e.likeCount, 0)
  const totalVotes = user.entries.reduce((sum, e) => sum + e.voteCount, 0)
  const totalViews = user.entries.reduce((sum, e) => sum + e.viewCount, 0)

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Profile header */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
        <div className="flex items-start gap-6 flex-wrap">
          {/* Avatar */}
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.displayName}
              width={96}
              height={96}
              className="rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-500/30 flex items-center justify-center text-yellow-400 text-3xl font-bold shrink-0">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="font-serif font-bold text-2xl text-white">{user.displayName}</h1>
              {user.isVerified && (
                <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              )}
              <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full capitalize">
                {user.accountType}
              </span>
              {user.subscriptionPlan === 'premium' && (
                <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Premium
                </span>
              )}
            </div>
            {user.bio && <p className="text-zinc-400 text-sm mt-1">{user.bio}</p>}
            <p className="text-zinc-600 text-xs mt-2">Member since {memberSince}</p>
          </div>

          <Link
            href="/settings"
            className="shrink-0 border border-gray-700 text-zinc-400 hover:text-white hover:border-gray-500 font-medium px-5 py-2 rounded-full text-sm transition-colors"
          >
            Edit Profile
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
          {[
            { label: 'Total Views', value: totalViews.toLocaleString() },
            { label: 'Total Likes', value: totalLikes.toLocaleString() },
            { label: 'Total Votes', value: totalVotes.toLocaleString() },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-black text-white">{stat.value}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Public entries */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-xl text-white">
            My Videos
          </h2>
          <Link href="/dashboard/creator" className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors">
            Full dashboard →
          </Link>
        </div>

        {user.entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm mb-4">No public entries yet.</p>
            <Link
              href="/dashboard/upload"
              className="inline-block bg-white text-black font-bold px-6 py-3 rounded-full text-sm hover:bg-zinc-100 transition-colors uppercase tracking-widest"
            >
              Submit to a Contest
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.entries.map((entry) => {
              const thumb =
                entry.thumbnailUrl ??
                (entry.muxPlaybackId
                  ? `https://image.mux.com/${entry.muxPlaybackId}/thumbnail.jpg`
                  : null)

              return (
                <Link
                  key={entry.id}
                  href={`/watch/${entry.id}`}
                  className="group bg-black/30 border border-gray-800 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-colors"
                >
                  <div className="aspect-video bg-gray-900 relative">
                    {thumb && (
                      <Image
                        src={thumb}
                        alt={entry.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
                      {entry.title}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">{entry.contest.title}</p>
                    <div className="flex gap-3 mt-2 text-xs text-zinc-500">
                      <span>{entry.viewCount.toLocaleString()} views</span>
                      <span>{entry.likeCount} likes</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
