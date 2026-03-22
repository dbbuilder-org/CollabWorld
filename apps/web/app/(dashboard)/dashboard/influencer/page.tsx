import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function InfluencerDashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const name = user?.firstName ?? user?.username ?? 'Influencer'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Welcome, {name}!</h1>
        <p className="text-zinc-400">Manage your assignments and track your earnings.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-2">Service Agreement</h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-yellow-900/30 border border-yellow-800 px-3 py-1 text-xs text-yellow-400">
            Pending
          </span>
          <p className="text-zinc-400 text-sm">
            Your service agreement will be available when a contest goes live.
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">My Assignments</h2>
        <div className="text-center py-8">
          <p className="text-zinc-500 text-sm">No assignments yet.</p>
          <p className="text-zinc-600 text-xs mt-2">
            You will be assigned to contests once Phase 1 launches.
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">My Tracking Links</h2>
        <div className="text-center py-8">
          <p className="text-zinc-500 text-sm">No tracking links yet.</p>
        </div>
      </div>
    </div>
  )
}
