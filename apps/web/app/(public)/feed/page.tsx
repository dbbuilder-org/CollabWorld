'use client'

import { useState, useEffect, useCallback } from 'react'
import EntryGrid from '@/components/entries/EntryGrid'

export const dynamic = 'force-dynamic'

type SortOption = 'trending' | 'top' | 'new'

interface FeedEntry {
  id: string
  title: string
  muxPlaybackId: string | null
  thumbnailUrl: string | null
  likeCount: number
  voteCount: number
  commentCount: number
  viewCount: number
  creator: { displayName: string; avatarUrl: string | null }
  contest: { id: string; title: string; slug: string }
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function FeedPage() {
  const [entries, setEntries] = useState<FeedEntry[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SortOption>('trending')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page on sort/search change
  useEffect(() => {
    setPage(1)
  }, [sort, debouncedSearch])

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sort,
        page: String(page),
        limit: '20',
      })
      if (debouncedSearch) params.set('search', debouncedSearch)

      const res = await fetch(`/api/v1/feed?${params}`)
      if (!res.ok) throw new Error('Failed to fetch feed')
      const json = await res.json()
      setEntries(json.data ?? [])
      setPagination(json.pagination ?? null)
    } catch (err) {
      console.error('Feed fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [sort, page, debouncedSearch])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'trending', label: 'Trending' },
    { value: 'top',      label: 'Top' },
    { value: 'new',      label: 'New' },
  ]

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="font-serif font-bold text-2xl text-white">Video Feed</h1>
              <p className="text-zinc-500 text-sm">All contest entries</p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search videos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
            </div>

            {/* Sort tabs */}
            <div className="flex gap-1 bg-gray-900 rounded-full p-1 border border-gray-800">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    sort === opt.value
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EntryGrid entries={entries} loading={loading} />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-5 py-2 rounded-full border border-gray-700 text-sm text-zinc-400 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-zinc-500 text-sm">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="px-5 py-2 rounded-full border border-gray-700 text-sm text-zinc-400 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
