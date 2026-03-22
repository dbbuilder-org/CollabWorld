import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@collabworld/db'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import Link from 'next/link'

const PAGE_SIZE = 20

interface PageProps {
  searchParams: { page?: string; search?: string; accountType?: string }
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { userId, sessionClaims } = auth()
  if (!userId) redirect('/sign-in')

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) redirect('/')

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const search = searchParams.search ?? ''
  const accountType = searchParams.accountType ?? ''

  const where: Record<string, unknown> = {}
  if (search) {
    where['OR'] = [
      { email: { contains: search, mode: 'insensitive' } },
      { displayName: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (accountType) {
    where['accountType'] = accountType
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        clerkId: true,
        email: true,
        displayName: true,
        accountType: true,
        isActive: true,
        createdAt: true,
      },
    }),
    db.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Users</h1>
        <p className="text-zinc-400">{total.toLocaleString()} total users</p>
      </div>

      {/* Search / Filter */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by email or name..."
          className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 w-64 focus:outline-none focus:border-indigo-500"
        />
        <select
          name="accountType"
          defaultValue={accountType}
          className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All types</option>
          <option value="fan">Fan</option>
          <option value="creator">Creator</option>
          <option value="influencer">Influencer</option>
          <option value="brand">Brand</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">User</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{u.displayName}</p>
                  <p className="text-zinc-500 text-xs">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-zinc-300 capitalize">{u.accountType}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                      u.isActive
                        ? 'bg-green-900/30 border-green-800 text-green-400'
                        : 'bg-red-900/30 border-red-800 text-red-400'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm">No users found.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 items-center text-sm">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}&search=${search}&accountType=${accountType}`}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Previous
            </Link>
          )}
          <span className="text-zinc-400">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`?page=${page + 1}&search=${search}&accountType=${accountType}`}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
