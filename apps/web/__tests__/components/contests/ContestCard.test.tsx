import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContestCard from '@/components/contests/ContestCard'

const defaultProps = {
  id: 'uuid-001',
  title: 'Summer Beats Contest',
  slug: 'summer-beats-contest',
  status: 'active' as const,
  prizePoolTotal: 10000,
  thumbnailUrl: null,
  entryCount: 128,
  daysRemaining: 5,
}

describe('ContestCard', () => {
  it('renders the contest title', () => {
    render(<ContestCard {...defaultProps} />)
    expect(screen.getByText('Summer Beats Contest')).toBeTruthy()
  })

  it('renders the prize pool total', () => {
    render(<ContestCard {...defaultProps} />)
    expect(screen.getByText('$10,000')).toBeTruthy()
  })

  it('renders the status badge for active', () => {
    render(<ContestCard {...defaultProps} status="active" />)
    expect(screen.getByText('Active')).toBeTruthy()
  })

  it('renders the status badge for upcoming', () => {
    render(<ContestCard {...defaultProps} status="upcoming" />)
    expect(screen.getByText('Upcoming')).toBeTruthy()
  })

  it('renders the status badge for voting', () => {
    render(<ContestCard {...defaultProps} status="voting" />)
    // Both the badge and countdown label show "Voting Open" when voting
    const elements = screen.getAllByText('Voting Open')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows "Voting Open" countdown label when status is voting', () => {
    render(<ContestCard {...defaultProps} status="voting" daysRemaining={2} />)
    // The badge and countdown label both say 'Voting Open'
    const elements = screen.getAllByText('Voting Open')
    expect(elements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows days left countdown for active status', () => {
    render(<ContestCard {...defaultProps} status="active" daysRemaining={5} />)
    expect(screen.getByText('5 days left')).toBeTruthy()
  })

  it('shows "1 day left" singular for 1 day remaining', () => {
    render(<ContestCard {...defaultProps} daysRemaining={1} />)
    expect(screen.getByText('1 day left')).toBeTruthy()
  })

  it('shows "Ended" for completed contests', () => {
    render(<ContestCard {...defaultProps} status="completed" daysRemaining={0} />)
    expect(screen.getByText('Ended')).toBeTruthy()
  })

  it('renders entry count', () => {
    render(<ContestCard {...defaultProps} entryCount={128} />)
    expect(screen.getByText('128')).toBeTruthy()
  })

  it('renders a gradient placeholder when no thumbnailUrl', () => {
    const { container } = render(<ContestCard {...defaultProps} thumbnailUrl={null} />)
    const gradient = container.querySelector('.bg-gradient-to-br')
    expect(gradient).toBeTruthy()
  })

  it('renders an img tag when thumbnailUrl is provided', () => {
    const { container } = render(
      <ContestCard {...defaultProps} thumbnailUrl="https://example.com/thumb.jpg" />
    )
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('src')).toBe('https://example.com/thumb.jpg')
  })

  it('links to the correct contest slug URL', () => {
    const { container } = render(<ContestCard {...defaultProps} />)
    const link = container.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/contests/summer-beats-contest')
  })

  it('shows correct badge color class for active status', () => {
    render(<ContestCard {...defaultProps} status="active" />)
    const badge = screen.getByText('Active')
    expect(badge.className).toContain('green')
  })

  it('shows correct badge color class for upcoming status', () => {
    render(<ContestCard {...defaultProps} status="upcoming" />)
    const badge = screen.getByText('Upcoming')
    expect(badge.className).toContain('blue')
  })

  it('shows correct badge color class for voting status', () => {
    render(<ContestCard {...defaultProps} status="voting" />)
    const badges = screen.getAllByText('Voting Open')
    // The StatusBadge span has the purple class
    const badge = badges.find((el) => el.tagName === 'SPAN')
    expect(badge).toBeTruthy()
    expect(badge!.className).toContain('purple')
  })
})
