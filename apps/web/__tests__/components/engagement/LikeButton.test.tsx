import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LikeButton from '@/components/engagement/LikeButton'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('LikeButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with outline heart when not liked', () => {
    render(
      <LikeButton
        entryId="entry-1"
        initialLiked={false}
        initialCount={5}
        isAuthenticated={true}
      />
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    const btn = screen.getByRole('button')
    expect(btn).not.toHaveAttribute('aria-pressed', 'true')
  })

  it('renders with filled heart when liked', () => {
    render(
      <LikeButton
        entryId="entry-1"
        initialLiked={true}
        initialCount={10}
        isAuthenticated={true}
      />
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows LoginModal when unauthenticated user clicks', () => {
    render(
      <LikeButton
        entryId="entry-1"
        initialLiked={false}
        initialCount={3}
        isAuthenticated={false}
      />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('optimistic update: count changes immediately on click', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ liked: true, likeCount: 6 }),
    })

    render(
      <LikeButton
        entryId="entry-1"
        initialLiked={false}
        initialCount={5}
        isAuthenticated={true}
      />
    )

    fireEvent.click(screen.getByRole('button'))

    // Optimistic update: count should change immediately
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('reverts on API error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <LikeButton
        entryId="entry-1"
        initialLiked={false}
        initialCount={5}
        isAuthenticated={true}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    // Optimistic update
    expect(screen.getByText('6')).toBeInTheDocument()

    // After error, should revert
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })
})
