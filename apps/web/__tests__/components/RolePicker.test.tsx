import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

// Mock fetch
global.fetch = vi.fn()

import RolePicker from '@/components/onboarding/RolePicker'

describe('RolePicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { role: 'fan' } }),
    })
  })

  it('renders 4 role cards', () => {
    render(<RolePicker />)
    expect(screen.getByTestId('role-card-fan')).toBeInTheDocument()
    expect(screen.getByTestId('role-card-creator')).toBeInTheDocument()
    expect(screen.getByTestId('role-card-influencer')).toBeInTheDocument()
    expect(screen.getByTestId('role-card-brand')).toBeInTheDocument()
  })

  it('shows all role titles', () => {
    render(<RolePicker />)
    expect(screen.getByText('Fan')).toBeInTheDocument()
    expect(screen.getByText('Creator')).toBeInTheDocument()
    expect(screen.getByText('Influencer')).toBeInTheDocument()
    expect(screen.getByText('Brand')).toBeInTheDocument()
  })

  it('calls onSelect with role name when a card is clicked', async () => {
    const onSelect = vi.fn()
    render(<RolePicker onSelect={onSelect} />)

    fireEvent.click(screen.getByTestId('role-card-creator'))

    expect(onSelect).toHaveBeenCalledWith('creator')
  })

  it('calls onSelect with fan role when fan card is clicked', () => {
    const onSelect = vi.fn()
    render(<RolePicker onSelect={onSelect} />)

    fireEvent.click(screen.getByTestId('role-card-fan'))

    expect(onSelect).toHaveBeenCalledWith('fan')
  })

  it('shows active state on selected role', async () => {
    const onSelect = vi.fn()
    render(<RolePicker onSelect={onSelect} />)

    const creatorCard = screen.getByTestId('role-card-creator')
    fireEvent.click(creatorCard)

    // After click, the card should have the active border class
    expect(creatorCard).toHaveClass('border-white')
  })

  it('shows different active state for non-selected role', () => {
    const onSelect = vi.fn()
    render(<RolePicker onSelect={onSelect} />)

    const fanCard = screen.getByTestId('role-card-fan')
    const creatorCard = screen.getByTestId('role-card-creator')

    fireEvent.click(fanCard)

    expect(fanCard).toHaveClass('border-white')
    expect(creatorCard).not.toHaveClass('border-white')
  })
})
