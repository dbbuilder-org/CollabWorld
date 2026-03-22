import Link from 'next/link'

interface Contest {
  id: string
  title: string
  slug: string
  status: string
  prizePoolTotal: number
  entryDeadline: string
  contestEnd: string
  _count?: { entries: number }
}

async function getContests(): Promise<Contest[]> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  try {
    // Admin-only: fetch all contests regardless of status
    // The API route checks admin session internally; server-side fetch uses same cookies
    const res = await fetch(`${baseUrl}/api/v1/admin/contests`, {
      cache: 'no-store',
      // For server-side fetch in Next.js, cookies are forwarded automatically
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-zinc-400',
  upcoming: 'text-blue-400',
  active: 'text-green-400',
  voting: 'text-purple-400',
  completed: 'text-zinc-300',
  archived: 'text-zinc-500',
}

export default async function AdminContestsPage() {
  const contests = await getContests()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-white">Contests</h1>
        <Link
          href="/admin/contests/new"
          className="px-4 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-zinc-100 transition-colors"
        >
          + Create Contest
        </Link>
      </div>

      {contests.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          No contests yet.{' '}
          <Link href="/admin/contests/new" className="text-white underline">
            Create the first one
          </Link>
          .
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Entries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Prize Pool
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Ends
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {contests.map((contest) => (
                <tr key={contest.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{contest.title}</div>
                    <div className="text-xs text-zinc-500">/{contest.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium capitalize ${STATUS_COLORS[contest.status] ?? 'text-zinc-400'}`}
                    >
                      {contest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    {contest._count?.entries ?? 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    ${Number(contest.prizePoolTotal).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {new Date(contest.contestEnd).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/contests/${contest.slug}`}
                        className="text-xs text-zinc-400 hover:text-white transition-colors"
                        target="_blank"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
