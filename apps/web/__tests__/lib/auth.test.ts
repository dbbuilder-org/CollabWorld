import { describe, it, expect } from 'vitest'
import {
  getRoleFromMetadata,
  requireRole,
  isAdmin,
  getDashboardPath,
} from '@/lib/auth'
import type { AccountType } from '@collabworld/types'

describe('getRoleFromMetadata', () => {
  it('returns fan when metadata has role fan', () => {
    expect(getRoleFromMetadata({ role: 'fan' })).toBe('fan')
  })

  it('returns creator when metadata has role creator', () => {
    expect(getRoleFromMetadata({ role: 'creator' })).toBe('creator')
  })

  it('returns influencer when metadata has role influencer', () => {
    expect(getRoleFromMetadata({ role: 'influencer' })).toBe('influencer')
  })

  it('returns brand when metadata has role brand', () => {
    expect(getRoleFromMetadata({ role: 'brand' })).toBe('brand')
  })

  it('returns admin when metadata has role admin', () => {
    expect(getRoleFromMetadata({ role: 'admin' })).toBe('admin')
  })

  it('returns null when metadata is null', () => {
    expect(getRoleFromMetadata(null)).toBeNull()
  })

  it('returns null when metadata has no role', () => {
    expect(getRoleFromMetadata({})).toBeNull()
  })

  it('returns null when metadata role is invalid', () => {
    expect(getRoleFromMetadata({ role: 'superuser' })).toBeNull()
  })

  it('returns null when metadata is a string', () => {
    expect(getRoleFromMetadata('fan')).toBeNull()
  })
})

describe('requireRole', () => {
  it('returns true when roles match', () => {
    expect(requireRole('fan', 'fan')).toBe(true)
  })

  it('returns true when role is admin and required role is admin', () => {
    expect(requireRole('admin', 'admin')).toBe(true)
  })

  it('returns false when roles do not match', () => {
    expect(requireRole('creator', 'fan')).toBe(false)
  })

  it('returns false when userRole is null', () => {
    expect(requireRole('fan', null)).toBe(false)
  })
})

describe('isAdmin', () => {
  it('returns true for admin role', () => {
    expect(isAdmin('admin')).toBe(true)
  })

  it('returns false for non-admin roles', () => {
    const nonAdminRoles: AccountType[] = ['fan', 'creator', 'influencer', 'brand']
    for (const role of nonAdminRoles) {
      expect(isAdmin(role)).toBe(false)
    }
  })

  it('returns false for null', () => {
    expect(isAdmin(null)).toBe(false)
  })
})

describe('getDashboardPath', () => {
  it('returns /dashboard/fan for fan', () => {
    expect(getDashboardPath('fan')).toBe('/dashboard/fan')
  })

  it('returns /dashboard/creator for creator', () => {
    expect(getDashboardPath('creator')).toBe('/dashboard/creator')
  })

  it('returns /dashboard/influencer for influencer', () => {
    expect(getDashboardPath('influencer')).toBe('/dashboard/influencer')
  })

  it('returns /dashboard/brand for brand', () => {
    expect(getDashboardPath('brand')).toBe('/dashboard/brand')
  })

  it('returns /dashboard/admin for admin', () => {
    expect(getDashboardPath('admin')).toBe('/dashboard/admin')
  })
})
