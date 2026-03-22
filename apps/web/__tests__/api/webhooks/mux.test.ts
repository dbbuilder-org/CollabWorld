import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

vi.mock('@collabworld/db', () => ({
  db: {
    contestEntry: {
      updateMany: vi.fn(),
    },
  },
}))

import { db } from '@collabworld/db'
import { POST } from '@/app/api/v1/webhooks/mux/route'

const WEBHOOK_SECRET = 'test_mux_webhook_secret'

function buildSignatureHeader(body: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const payload = `${timestamp}.${body}`
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return `t=${timestamp},v1=${sig}`
}

function makeSignedRequest(body: object): NextRequest {
  const bodyStr = JSON.stringify(body)
  return new NextRequest('http://localhost/api/v1/webhooks/mux', {
    method: 'POST',
    body: bodyStr,
    headers: {
      'content-type': 'application/json',
      'mux-signature': buildSignatureHeader(bodyStr, WEBHOOK_SECRET),
    },
  })
}

describe('POST /api/v1/webhooks/mux', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.MUX_WEBHOOK_SECRET = WEBHOOK_SECRET
    ;(db.contestEntry.updateMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 })
  })

  it('returns 401 for invalid signature', async () => {
    const body = { type: 'video.upload.asset_created', data: { id: 'asset_123', upload_id: 'up_123' } }
    const bodyStr = JSON.stringify(body)
    const req = new NextRequest('http://localhost/api/v1/webhooks/mux', {
      method: 'POST',
      body: bodyStr,
      headers: {
        'content-type': 'application/json',
        'mux-signature': 't=999,v1=invalidsig',
      },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('handles video.upload.asset_created and updates entry', async () => {
    const body = { type: 'video.upload.asset_created', data: { id: 'asset_abc', upload_id: 'up_xyz' } }
    const res = await POST(makeSignedRequest(body))
    expect(res.status).toBe(200)
    expect(db.contestEntry.updateMany).toHaveBeenCalledWith({
      where: { muxUploadId: 'up_xyz' },
      data: { muxAssetId: 'asset_abc' },
    })
  })

  it('handles video.asset.ready and updates playback info', async () => {
    const body = {
      type: 'video.asset.ready',
      data: {
        id: 'asset_ready',
        playback_ids: [{ id: 'playback_123', policy: 'public' }],
        duration: 120.5,
      },
    }
    const res = await POST(makeSignedRequest(body))
    expect(res.status).toBe(200)
    expect(db.contestEntry.updateMany).toHaveBeenCalledWith({
      where: { muxAssetId: 'asset_ready' },
      data: {
        muxPlaybackId: 'playback_123',
        thumbnailUrl: 'https://image.mux.com/playback_123/thumbnail.jpg',
        durationSeconds: 121,
      },
    })
  })

  it('handles video.asset.errored and sets rejection reason', async () => {
    const body = {
      type: 'video.asset.errored',
      data: { id: 'asset_err' },
    }
    const res = await POST(makeSignedRequest(body))
    expect(res.status).toBe(200)
    expect(db.contestEntry.updateMany).toHaveBeenCalledWith({
      where: { muxAssetId: 'asset_err' },
      data: { status: 'pending', rejectionReason: 'Video processing failed' },
    })
  })

  it('returns 200 for unknown event type (no-op)', async () => {
    const body = { type: 'video.some.unknown_event', data: { id: 'xyz' } }
    const res = await POST(makeSignedRequest(body))
    expect(res.status).toBe(200)
    expect(db.contestEntry.updateMany).not.toHaveBeenCalled()
  })
})
