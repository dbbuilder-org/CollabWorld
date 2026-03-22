import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@collabworld/db', () => ({
  db: {
    $queryRaw: vi.fn(),
  },
}))

import { db } from '@collabworld/db'

async function getHandler() {
  const mod = await import('@/app/api/health/route')
  return mod.GET
}

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns 200 with status ok when DB is healthy', async () => {
    vi.mocked(db.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }])
    const GET = await getHandler()
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.checks.db).toBe('ok')
  })

  it('includes timestamp in response', async () => {
    vi.mocked(db.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }])
    const GET = await getHandler()
    const res = await GET()
    const body = await res.json()
    expect(body.timestamp).toBeDefined()
    expect(new Date(body.timestamp).getTime()).toBeLessThanOrEqual(Date.now())
  })

  it('returns 503 with status degraded when DB fails', async () => {
    vi.mocked(db.$queryRaw).mockRejectedValueOnce(new Error('DB connection failed'))
    const GET = await getHandler()
    const res = await GET()
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.status).toBe('degraded')
    expect(body.checks.db).toBe('error')
  })

  it('includes checks object in response', async () => {
    vi.mocked(db.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }])
    const GET = await getHandler()
    const res = await GET()
    const body = await res.json()
    expect(body.checks).toBeDefined()
    expect(typeof body.checks).toBe('object')
  })
})
