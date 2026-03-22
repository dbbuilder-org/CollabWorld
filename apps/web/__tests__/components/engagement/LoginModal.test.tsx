import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginModal from '@/components/engagement/LoginModal'

describe('LoginModal', () => {
  it('renders with correct title', () => {
    render(<LoginModal onClose={vi.fn()} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Join to Like, Vote/i)).toBeInTheDocument()
  })

  it('close button calls onClose', () => {
    const onClose = vi.fn()
    render(<LoginModal onClose={onClose} />)
    // Find close button by aria-label
    const closeBtn = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('sign-up link goes to /sign-up', () => {
    render(<LoginModal onClose={vi.fn()} />)
    const signUpLink = screen.getByRole('link', { name: /Create Free Account/i })
    expect(signUpLink).toHaveAttribute('href', '/sign-up')
  })

  it('sign-in link goes to /sign-in', () => {
    render(<LoginModal onClose={vi.fn()} />)
    const signInLink = screen.getByRole('link', { name: /Sign In/i })
    expect(signInLink).toHaveAttribute('href', '/sign-in')
  })
})
