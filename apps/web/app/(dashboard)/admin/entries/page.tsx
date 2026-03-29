'use client'

import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

interface Entry {
  id: string
  title: string
  status: string
  createdAt: string
  creator: { displayName: string; email: string }
  contest: { id: string; title: string; slug: string }
}

export default function AdminEntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/v1/admin/entries?status=pending')
        if (!res.ok) return
        const json = await res.json()
        setEntries(json.data ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleAction(entryId: string, action: 'approved' | 'rejected') {
    const confirmed = window.confirm(`${action === 'approved' ? 'Approve' : 'Reject'} this entry?`)
    if (!confirmed) return

    const res = await fetch(`/api/v1/admin/entries/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action }),
    })

    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId))
    } else {
      alert('Failed to update entry')
    }
  }

  if (loading) return <div className="text-zinc-400 text-sm">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Pending Entries</h1>
        <p className="text-zinc-400">{entries.length} entries awaiting review</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Creator</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Entry Title</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Contest</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Submitted</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3">
                  <p className="text-white">{entry.creator.displayName}</p>
                  <p className="text-zinc-500 text-xs">{entry.creator.email}</p>
                </td>
                <td className="px-4 py-3 text-zinc-300">{entry.title}</td>
                <td className="px-4 py-3 text-zinc-400">{entry.contest.title}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleAction(entry.id, 'approved')}
                      className="text-green-400 hover:text-green-300 text-xs font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(entry.id, 'rejected')}
                      className="text-red-400 hover:text-red-300 text-xs font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && !loading && (
          <div className="text-center py-12 text-zinc-500 text-sm">No pending entries.</div>
        )}
      </div>
    </div>
  )
}
