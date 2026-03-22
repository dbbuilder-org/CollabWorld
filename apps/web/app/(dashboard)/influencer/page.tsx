import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@collabworld/db'
import { getRoleFromMetadata } from '@/lib/auth'
import { createReferralLink } from '@/lib/referral'
import Link from 'next/link'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://collabworld.io'

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-900/30 border-green-800 text-green-400'
    case 'invited':
      return 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
    case 'agreement_pending':
      return 'bg-blue-900/30 border-blue-800 text-blue-400'
    case 'completed':
      return 'bg-zinc-800 border-zinc-700 text-zinc-400'
    case 'dropped':
      return 'bg-red-900/30 border-red-800 text-red-400'
    default:
      return 'bg-zinc-800 border-zinc-700 text-zinc-400'
  }
}

export default async function InfluencerDashboardPage() {
  const { userId, sessionClaims } = auth()
  if (!userId) redirect('/sign-in')

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (role !== 'influencer') redirect('/dashboard')

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { influencerProfile: true },
  })
  if (!user) redirect('/sign-in')

  const assignments = await db.influencerContestAssignment.findMany({
    where: { influencerId: user.id },
    include: {
      contest: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          thumbnailUrl: true,
          prizePoolTotal: true,
          contestEnd: true,
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })

  const totalEarnings = assignments.reduce(
    (sum, a) => sum + Number(a.totalEarned),
    0
  )
  const totalConversions = assignments.reduce((sum, a) => sum + a.conversions, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Influencer Dashboard</h1>
        <p className="text-zinc-400">Manage your contest assignments and track your performance.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">Total Assignments</p>
          <p className="text-3xl font-black text-white mt-1">{assignments.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">Total Conversions</p>
          <p className="text-3xl font-black text-white mt-1">{totalConversions}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">Total Earnings</p>
          <p className="text-3xl font-black text-white mt-1">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">My Assignments</h2>
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">No assignments yet.</p>
            <p className="text-zinc-600 text-xs mt-2">
              You will be invited to contests by the Collab World team.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const referralLink = createReferralLink(assignment.trackingUrl, BASE_URL)
              const isSigned = assignment.status === 'active' || assignment.status === 'completed'
              return (
                <div
                  key={assignment.id}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-bold truncate">
                          {assignment.contest.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(assignment.status)}`}
                        >
                          {assignment.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-zinc-500">Commission</p>
                          <p className="text-white font-semibold">
                            {(Number(assignment.commissionRate) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Conversions</p>
                          <p className="text-white font-semibold">{assignment.conversions}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Earned</p>
                          <p className="text-white font-semibold">
                            ${Number(assignment.totalEarned).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {isSigned && (
                        <div className="bg-zinc-900 rounded-lg p-3 mt-2">
                          <p className="text-zinc-500 text-xs mb-1">Your referral link</p>
                          <p className="text-blue-400 text-sm font-mono break-all">
                            {referralLink}
                          </p>
                        </div>
                      )}
                    </div>

                    {!isSigned && (
                      <Link
                        href={`/influencer/assignments/${assignment.id}`}
                        className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Sign Agreement
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
