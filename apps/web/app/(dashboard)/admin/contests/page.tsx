import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@collabworld/db'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: { status?: string }
}

export default async function AdminContestsPage({ searchParams }: PageProps) {
  const { userId, sessionClaims } = auth()
  if (!userId) redirect('/sign-in')

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) redirect('/')

  const statusFilter = searchParams.status ?? ''

  const where: Record<string, unknown> = {}
  if (statusFilter) where['status'] = statusFilter

  const contests = await db.contest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { entries: true } },
    },
  })

  const STATUS_OPTIONS = ['draft', 'upcoming', 'active', 'voting', 'completed', 'archived']

  function statusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-900/30 border-green-800 text-green-400'
      case 'voting': return 'bg-blue-900/30 border-blue-800 text-blue-400'
      case 'upcoming': return 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
      case 'completed': return 'bg-zinc-700 border-zinc-600 text-zinc-300'
      case 'archived': return 'bg-zinc-800 border-zinc-700 text-zinc-500'
      default: return 'bg-zinc-800 border-zinc-700 text-zinc-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Contests</h1>
          <p className="text-zinc-400">{contests.length} contests</p>
        </div>
        <Link
          href="/admin/contests/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          New Contest
        </Link>
      </div>

      {/* Filter */}
      <form method="GET" className="flex gap-2 flex-wrap">
        <select
          name="status"
          defaultValue={statusFilter}
          className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Contest</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Entries</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Entry Deadline</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Contest End</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {contests.map((c: (typeof contests)[number]) => (
              <tr key={c.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{c.title}</p>
                  <p className="text-zinc-500 text-xs">{c.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass(c.status)}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-300">{c._count.entries}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(c.entryDeadline).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(c.contestEnd).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/contests/${c.id}`}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {contests.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm">No contests found.</div>
        )}
      </div>
    </div>
  )
}
