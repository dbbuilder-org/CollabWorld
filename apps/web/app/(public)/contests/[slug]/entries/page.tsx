import Link from 'next/link'
import EntryCard from '@/components/entries/EntryCard'

export const dynamic = 'force-dynamic'

interface EntryCreator {
  displayName: string
  avatarUrl?: string | null
  referralCode?: string | null
}

interface Entry {
  id: string
  title: string
  muxPlaybackId?: string | null
  thumbnailUrl?: string | null
  likeCount: number
  voteCount: number
  commentCount: number
  compositeScore: number
  creator: EntryCreator
}

interface EntriesResponse {
  items: Entry[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

async function getContestEntries(slug: string, sort: string): Promise<{ entries: EntriesResponse | null; contestTitle: string }> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

  try {
    // Get contest info
    const contestRes = await fetch(`${baseUrl}/api/v1/contests/${slug}`, { cache: 'no-store' })
    const contestTitle = contestRes.ok ? ((await contestRes.json()) as { data?: { title?: string } }).data?.title ?? slug : slug

    const params = new URLSearchParams({ page: '1', pageSize: '20' })
    const res = await fetch(
      `${baseUrl}/api/v1/contests/${slug}/entries?${params.toString()}`,
      { cache: 'no-store' }
    )

    if (!res.ok) return { entries: null, contestTitle }

    const entries = (await res.json()) as EntriesResponse

    // Client-side sort: newest if requested
    if (sort === 'newest') {
      entries.items = [...entries.items].reverse()
    }

    return { entries, contestTitle }
  } catch {
    return { entries: null, contestTitle: slug }
  }
}

interface PageProps {
  params: { slug: string }
  searchParams: { sort?: string }
}

export default async function ContestEntriesPage({ params, searchParams }: PageProps) {
  const sort = searchParams.sort ?? 'top'
  const { entries, contestTitle } = await getContestEntries(params.slug, sort)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link
            href={`/contests/${params.slug}`}
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            ← Back to contest
          </Link>
          <h1 className="text-3xl font-black text-white mt-2">
            Entries for {contestTitle}
          </h1>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-sm">Sort by</span>
          <div className="flex gap-2">
            <Link
              href={`/contests/${params.slug}/entries?sort=top`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sort === 'top' || !sort
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Top Rated
            </Link>
            <Link
              href={`/contests/${params.slug}/entries?sort=newest`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sort === 'newest'
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Newest
            </Link>
          </div>
        </div>
      </div>

      {!entries || entries.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-zinc-600 text-5xl mb-4">🎬</div>
          <p className="text-zinc-400 text-lg font-medium">No entries yet.</p>
          <p className="text-zinc-600 text-sm mt-1">Be the first to submit!</p>
          <Link
            href={`/contests/${params.slug}`}
            className="mt-4 inline-block bg-purple-600 hover:bg-purple-500 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Submit Your Entry
          </Link>
        </div>
      ) : (
        <>
          <p className="text-zinc-500 text-sm">{entries.total} approved entries</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {entries.items.map((entry) => (
              <EntryCard
                key={entry.id}
                id={entry.id}
                title={entry.title}
                contestSlug={params.slug}
                contestName={contestTitle}
                muxPlaybackId={entry.muxPlaybackId}
                creator={entry.creator}
                likeCount={entry.likeCount}
                voteCount={entry.voteCount}
                commentCount={entry.commentCount}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
