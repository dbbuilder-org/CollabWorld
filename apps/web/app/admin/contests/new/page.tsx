'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PrizeRow {
  rank: number
  prizeAmount: string
  description: string
}

export default function NewContestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [prizes, setPrizes] = useState<PrizeRow[]>([
    { rank: 1, prizeAmount: '', description: '' },
  ])

  function addPrize() {
    setPrizes((prev) => [
      ...prev,
      { rank: prev.length + 1, prizeAmount: '', description: '' },
    ])
  }

  function removePrize(index: number) {
    setPrizes((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, rank: i + 1 }))
    )
  }

  function updatePrize(index: number, field: keyof PrizeRow, value: string) {
    setPrizes((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)

    const body = {
      title: data.get('title') as string,
      description: (data.get('description') as string) || undefined,
      rules: (data.get('rules') as string) || undefined,
      entryDeadline: new Date(data.get('entryDeadline') as string).toISOString(),
      votingStart: new Date(data.get('votingStart') as string).toISOString(),
      votingEnd: new Date(data.get('votingEnd') as string).toISOString(),
      contestEnd: new Date(data.get('contestEnd') as string).toISOString(),
      maxEntries: data.get('maxEntries')
        ? parseInt(data.get('maxEntries') as string, 10)
        : undefined,
      assetPackageUrl: (data.get('assetPackageUrl') as string) || undefined,
      prizes: prizes.map((p) => ({
        rank: p.rank,
        prizeAmount: parseFloat(p.prizeAmount),
        description: p.description || undefined,
      })),
    }

    try {
      const res = await fetch('/api/v1/admin/contests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Failed to create contest')
        return
      }

      router.push('/admin/contests')
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Create Contest</h1>
        <p className="text-zinc-400 mt-1">Fill out all required fields to launch a new contest.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            minLength={3}
            maxLength={100}
            placeholder="e.g. Summer Beats Challenge 2026"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Describe what creators should submit..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 resize-none"
          />
        </div>

        {/* Rules */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Rules</label>
          <textarea
            name="rules"
            rows={4}
            placeholder="List the contest rules and eligibility requirements..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 resize-none"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'entryDeadline', label: 'Entry Deadline' },
            { name: 'votingStart', label: 'Voting Start' },
            { name: 'votingEnd', label: 'Voting End' },
            { name: 'contestEnd', label: 'Contest End' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                {field.label} <span className="text-red-400">*</span>
              </label>
              <input
                name={field.name}
                type="datetime-local"
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-zinc-400"
              />
            </div>
          ))}
        </div>

        {/* Max Entries */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Max Entries (optional)
          </label>
          <input
            name="maxEntries"
            type="number"
            min={1}
            placeholder="Leave blank for unlimited"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
        </div>

        {/* Asset Package URL */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Asset Package URL{' '}
            <span className="text-xs text-zinc-500">(R2 upload coming soon)</span>
          </label>
          <input
            name="assetPackageUrl"
            type="url"
            placeholder="https://..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
        </div>

        {/* Prizes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-zinc-300">
              Prize Structure <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={addPrize}
              className="text-xs text-zinc-400 hover:text-white transition-colors border border-zinc-700 rounded-lg px-3 py-1"
            >
              + Add Prize
            </button>
          </div>
          <div className="space-y-3">
            {prizes.map((prize, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="w-10 shrink-0 pt-2.5 text-sm text-zinc-500 text-center">
                  #{prize.rank}
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    min={1}
                    step="0.01"
                    required
                    value={prize.prizeAmount}
                    onChange={(e) => updatePrize(index, 'prizeAmount', e.target.value)}
                    placeholder="Prize amount ($)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={prize.description}
                    onChange={(e) => updatePrize(index, 'description', e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                {prizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrize(index)}
                    className="shrink-0 text-zinc-600 hover:text-red-400 transition-colors pt-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Contest'}
          </button>
          <a
            href="/admin/contests"
            className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-semibold hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
