'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type ContestStatus = 'draft' | 'upcoming' | 'active' | 'voting' | 'completed' | 'archived'

const TRANSITIONS: Record<ContestStatus, ContestStatus[]> = {
  draft: ['upcoming', 'archived'],
  upcoming: ['active', 'archived'],
  active: ['voting', 'archived'],
  voting: ['completed'],
  completed: ['archived'],
  archived: [],
}

interface Contest {
  id: string
  title: string
  slug: string
  description: string | null
  status: ContestStatus
  prizePoolTotal: string
  entryDeadline: string
  votingStart: string
  votingEnd: string
  contestEnd: string
  maxEntries: number | null
  createdAt: string
  _count?: { entries: number; influencerAssignments: number }
  entries?: Array<{
    id: string
    title: string
    status: string
    createdAt: string
    creator: { displayName: string; email: string }
  }>
  influencerAssignments?: Array<{
    id: string
    status: string
    influencer: { displayName: string; email: string }
    commissionRate: string
  }>
}

export default function AdminContestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [contest, setContest] = useState<Contest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v1/admin/contests/${id}/detail`)
        if (!res.ok) throw new Error('Failed to load contest')
        const json = await res.json()
        setContest(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleStatusTransition(newStatus: ContestStatus) {
    if (!contest) return
    const confirmed = window.confirm(`Transition contest to "${newStatus}"?`)
    if (!confirmed) return

    setTransitioning(true)
    try {
      const res = await fetch(`/api/v1/admin/contests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Failed to update status')
        return
      }
      const json = await res.json()
      setContest((prev) => prev ? { ...prev, status: json.data.status } : prev)
    } catch {
      alert('Failed to update status')
    } finally {
      setTransitioning(false)
    }
  }

  async function handleEntryAction(entryId: string, action: 'approved' | 'rejected') {
    const confirmed = window.confirm(`Mark entry as ${action}?`)
    if (!confirmed) return

    const res = await fetch(`/api/v1/admin/entries/${entryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action }),
    })
    if (res.ok) {
      setContest((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          entries: prev.entries?.map((e) =>
            e.id === entryId ? { ...e, status: action } : e
          ),
        }
      })
    }
  }

  if (loading) return <div className="text-zinc-400 text-sm">Loading...</div>
  if (error || !contest) {
    return <div className="text-red-400 text-sm">{error ?? 'Contest not found'}</div>
  }

  const validTransitions = TRANSITIONS[contest.status] ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/contests" className="text-indigo-400 text-sm mb-2 block">
            ← Back to Contests
          </Link>
          <h1 className="text-3xl font-black text-white">{contest.title}</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Status: <span className="text-white font-semibold capitalize">{contest.status}</span>
          </p>
        </div>

        {/* Status transitions */}
        {validTransitions.length > 0 && (
          <div className="flex gap-2">
            {validTransitions.map((next) => (
              <button
                key={next}
                onClick={() => handleStatusTransition(next)}
                disabled={transitioning}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors capitalize"
              >
                → {next}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs">Entries</p>
          <p className="text-2xl font-black text-white">{contest._count?.entries ?? 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs">Influencers</p>
          <p className="text-2xl font-black text-white">{contest._count?.influencerAssignments ?? 0}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs">Prize Pool</p>
          <p className="text-2xl font-black text-white">${Number(contest.prizePoolTotal).toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-xs">Max Entries</p>
          <p className="text-2xl font-black text-white">{contest.maxEntries ?? '∞'}</p>
        </div>
      </div>

      {/* Entries */}
      {contest.entries && contest.entries.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-white font-bold">Entries</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Creator</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Title</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {contest.entries.map((entry) => (
                <tr key={entry.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-white">{entry.creator.displayName}</p>
                    <p className="text-zinc-500 text-xs">{entry.creator.email}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{entry.title}</td>
                  <td className="px-4 py-3 text-zinc-400 capitalize">{entry.status}</td>
                  <td className="px-4 py-3 text-right">
                    {entry.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEntryAction(entry.id, 'approved')}
                          className="text-green-400 hover:text-green-300 text-xs font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleEntryAction(entry.id, 'rejected')}
                          className="text-red-400 hover:text-red-300 text-xs font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Influencer Assignments */}
      {contest.influencerAssignments && contest.influencerAssignments.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-white font-bold">Influencer Assignments</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Influencer</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Status</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Commission</th>
              </tr>
            </thead>
            <tbody>
              {contest.influencerAssignments.map((a) => (
                <tr key={a.id} className="border-b border-zinc-800 last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-white">{a.influencer.displayName}</p>
                    <p className="text-zinc-500 text-xs">{a.influencer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 capitalize">{a.status.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {(Number(a.commissionRate) * 100).toFixed(0)}%
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
