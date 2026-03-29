import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Suppress console.error for expected error boundary catches
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})
afterEach(() => {
  console.error = originalConsoleError
})

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Child content')).toBeDefined()
  })

  it('renders default fallback when a child throws', () => {
    const ThrowingComponent = () => {
      throw new Error('Test error')
    }
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('Please refresh the page to try again.')).toBeDefined()
  })

  it('renders custom fallback when provided and child throws', () => {
    const ThrowingComponent = () => {
      throw new Error('Test error')
    }
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom fallback')).toBeDefined()
  })

  it('calls componentDidCatch when a child throws', () => {
    const spy = vi.spyOn(ErrorBoundary.prototype, 'componentDidCatch')
    const ThrowingComponent = () => {
      throw new Error('Test error')
    }
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('does not render fallback when children render successfully', () => {
    render(
      <ErrorBoundary fallback={<div>Should not appear</div>}>
        <div>Normal content</div>
      </ErrorBoundary>
    )
    expect(screen.queryByText('Should not appear')).toBeNull()
    expect(screen.getByText('Normal content')).toBeDefined()
  })
})
