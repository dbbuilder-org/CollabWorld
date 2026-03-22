import ContestCard from '@/components/contests/ContestCard'
import type { ContestStatus } from '@/lib/contest'

interface ContestListItem {
  id: string
  title: string
  slug: string
  status: ContestStatus
  prizePoolTotal: number
  thumbnailUrl: string | null
  entryCount: number
  daysRemaining: number
}

async function getContests(status?: string): Promise<ContestListItem[]> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  const url = status
    ? `${baseUrl}/api/v1/contests?status=${status}`
    : `${baseUrl}/api/v1/contests`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

const FILTER_TABS = [
  { label: 'All', value: undefined },
  { label: 'Active', value: 'active' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Voting', value: 'voting' },
] as const

interface PageProps {
  searchParams: { status?: string }
}

export default async function ContestsPage({ searchParams }: PageProps) {
  const statusFilter = searchParams.status
  const contests = await getContests(statusFilter)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Active Contests</h1>
          <p className="mt-2 text-zinc-400 text-lg">
            Submit your work and compete for prizes.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const isActive =
              (tab.value === undefined && !statusFilter) || tab.value === statusFilter
            return (
              <a
                key={tab.label}
                href={tab.value ? `/contests?status=${tab.value}` : '/contests'}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {tab.label}
              </a>
            )
          })}
        </div>

        {/* Contest grid or empty state */}
        {contests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <svg
              className="w-24 h-24 text-zinc-700 mb-6"
              fill="none"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" />
              <path
                d="M35 55 Q50 35 65 55"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="38" cy="43" r="4" fill="currentColor" />
              <circle cx="62" cy="43" r="4" fill="currentColor" />
            </svg>
            <h2 className="text-xl font-semibold text-zinc-300">No active contests right now.</h2>
            <p className="mt-2 text-zinc-500">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contests.map((contest) => (
              <ContestCard key={contest.id} {...contest} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
