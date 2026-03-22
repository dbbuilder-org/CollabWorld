import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BrandDashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const name = user?.firstName ?? user?.username ?? 'Brand'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Welcome, {name}!</h1>
        <p className="text-zinc-400">Manage your campaigns and sponsor contests.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Sponsor a Contest</h2>
        <p className="text-zinc-400 text-sm mb-4">
          Fund a prize pool, define your campaign brief, and reach 500K+ engaged fans.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-black font-medium px-6 py-3 rounded-xl text-sm hover:bg-zinc-100 transition-colors"
        >
          Get in Touch
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Active Campaigns</h2>
        <div className="text-center py-8">
          <p className="text-zinc-500 text-sm">No active campaigns yet.</p>
          <p className="text-zinc-600 text-xs mt-2">
            Campaigns will appear here once you sponsor a contest.
          </p>
        </div>
      </div>
    </div>
  )
}
