import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@collabworld/db'
import Link from 'next/link'
import InfluencerAffiliateClient from './InfluencerAffiliateClient'

export const dynamic = 'force-dynamic'

const TIER_LABEL: Record<string, string> = {
  nano:     'Nano',
  micro:    'Micro',
  mid_tier: 'Mid-Tier',
  macro:    'Macro',
  mega:     'Mega',
}

const TIER_GUARANTEED: Record<string, number> = {
  nano:     1650,
  micro:    3300,
  mid_tier: 6600,
  macro:    15000,
  mega:     25000,
}

export default async function InfluencerDashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()
  const name = clerkUser?.firstName ?? clerkUser?.username ?? 'Influencer'

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      influencerProfile: true,
      influencerAssignments: {
        where: { status: { in: ['active', 'agreement_pending'] } },
        include: {
          contest: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              thumbnailUrl: true,
              contestEnd: true,
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      },
    },
  })

  if (!user) redirect('/sign-in')

  const profile = user.influencerProfile
  const tier = profile?.tier ?? null
  const guaranteed = tier ? (TIER_GUARANTEED[tier] ?? 0) : 0
  const totalEarned = Number(profile?.totalEarnings ?? 0)
  const payoutProgress = guaranteed > 0 ? Math.min(100, (totalEarned / guaranteed) * 100) : 0
  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif font-bold text-3xl text-white mb-1">Welcome, {name}!</h1>
        <p className="text-zinc-400">Manage your contest assignments, affiliate links, and earnings.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
          <div className="text-3xl font-black text-yellow-400 mb-1">
            ${totalEarned.toLocaleString()}
          </div>
          <div className="text-zinc-500 text-xs">Total Earned</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
          <div className="text-3xl font-black text-white mb-1">
            {user.influencerAssignments.reduce((sum, a) => sum + a.conversions, 0)}
          </div>
          <div className="text-zinc-500 text-xs">Total Conversions</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
          <div className="text-3xl font-black text-white mb-1">
            {user.influencerAssignments.length}
          </div>
          <div className="text-zinc-500 text-xs">Active Assignments</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
          <div className="text-2xl font-black text-purple-400 mb-1">
            {tier ? TIER_LABEL[tier] : '—'}
          </div>
          <div className="text-zinc-500 text-xs">Your Tier</div>
        </div>
      </div>

      {/* Guaranteed payout progress */}
      {tier && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-yellow-400">Guaranteed Payout Progress</h2>
            <span className="text-white font-bold">${totalEarned.toLocaleString()} / ${guaranteed.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${payoutProgress}%` }}
            />
          </div>
          <p className="text-zinc-400 text-xs mt-2">
            {payoutProgress >= 100
              ? 'You have reached your guaranteed payout — congratulations!'
              : `$${(guaranteed - totalEarned).toLocaleString()} remaining to reach your guaranteed payout`}
          </p>
          <Link href="/affiliate-compensation-plan" className="text-yellow-400 hover:text-yellow-300 text-xs mt-1 inline-block transition-colors">
            View full compensation plan →
          </Link>
        </div>
      )}

      {/* Contest assignments with affiliate links */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
        <h2 className="font-serif font-bold text-xl text-white mb-4">My Contest Assignments</h2>
        {user.influencerAssignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">No active assignments yet.</p>
            <p className="text-zinc-600 text-xs mt-2">You will be assigned to contests once Phase 1 launches.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {user.influencerAssignments.map((assignment) => (
              <div key={assignment.id} className="bg-black/30 border border-gray-700 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-white">{assignment.contest.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${
                        assignment.status === 'active'
                          ? 'bg-green-900/30 border-green-800 text-green-400'
                          : 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
                      }`}>
                        {assignment.status === 'active' ? 'Active' : 'Agreement Pending'}
                      </span>
                      <span className="text-zinc-500 text-xs">
                        {assignment.conversions} conversions · ${Number(assignment.totalEarned).toLocaleString()} earned
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/contests/${assignment.contest.slug}`}
                    className="text-yellow-400 hover:text-yellow-300 text-xs font-medium transition-colors shrink-0"
                  >
                    View Contest →
                  </Link>
                </div>

                {/* Affiliate link */}
                <div className="mt-4">
                  <p className="text-zinc-500 text-xs mb-1.5">Your Affiliate Link</p>
                  <InfluencerAffiliateClient
                    affiliateLink={`${appUrl}/ref/${assignment.trackingUrl}`}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-black/30 rounded-xl p-3">
                    <div className="text-zinc-500 text-xs mb-0.5">Commission Rate</div>
                    <div className="text-white font-semibold">{Number(assignment.commissionRate)}%</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3">
                    <div className="text-zinc-500 text-xs mb-0.5">Contest Ends</div>
                    <div className="text-white font-semibold text-xs">
                      {new Date(assignment.contest.contestEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile info */}
      {profile && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
          <h2 className="font-serif font-bold text-xl text-white mb-4">My Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-zinc-500 text-xs mb-1">Total Followers</div>
              <div className="text-white font-semibold">{profile.totalFollowers.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs mb-1">Engagement Rate</div>
              <div className="text-white font-semibold">{Number(profile.engagementRate).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs mb-1">Agreement</div>
              <div className={`font-semibold ${profile.agreementSignedAt ? 'text-green-400' : 'text-yellow-400'}`}>
                {profile.agreementSignedAt ? 'Signed' : 'Pending'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
