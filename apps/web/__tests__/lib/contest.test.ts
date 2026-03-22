import { describe, it, expect } from 'vitest'
import {
  canTransition,
  getValidTransitions,
  computeContestScore,
  generateSlug,
} from '@/lib/contest'
import type { ContestStatus } from '@/lib/contest'

describe('canTransition', () => {
  // Valid transitions
  it('allows draft -> upcoming', () => {
    expect(canTransition('draft', 'upcoming')).toBe(true)
  })
  it('allows draft -> archived', () => {
    expect(canTransition('draft', 'archived')).toBe(true)
  })
  it('allows upcoming -> active', () => {
    expect(canTransition('upcoming', 'active')).toBe(true)
  })
  it('allows upcoming -> archived', () => {
    expect(canTransition('upcoming', 'archived')).toBe(true)
  })
  it('allows active -> voting', () => {
    expect(canTransition('active', 'voting')).toBe(true)
  })
  it('allows active -> archived', () => {
    expect(canTransition('active', 'archived')).toBe(true)
  })
  it('allows voting -> completed', () => {
    expect(canTransition('voting', 'completed')).toBe(true)
  })
  it('allows completed -> archived', () => {
    expect(canTransition('completed', 'archived')).toBe(true)
  })

  // Invalid transitions
  it('disallows draft -> active', () => {
    expect(canTransition('draft', 'active')).toBe(false)
  })
  it('disallows draft -> voting', () => {
    expect(canTransition('draft', 'voting')).toBe(false)
  })
  it('disallows draft -> completed', () => {
    expect(canTransition('draft', 'completed')).toBe(false)
  })
  it('disallows upcoming -> voting', () => {
    expect(canTransition('upcoming', 'voting')).toBe(false)
  })
  it('disallows active -> completed', () => {
    expect(canTransition('active', 'completed')).toBe(false)
  })
  it('disallows voting -> active', () => {
    expect(canTransition('voting', 'active')).toBe(false)
  })
  it('disallows completed -> active', () => {
    expect(canTransition('completed', 'active')).toBe(false)
  })
  it('disallows archived -> draft', () => {
    expect(canTransition('archived', 'draft')).toBe(false)
  })
  it('disallows archived -> upcoming', () => {
    expect(canTransition('archived', 'upcoming')).toBe(false)
  })
  it('disallows same-state transition archived -> archived', () => {
    expect(canTransition('archived', 'archived')).toBe(false)
  })
  it('disallows same-state transition draft -> draft', () => {
    expect(canTransition('draft', 'draft')).toBe(false)
  })
})

describe('getValidTransitions', () => {
  it('returns [upcoming, archived] for draft', () => {
    expect(getValidTransitions('draft')).toEqual(['upcoming', 'archived'])
  })
  it('returns [active, archived] for upcoming', () => {
    expect(getValidTransitions('upcoming')).toEqual(['active', 'archived'])
  })
  it('returns [voting, archived] for active', () => {
    expect(getValidTransitions('active')).toEqual(['voting', 'archived'])
  })
  it('returns [completed] for voting', () => {
    expect(getValidTransitions('voting')).toEqual(['completed'])
  })
  it('returns [archived] for completed', () => {
    expect(getValidTransitions('completed')).toEqual(['archived'])
  })
  it('returns [] for archived', () => {
    expect(getValidTransitions('archived')).toEqual([])
  })
})

describe('computeContestScore', () => {
  it('returns 0 for all zeros', () => {
    expect(computeContestScore(0, 0, 0, 0)).toBe(0)
  })
  it('weights votes at 3', () => {
    expect(computeContestScore(1, 0, 0, 0)).toBe(3)
  })
  it('weights likes at 1', () => {
    expect(computeContestScore(0, 1, 0, 0)).toBe(1)
  })
  it('weights comments at 0.5', () => {
    expect(computeContestScore(0, 0, 1, 0)).toBe(0.5)
  })
  it('weights shares at 2', () => {
    expect(computeContestScore(0, 0, 0, 1)).toBe(2)
  })
  it('computes mixed score correctly', () => {
    // 10*3 + 20*1 + 4*0.5 + 5*2 = 30 + 20 + 2 + 10 = 62
    expect(computeContestScore(10, 20, 4, 5)).toBe(62)
  })
})

describe('generateSlug', () => {
  it('lowercases the title', () => {
    expect(generateSlug('HELLO')).toBe('hello')
  })
  it('replaces spaces with hyphens', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })
  it('strips non-alphanumeric non-hyphen chars', () => {
    expect(generateSlug('Hello, World!')).toBe('hello-world')
  })
  it('collapses multiple spaces/hyphens', () => {
    expect(generateSlug('Hello   World')).toBe('hello-world')
  })
  it('strips leading and trailing hyphens', () => {
    expect(generateSlug('  Hello  ')).toBe('hello')
  })
  it('handles numbers in title', () => {
    expect(generateSlug('Contest 2026')).toBe('contest-2026')
  })
  it('handles already slug-like input', () => {
    expect(generateSlug('my-contest-title')).toBe('my-contest-title')
  })
  it('handles empty string', () => {
    expect(generateSlug('')).toBe('')
  })
  it('strips special unicode characters', () => {
    expect(generateSlug('Café Royale')).toBe('caf-royale')
  })
})
