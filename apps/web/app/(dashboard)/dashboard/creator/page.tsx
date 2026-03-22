import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CreatorDashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const name = user?.firstName ?? user?.username ?? 'Creator'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Welcome, {name}!</h1>
        <p className="text-zinc-400">Submit your work to contests and track your performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Contest Entries', value: '0' },
          { label: 'Total Votes', value: '0' },
          { label: 'Total Earnings', value: '$0' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-zinc-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">My Entry</h2>
        <div className="text-center py-8">
          <p className="text-zinc-500 text-sm mb-4">No active contest entries yet.</p>
          <Link
            href="/contests"
            className="inline-block bg-white text-black font-medium px-6 py-3 rounded-xl text-sm hover:bg-zinc-100 transition-colors"
          >
            Enter a Contest
          </Link>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Active Contests</h2>
        <div className="text-center py-8">
          <p className="text-zinc-500 text-sm">Contest launching soon</p>
        </div>
      </div>
    </div>
  )
}
