/**
 * CW-055: Integration tests for the full entry submission flow.
 * All external calls (mux, db) are mocked.
 *
 * Happy path:
 *   1. POST /api/v1/entries/upload-url → entry created with muxUploadId
 *   2. Mux webhook fires video.upload.asset_created → entry updated with muxAssetId
 *   3. Mux webhook fires video.asset.ready → entry updated with playbackId + thumbnail
 *   4. Admin approves → entry status=approved + notification created
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

// ─── Shared in-memory stores ─────────────────────────────────────────────────
const entryStore: Record<string, {
  id: string
  contestId: string
  creatorId: string
  title: string
  status: string
  muxUploadId?: string | null
  muxAssetId?: string | null
  muxPlaybackId?: string | null
  thumbnailUrl?: string | null
  durationSeconds?: number | null
  rejectionReason?: string | null
}> = {}

const notificationStore: Array<{ userId: string; title: string }> = []

// ─── Mocks ───────────────────────────────────────────────────────────────────
vi.mock('@collabworld/db', () => ({
  db: {
    contest: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    contestEntry: {
      findUnique: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@mux/mux-node', () => ({
  default: vi.fn(() => ({
    video: {
      uploads: {
        create: vi.fn().mockResolvedValue({
          id: 'mux-upload-int',
          url: 'https://upload.mux.com/integration-test',
        }),
      },
    },
  })),
}))

// ─── Static imports AFTER mocks ──────────────────────────────────────────────
import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'
import { POST as uploadUrlPOST } from '@/app/api/v1/entries/upload-url/route'
import { POST as muxWebhookPOST } from '@/app/api/v1/webhooks/mux/route'
import { PATCH as adminReviewPATCH } from '@/app/api/v1/admin/entries/[id]/review/route'

const CONTEST_UUID = '550e8400-e29b-41d4-a716-446655440000'
const MUX_WEBHOOK_SECRET = 'integration-webhook-secret'

function buildMuxSig(body: string): string {
  const ts = Math.floor(Date.now() / 1000).toString()
  const sig = crypto.createHmac('sha256', MUX_WEBHOOK_SECRET).update(`${ts}.${body}`).digest('hex')
  return `t=${ts},v1=${sig}`
}

describe('Entry flow integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(entryStore).forEach((k) => { delete entryStore[k] })
    notificationStore.length = 0
    process.env.MUX_WEBHOOK_SECRET = MUX_WEBHOOK_SECRET

    // Default: creator auth
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'clerk_creator',
      sessionClaims: { publicMetadata: { role: 'creator' } },
    })

    // Contest exists and is active
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: CONTEST_UUID,
      status: 'active',
    })

    // User exists
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'creator-int-001',
      clerkId: 'clerk_creator',
      accountType: 'creator',
    })

    // No existing entry
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    // Create entry — stores it
    ;(db.contestEntry.create as ReturnType<typeof vi.fn>).mockImplementation(
      (args: { data: Record<string, unknown> }) => {
        const id = `entry-${Date.now()}`
        const entry = { ...args.data, id } as typeof entryStore[string]
        entryStore[id] = entry
        return Promise.resolve({ id })
      }
    )

    // updateMany — apply to matching entries in store
    ;(db.contestEntry.updateMany as ReturnType<typeof vi.fn>).mockImplementation(
      (args: { where: { muxUploadId?: string; muxAssetId?: string }; data: Record<string, unknown> }) => {
        Object.values(entryStore).forEach((entry) => {
          if (args.where.muxUploadId && entry.muxUploadId === args.where.muxUploadId) {
            Object.assign(entry, args.data)
          }
          if (args.where.muxAssetId && entry.muxAssetId === args.where.muxAssetId) {
            Object.assign(entry, args.data)
          }
        })
        return Promise.resolve({ count: 1 })
      }
    )

    // update — apply to specific entry
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockImplementation(
      (args: { where: { id: string }; data: Record<string, unknown> }) => {
        const entry = entryStore[args.where.id]
        if (entry) Object.assign(entry, args.data)
        return Promise.resolve(entry ?? null)
      }
    )

    // notification.create — store notification
    ;(db.notification.create as ReturnType<typeof vi.fn>).mockImplementation(
      (args: { data: { userId: string; title: string } }) => {
        notificationStore.push({ userId: args.data.userId, title: args.data.title })
        return Promise.resolve({ id: 'notif-001' })
      }
    )
  })

  it('full happy path: upload → asset created → asset ready → admin approve → notification', async () => {
    // ── Step 1: Creator requests upload URL ──────────────────────────────────
    const uploadReq = new NextRequest('http://localhost/api/v1/entries/upload-url', {
      method: 'POST',
      body: JSON.stringify({ contestId: CONTEST_UUID, title: 'Integration Entry' }),
      headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
    })

    const uploadRes = await uploadUrlPOST(uploadReq)
    expect(uploadRes.status).toBe(201)

    const { uploadUrl, entryId } = (await uploadRes.json()) as { uploadUrl: string; entryId: string }
    expect(uploadUrl).toContain('mux.com')
    expect(entryId).toBeTruthy()

    // Verify entry exists in store with muxUploadId
    expect(entryStore[entryId]).toBeDefined()
    expect(entryStore[entryId]!.muxUploadId).toBe('mux-upload-int')

    // ── Step 2: Mux webhook — asset created ──────────────────────────────────
    const assetCreatedBody = JSON.stringify({
      type: 'video.upload.asset_created',
      data: { id: 'mux-asset-int', upload_id: 'mux-upload-int' },
    })

    const assetCreatedReq = new NextRequest('http://localhost/api/v1/webhooks/mux', {
      method: 'POST',
      body: assetCreatedBody,
      headers: {
        'content-type': 'application/json',
        'mux-signature': buildMuxSig(assetCreatedBody),
      },
    })

    const assetCreatedRes = await muxWebhookPOST(assetCreatedReq)
    expect(assetCreatedRes.status).toBe(200)
    expect(entryStore[entryId]!.muxAssetId).toBe('mux-asset-int')

    // ── Step 3: Mux webhook — asset ready ────────────────────────────────────
    const assetReadyBody = JSON.stringify({
      type: 'video.asset.ready',
      data: {
        id: 'mux-asset-int',
        playback_ids: [{ id: 'playback-int-001', policy: 'public' }],
        duration: 95.5,
      },
    })

    const assetReadyReq = new NextRequest('http://localhost/api/v1/webhooks/mux', {
      method: 'POST',
      body: assetReadyBody,
      headers: {
        'content-type': 'application/json',
        'mux-signature': buildMuxSig(assetReadyBody),
      },
    })

    const assetReadyRes = await muxWebhookPOST(assetReadyReq)
    expect(assetReadyRes.status).toBe(200)
    expect(entryStore[entryId]!.muxPlaybackId).toBe('playback-int-001')
    expect(entryStore[entryId]!.thumbnailUrl).toBe(
      'https://image.mux.com/playback-int-001/thumbnail.jpg'
    )
    expect(entryStore[entryId]!.durationSeconds).toBe(96)

    // ── Step 4: Admin approves ────────────────────────────────────────────────
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'clerk_admin',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })

    // Update findUnique to return our entry for the admin review route
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: entryId,
      title: 'Integration Entry',
      creatorId: 'creator-int-001',
      contestId: CONTEST_UUID,
      status: 'pending',
    })

    const reviewReq = new NextRequest(
      `http://localhost/api/v1/admin/entries/${entryId}/review`,
      {
        method: 'PATCH',
        body: JSON.stringify({ action: 'approve' }),
        headers: { 'content-type': 'application/json' },
      }
    )

    const reviewRes = await adminReviewPATCH(reviewReq, { params: { id: entryId } })
    expect(reviewRes.status).toBe(200)

    // Notification created for creator
    expect(notificationStore).toHaveLength(1)
    expect(notificationStore[0]!.userId).toBe('creator-int-001')
    expect(notificationStore[0]!.title).toBe('Your entry has been approved!')
  })

  it('verifies invalid mux webhook signatures are rejected', async () => {
    const body = JSON.stringify({ type: 'video.asset.ready', data: { id: 'x' } })
    const req = new NextRequest('http://localhost/api/v1/webhooks/mux', {
      method: 'POST',
      body,
      headers: {
        'content-type': 'application/json',
        'mux-signature': 't=999,v1=invalidsignature',
      },
    })

    const res = await muxWebhookPOST(req)
    expect(res.status).toBe(401)
  })
})
