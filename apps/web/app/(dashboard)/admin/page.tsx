import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@collabworld/db'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { userId, sessionClaims } = auth()
  if (!userId) redirect('/sign-in')

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) redirect('/')

  const [
    totalUsers,
    totalContests,
    totalEntries,
    totalEngagements,
    activeContests,
    pendingEntries,
  ] = await Promise.all([
    db.user.count(),
    db.contest.count(),
    db.contestEntry.count(),
    db.entryEngagement.count(),
    db.contest.count({ where: { status: 'active' } }),
    db.contestEntry.count({ where: { status: 'pending' } }),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers },
    { label: 'Total Contests', value: totalContests },
    { label: 'Total Entries', value: totalEntries },
    { label: 'Total Engagements', value: totalEngagements },
    { label: 'Active Contests', value: activeContests },
    { label: 'Pending Entries', value: pendingEntries },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Admin Dashboard</h1>
        <p className="text-zinc-400">Platform overview and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm">{stat.label}</p>
            <p className="text-3xl font-black text-white mt-1">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
