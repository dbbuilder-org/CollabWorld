import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function FanDashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const name = user?.firstName ?? user?.username ?? 'there'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Welcome, {name}!</h1>
        <p className="text-zinc-400">Discover contests and support your favorite creators.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Discover Contests</h2>
        <p className="text-zinc-400 text-sm mb-4">
          Find and vote in active film and music contests.
        </p>
        <Link
          href="/contests"
          className="inline-block bg-white text-black font-medium px-6 py-3 rounded-xl text-sm hover:bg-zinc-100 transition-colors"
        >
          Browse Contests
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Active Contests</h2>
        <div className="text-center py-8">
          <p className="text-zinc-500 text-sm">Contest launching soon</p>
          <p className="text-zinc-600 text-xs mt-2">
            Be the first to know when Phase 1 goes live.
          </p>
        </div>
      </div>
    </div>
  )
}
