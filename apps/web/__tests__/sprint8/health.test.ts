import { describe, it, expect, vi, beforeEach } from 'vitest'

async function getHandler() {
  const mod = await import('@/app/api/health/route')
  return mod.GET
}

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns 200 with status ok', async () => {
    const GET = await getHandler()
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })

  it('includes timestamp in response', async () => {
    const GET = await getHandler()
    const res = await GET()
    const body = await res.json()
    expect(body.timestamp).toBeDefined()
    expect(new Date(body.timestamp).getTime()).toBeLessThanOrEqual(Date.now())
  })

  it('response is always 200 regardless of environment', async () => {
    const GET = await getHandler()
    const res1 = await GET()
    const res2 = await GET()
    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
  })

  it('timestamp is a valid ISO 8601 string', async () => {
    const GET = await getHandler()
    const res = await GET()
    const body = await res.json()
    expect(() => new Date(body.timestamp)).not.toThrow()
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })
})
