'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Prize {
  rank: number
  description: string
  value: number
}

export default function AdminNewContestPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [entryDeadline, setEntryDeadline] = useState('')
  const [votingStart, setVotingStart] = useState('')
  const [votingEnd, setVotingEnd] = useState('')
  const [contestEnd, setContestEnd] = useState('')
  const [maxEntries, setMaxEntries] = useState('')
  const [prizes, setPrizes] = useState<Prize[]>([
    { rank: 1, description: '', value: 0 },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addPrize() {
    setPrizes((prev) => [
      ...prev,
      { rank: prev.length + 1, description: '', value: 0 },
    ])
  }

  function removePrize(index: number) {
    setPrizes((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, rank: i + 1 }))
    )
  }

  function updatePrize(index: number, field: keyof Prize, value: string | number) {
    setPrizes((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          entryDeadline,
          votingStart,
          votingEnd,
          contestEnd,
          maxEntries: maxEntries ? parseInt(maxEntries, 10) : undefined,
          prizes: prizes.filter((p) => p.description).map((p) => ({
            rank: p.rank,
            description: p.description,
            value: p.value,
          })),
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to create contest')
        return
      }

      const json = await res.json()
      router.push(`/admin/contests/${json.data.id}`)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">New Contest</h1>
        <p className="text-zinc-400">Create a new contest. It will start in draft status.</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-zinc-400 text-sm mb-1">Title *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contest title"
            className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-zinc-400 text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Contest description..."
            className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Entry Deadline *</label>
            <input
              required
              type="datetime-local"
              value={entryDeadline}
              onChange={(e) => setEntryDeadline(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Voting Start *</label>
            <input
              required
              type="datetime-local"
              value={votingStart}
              onChange={(e) => setVotingStart(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Voting End *</label>
            <input
              required
              type="datetime-local"
              value={votingEnd}
              onChange={(e) => setVotingEnd(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Contest End *</label>
            <input
              required
              type="datetime-local"
              value={contestEnd}
              onChange={(e) => setContestEnd(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Max Entries */}
        <div>
          <label className="block text-zinc-400 text-sm mb-1">Max Entries (optional)</label>
          <input
            type="number"
            min="1"
            value={maxEntries}
            onChange={(e) => setMaxEntries(e.target.value)}
            placeholder="Unlimited"
            className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Prizes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-zinc-400 text-sm">Prizes</label>
            <button
              type="button"
              onClick={addPrize}
              className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
            >
              + Add Prize
            </button>
          </div>
          <div className="space-y-3">
            {prizes.map((prize, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white text-sm font-semibold">#{prize.rank} Place</p>
                  {prizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrize(index)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 text-xs mb-1">Description</label>
                    <input
                      value={prize.description}
                      onChange={(e) => updatePrize(index, 'description', e.target.value)}
                      placeholder="e.g. $500 cash prize"
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-xs mb-1">Value ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prize.value}
                      onChange={(e) => updatePrize(index, 'value', parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {submitting ? 'Creating...' : 'Create Contest'}
        </button>
      </form>
    </div>
  )
}
