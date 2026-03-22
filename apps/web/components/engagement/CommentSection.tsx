'use client'

import { useState, useEffect } from 'react'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    displayName: string
    avatarUrl: string | null
  }
}

interface CommentSectionProps {
  entryId: string
  isAuthenticated: boolean
}

export default function CommentSection({ entryId, isAuthenticated }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const PAGE_SIZE = 5

  useEffect(() => {
    fetchComments(0, true)
  }, [entryId])

  async function fetchComments(newOffset: number, reset = false) {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/v1/entries/${entryId}/comment?limit=${PAGE_SIZE}&offset=${newOffset}`
      )
      if (!res.ok) throw new Error('Failed to load comments')
      const data = await res.json()
      setComments(reset ? data.items : [...comments, ...data.items])
      setTotal(data.total)
      setHasMore(data.hasMore)
      setOffset(newOffset + data.items.length)
    } catch {
      setError('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/entries/${entryId}/comment`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to post comment')
        return
      }

      const newComment = await res.json()
      setComments([newComment, ...comments])
      setTotal(total + 1)
      setContent('')
    } catch {
      setError('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">
        Comments {total > 0 && <span className="text-zinc-500 font-normal text-sm">({total})</span>}
      </h3>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            maxLength={500}
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white placeholder:text-zinc-500 resize-none focus:outline-none focus:border-zinc-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500">{content.length}/500</span>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-zinc-100 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <p className="text-zinc-400 text-sm">
            <a href="/sign-in" className="text-white font-semibold hover:underline">
              Login
            </a>{' '}
            to comment
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-3">
        {loading && comments.length === 0 ? (
          <p className="text-zinc-500 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-zinc-500 text-sm">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                {comment.user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comment.user.avatarUrl}
                    alt={comment.user.displayName}
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-300">
                    {comment.user.displayName[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-white">
                  {comment.user.displayName}
                </span>
                <span className="text-xs text-zinc-500 ml-auto">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-zinc-300 text-sm">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <button
          onClick={() => fetchComments(offset)}
          disabled={loading}
          className="text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}
