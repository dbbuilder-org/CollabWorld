import Link from 'next/link'
import AdminEntryReviewer from './AdminEntryReviewer'

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
  description?: string | null
  status: string
  muxPlaybackId?: string | null
  thumbnailUrl?: string | null
  durationSeconds?: number | null
  rejectionReason?: string | null
  createdAt: string
  creator: EntryCreator
  contest: EntryContest
}

async function getEntry(id: string): Promise<Entry | null> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/v1/entries/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

interface PageProps {
  params: { id: string }
}

export default async function AdminEntryDetailPage({ params }: PageProps) {
  const entry = await getEntry(params.id)

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Entry not found.</p>
        <Link href="/admin/entries" className="text-purple-400 text-sm mt-2 inline-block">
          ← Back to entries
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/entries" className="text-zinc-400 hover:text-white text-sm transition-colors">
          ← Back
        </Link>
        <h1 className="text-2xl font-black text-white">{entry.title}</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Video player */}
        {entry.muxPlaybackId ? (
          <div className="aspect-video w-full bg-black">
            {/* Use native video-like embed for server component; MuxVideoPlayer is client-only */}
            <iframe
              src={`https://stream.mux.com/${entry.muxPlaybackId}`}
              className="w-full h-full"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-purple-900 via-blue-900 to-zinc-900 flex items-center justify-center">
            <p className="text-zinc-400 text-sm">Video processing…</p>
          </div>
        )}

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">{entry.title}</h2>
            {entry.description && (
              <p className="mt-1 text-zinc-400 text-sm">{entry.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-500">Creator</p>
              <p className="text-white font-medium">{entry.creator.displayName}</p>
            </div>
            <div>
              <p className="text-zinc-500">Contest</p>
              <p className="text-white font-medium">{entry.contest.title}</p>
            </div>
            <div>
              <p className="text-zinc-500">Submitted</p>
              <p className="text-white">{new Date(entry.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-zinc-500">Status</p>
              <p className="text-white capitalize">{entry.status}</p>
            </div>
          </div>

          {entry.rejectionReason && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-3">
              <p className="text-red-400 text-sm">{entry.rejectionReason}</p>
            </div>
          )}

          <AdminEntryReviewer entryId={entry.id} currentStatus={entry.status} />
        </div>
      </div>
    </div>
  )
}
