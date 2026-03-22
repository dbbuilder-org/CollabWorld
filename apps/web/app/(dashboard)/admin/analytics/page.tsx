'use client'

import { useEffect, useState, useCallback } from 'react'

interface AnalyticsData {
  registrationsByDay: Array<{ date: string; count: number }>
  entriesByDay: Array<{ date: string; count: number }>
  engagementByType: Array<{ type: string; count: number }>
  topContests: Array<{
    id: string
    title: string
    slug: string
    status: string
    entryCount: number
    totalEngagements: number
  }>
  topCreators: Array<{
    id: string
    displayName: string
    email: string
    totalScore: number
    entryCount: number
  }>
  range: { from: string; to: string }
}

function defaultFrom() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

function defaultTo() {
  return new Date().toISOString().split('T')[0]
}

export default function AdminAnalyticsPage() {
  const [from, setFrom] = useState(defaultFrom())
  const [to, setTo] = useState(defaultTo())
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/admin/analytics?from=${from}&to=${to}`)
      if (!res.ok) throw new Error('Failed to load analytics')
      const json = await res.json()
      setData(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Analytics</h1>
        <p className="text-zinc-400">Platform metrics and trends.</p>
      </div>

      {/* Date Range */}
      <div className="flex gap-3 items-center flex-wrap">
        <label className="text-zinc-400 text-sm">From:</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        />
        <label className="text-zinc-400 text-sm">To:</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={load}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Apply
        </button>
      </div>

      {loading && <div className="text-zinc-400 text-sm">Loading...</div>}
      {error && <div className="text-red-400 text-sm">{error}</div>}

      {data && (
        <div className="space-y-8">
          {/* Engagement by type */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Engagement by Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.engagementByType.map((e) => (
                <div key={e.type} className="bg-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-400 text-xs capitalize">{e.type}s</p>
                  <p className="text-2xl font-black text-white mt-1">{e.count.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Registrations by day */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-white font-bold">
                Registrations by Day ({data.registrationsByDay.reduce((s, r) => s + r.count, 0)} total)
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">Date</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">New Users</th>
                </tr>
              </thead>
              <tbody>
                {data.registrationsByDay.slice().reverse().map((r) => (
                  <tr key={r.date} className="border-b border-zinc-800 last:border-0">
                    <td className="px-4 py-2 text-zinc-300">{r.date}</td>
                    <td className="px-4 py-2 text-white font-semibold">{r.count}</td>
                  </tr>
                ))}
                {data.registrationsByDay.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-4 text-zinc-500 text-center">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Entries by day */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-white font-bold">
                Entries by Day ({data.entriesByDay.reduce((s, r) => s + r.count, 0)} total)
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">Date</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">Entries</th>
                </tr>
              </thead>
              <tbody>
                {data.entriesByDay.slice().reverse().map((r) => (
                  <tr key={r.date} className="border-b border-zinc-800 last:border-0">
                    <td className="px-4 py-2 text-zinc-300">{r.date}</td>
                    <td className="px-4 py-2 text-white font-semibold">{r.count}</td>
                  </tr>
                ))}
                {data.entriesByDay.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-4 text-zinc-500 text-center">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Top Contests */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-white font-bold">Top Contests by Engagement</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">Contest</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">Status</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">Entries</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">Engagements</th>
                </tr>
              </thead>
              <tbody>
                {data.topContests.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-800 last:border-0">
                    <td className="px-4 py-2 text-white font-medium">{c.title}</td>
                    <td className="px-4 py-2 text-zinc-400 capitalize">{c.status}</td>
                    <td className="px-4 py-2 text-zinc-300">{c.entryCount}</td>
                    <td className="px-4 py-2 text-zinc-300">{c.totalEngagements}</td>
                  </tr>
                ))}
                {data.topContests.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-4 text-zinc-500 text-center">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Top Creators */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-white font-bold">Top Creators by Score</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">Creator</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">Entries</th>
                  <th className="text-left text-zinc-400 font-medium px-4 py-2">Total Score</th>
                </tr>
              </thead>
              <tbody>
                {data.topCreators.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-800 last:border-0">
                    <td className="px-4 py-2">
                      <p className="text-white">{c.displayName}</p>
                      <p className="text-zinc-500 text-xs">{c.email}</p>
                    </td>
                    <td className="px-4 py-2 text-zinc-300">{c.entryCount}</td>
                    <td className="px-4 py-2 text-white font-semibold">{c.totalScore.toFixed(2)}</td>
                  </tr>
                ))}
                {data.topCreators.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-4 text-zinc-500 text-center">No data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
