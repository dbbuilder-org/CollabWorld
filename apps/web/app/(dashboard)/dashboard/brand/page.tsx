import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@collabworld/db'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function BrandDashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()
  const name = clerkUser?.firstName ?? clerkUser?.username ?? 'Brand'

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      brandProfile: true,
      contestsSponsored: {
        orderBy: { createdAt: 'desc' },
        include: {
          entries: {
            where: { status: 'approved' },
            select: { id: true },
          },
          prizes: {
            select: { rank: true, prizeAmount: true, description: true },
            orderBy: { rank: 'asc' },
            take: 1,
          },
        },
      },
    },
  })

  if (!user) redirect('/sign-in')

  const sponsored = user.contestsSponsored
  const totalSponsored = Number(user.brandProfile?.totalSpent ?? 0)

  const activeCampaigns = sponsored.filter((c) =>
    ['active', 'voting', 'upcoming'].includes(c.status)
  )
  const completedCampaigns = sponsored.filter((c) =>
    ['completed', 'archived'].includes(c.status)
  )
  const totalEntries = sponsored.reduce((sum, c) => sum + c.entries.length, 0)

  const STATUS_COLORS: Record<string, string> = {
    draft:     'bg-gray-800 text-gray-400 border-gray-700',
    upcoming:  'bg-blue-900/30 text-blue-400 border-blue-800',
    active:    'bg-green-900/30 text-green-400 border-green-800',
    voting:    'bg-purple-900/30 text-purple-400 border-purple-800',
    completed: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    archived:  'bg-gray-900/30 text-gray-500 border-gray-800',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-3xl text-white mb-1">Welcome, {name}!</h1>
        <p className="text-zinc-400">Manage your sponsored contests and track campaign performance.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
          <div className="text-3xl font-black text-yellow-400 mb-1">{sponsored.length}</div>
          <div className="text-zinc-500 text-xs">Total Contests</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
          <div className="text-3xl font-black text-white mb-1">{activeCampaigns.length}</div>
          <div className="text-zinc-500 text-xs">Active Now</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
          <div className="text-3xl font-black text-white mb-1">{totalEntries.toLocaleString()}</div>
          <div className="text-zinc-500 text-xs">Creator Entries</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
          <div className="text-2xl font-black text-green-400 mb-1">${totalSponsored.toLocaleString()}</div>
          <div className="text-zinc-500 text-xs">Total Invested</div>
        </div>
      </div>

      {/* Active campaigns */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-xl text-white">Active Campaigns</h2>
          <Link
            href="/contests"
            className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors"
          >
            View all contests →
          </Link>
        </div>

        {activeCampaigns.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">No active campaigns yet.</p>
            <p className="text-zinc-600 text-xs mt-2">Contact us to sponsor a contest and reach 500K+ fans.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeCampaigns.map((contest) => (
              <div key={contest.id} className="bg-black/30 border border-gray-700 rounded-2xl overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  {contest.thumbnailUrl && (
                    <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0">
                      <Image src={contest.thumbnailUrl} alt={contest.title} fill sizes="80px" className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Link
                        href={`/contests/${contest.slug}`}
                        className="font-semibold text-white hover:text-yellow-400 transition-colors"
                      >
                        {contest.title}
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[contest.status] ?? ''}`}>
                        {contest.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500 mt-2">
                      <span>{contest.entries.length} entries</span>
                      {contest.prizes[0] && (
                        <span>Top prize: ${Number(contest.prizes[0].prizeAmount).toLocaleString()}</span>
                      )}
                      <span>Ends {new Date(contest.contestEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <Link
                    href={`/contests/${contest.slug}/leaderboard`}
                    className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors shrink-0"
                  >
                    Leaderboard →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed campaigns */}
      {completedCampaigns.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
          <h2 className="font-serif font-bold text-xl text-white mb-4">Past Campaigns</h2>
          <div className="space-y-3">
            {completedCampaigns.map((contest) => (
              <div key={contest.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                <div>
                  <Link
                    href={`/contests/${contest.slug}`}
                    className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                  >
                    {contest.title}
                  </Link>
                  <p className="text-zinc-600 text-xs mt-0.5">{contest.entries.length} entries · ended {new Date(contest.contestEnd).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[contest.status] ?? ''}`}>
                  {contest.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brand profile info */}
      {user.brandProfile && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
          <h2 className="font-serif font-bold text-xl text-white mb-4">Brand Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-zinc-500 text-xs mb-1">Company</div>
              <div className="text-white font-medium">{user.brandProfile.companyName}</div>
            </div>
            {user.brandProfile.industry && (
              <div>
                <div className="text-zinc-500 text-xs mb-1">Industry</div>
                <div className="text-white font-medium">{user.brandProfile.industry}</div>
              </div>
            )}
            {user.brandProfile.website && (
              <div>
                <div className="text-zinc-500 text-xs mb-1">Website</div>
                <a href={user.brandProfile.website} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium text-xs break-all">
                  {user.brandProfile.website}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA for no campaigns */}
      {sponsored.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-8 text-center">
          <h2 className="font-serif font-bold text-2xl text-white mb-3">Ready to Sponsor a Contest?</h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto text-sm leading-relaxed">
            Fund a prize pool, define your campaign brief, and get your brand in front of 500K+ engaged fans across Instagram, TikTok, and Facebook.
          </p>
          <Link
            href="mailto:brands@collabworld.com"
            className="inline-block bg-yellow-400 text-black font-bold px-10 py-3 rounded-full hover:bg-yellow-300 transition-all hover:-translate-y-0.5 tracking-widest uppercase text-sm"
          >
            Get in Touch
          </Link>
        </div>
      )}
    </div>
  )
}
