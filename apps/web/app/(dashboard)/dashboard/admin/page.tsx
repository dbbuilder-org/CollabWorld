import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'

export default async function AdminDashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const role = getRoleFromMetadata(user?.publicMetadata ?? null)

  if (!isAdmin(role)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Admin Dashboard</h1>
        <p className="text-zinc-400">Platform management and oversight.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: '—' },
          { label: 'Active Contests', value: '—' },
          { label: 'Total Revenue', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="text-2xl font-black text-white">{stat.value}</div>
            <div className="text-zinc-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
