'use client'

type EntryStatus = 'pending' | 'approved' | 'rejected' | 'winner'

interface EntryStatusBannerProps {
  status: EntryStatus
  rejectionReason?: string | null
}

export default function EntryStatusBanner({ status, rejectionReason }: EntryStatusBannerProps) {
  if (status === 'pending') {
    return (
      <div className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700 rounded-xl px-4 py-3">
        <span className="text-yellow-400 text-lg">⏳</span>
        <p className="text-yellow-300 text-sm font-medium">Your entry is being reviewed</p>
      </div>
    )
  }

  if (status === 'approved' || status === 'winner') {
    return (
      <div className="flex items-center gap-3 bg-green-900/20 border border-green-700 rounded-xl px-4 py-3">
        <span className="text-green-400 text-lg">✓</span>
        <p className="text-green-300 text-sm font-medium">Your entry is live!</p>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-red-400 text-lg">✗</span>
          <p className="text-red-300 text-sm font-medium">Your entry was not approved</p>
        </div>
        {rejectionReason && (
          <p className="mt-2 text-red-400 text-xs pl-8">{rejectionReason}</p>
        )}
      </div>
    )
  }

  return null
}
