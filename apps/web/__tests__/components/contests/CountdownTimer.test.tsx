import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import CountdownTimer from '@/components/contests/CountdownTimer'

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the expired label when target date is in the past', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    render(<CountdownTimer targetDate={pastDate} label="Voting is Open!" />)
    expect(screen.getByText('Voting is Open!')).toBeTruthy()
  })

  it('shows digits (timer) when time is remaining', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ahead
    render(<CountdownTimer targetDate={futureDate} label="Contest Starts!" />)
    // Should show the timer, not the label
    expect(screen.queryByText('Contest Starts!')).toBeNull()
    // Timer element should exist
    const timer = screen.getByRole('timer')
    expect(timer).toBeTruthy()
  })

  it('shows days, hours, min, sec labels when time remaining', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString()
    render(<CountdownTimer targetDate={futureDate} label="Done!" />)
    expect(screen.getByText('days')).toBeTruthy()
    expect(screen.getByText('hrs')).toBeTruthy()
    expect(screen.getByText('min')).toBeTruthy()
    expect(screen.getByText('sec')).toBeTruthy()
  })

  it('transitions to expired label after time runs out', () => {
    // Set a target date 2 seconds in the future
    const futureDate = new Date(Date.now() + 2000).toISOString()
    render(<CountdownTimer targetDate={futureDate} label="Time Up!" />)

    // Initially no label
    expect(screen.queryByText('Time Up!')).toBeNull()

    // Advance time by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // Now label should appear
    expect(screen.getByText('Time Up!')).toBeTruthy()
  })

  it('updates countdown every second', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 10).toISOString() // 10 min ahead
    render(<CountdownTimer targetDate={futureDate} label="Done!" />)

    const initialSecValue = screen.getByText('sec').previousSibling?.textContent
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    const updatedSecValue = screen.getByText('sec').previousSibling?.textContent
    // The seconds should have changed
    expect(updatedSecValue).not.toBe(initialSecValue)
  })
})
