import type { AccountType } from '@collabworld/types'

const VALID_ROLES: AccountType[] = ['fan', 'creator', 'influencer', 'brand', 'admin']

/**
 * Extracts the AccountType role from Clerk publicMetadata.
 * Returns null if missing or invalid.
 */
export function getRoleFromMetadata(metadata: unknown): AccountType | null {
  if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }
  const record = metadata as Record<string, unknown>
  const role = record['role']
  if (typeof role === 'string' && (VALID_ROLES as string[]).includes(role)) {
    return role as AccountType
  }
  return null
}

/**
 * Returns true if the user's role matches the required role.
 */
export function requireRole(role: AccountType, userRole: AccountType | null): boolean {
  return userRole === role
}

/**
 * Returns true if the user has the admin role.
 */
export function isAdmin(role: AccountType | null): boolean {
  return role === 'admin'
}

/**
 * Returns the dashboard path for a given role.
 */
export function getDashboardPath(role: AccountType): string {
  return `/dashboard/${role}`
}
