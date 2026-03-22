import Link from 'next/link'

interface EntryCreator {
  displayName: string
  avatarUrl?: string | null
}

interface EntryContest {
  title: string
  slug: string
}

interface Entry {
  id: string
  title: string
  status: string
  muxPlaybackId?: string | null
  thumbnailUrl?: string | null
  createdAt: string
  creator: EntryCreator
  contest: EntryContest
}

interface EntriesResponse {
  items: Entry[]
  total: number
}

async function getEntries(status: string): Promise<EntriesResponse> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  try {
    const res = await fetch(
      `${baseUrl}/api/v1/admin/entries?status=${status}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return { items: [], total: 0 }
    const json = await res.json()
    return { items: json.data ?? [], total: json.total ?? 0 }
  } catch {
    return { items: [], total: 0 }
  }
}

const STATUS_TABS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

interface PageProps {
  searchParams: { status?: string }
}

export default async function AdminEntriesPage({ searchParams }: PageProps) {
  const activeStatus = searchParams.status ?? 'pending'
  const { items, total } = await getEntries(activeStatus)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Entry Review Queue</h1>
        <span className="text-zinc-500 text-sm">{total} entries</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/entries?status=${tab.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStatus === tab.value
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Entries table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">No {activeStatus} entries</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Entry</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Creator</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Contest</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link href={`/admin/entries/${entry.id}`} className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                        {entry.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={entry.thumbnailUrl}
                            alt={entry.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-900 to-zinc-900" />
                        )}
                      </div>
                      <span className="text-white text-sm font-medium hover:text-purple-300 transition-colors line-clamp-1">
                        {entry.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 text-sm">{entry.creator.displayName}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{entry.contest.title}</td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
