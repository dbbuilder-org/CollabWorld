import { NextRequest, NextResponse } from 'next/server'
import { db } from '@collabworld/db'
import crypto from 'crypto'

interface MuxWebhookBody {
  type: string
  data: {
    id: string
    upload_id?: string
    passthrough?: string
    status?: string
    playback_ids?: Array<{ id: string; policy: string }>
    duration?: number
    errors?: Array<{ type: string; messages: string[] }>
  }
}

function verifyMuxSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): boolean {
  // Mux signature format: "t=<timestamp>,v1=<signature>"
  const parts = signatureHeader.split(',')
  const tPart = parts.find((p) => p.startsWith('t='))
  const vPart = parts.find((p) => p.startsWith('v1='))

  if (!tPart || !vPart) return false

  const timestamp = tPart.slice(2)
  const receivedSig = vPart.slice(3)

  const payload = `${timestamp}.${rawBody}`
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  const expectedBuf = Buffer.from(expectedSig, 'hex')
  const receivedBuf = Buffer.from(receivedSig, 'hex')

  if (expectedBuf.length !== receivedBuf.length) return false

  return crypto.timingSafeEqual(expectedBuf, receivedBuf)
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.MUX_WEBHOOK_SECRET
  if (!secret) {
    console.error('[MUX WEBHOOK] MUX_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const rawBody = await req.text()
  const signatureHeader = req.headers.get('mux-signature') ?? ''

  if (!verifyMuxSignature(rawBody, signatureHeader, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: MuxWebhookBody
  try {
    body = JSON.parse(rawBody) as MuxWebhookBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, data } = body

  try {
    switch (type) {
      case 'video.upload.asset_created': {
        // data.id is the upload id, data.upload_id may also be present
        // The asset that was created for this upload
        const uploadId = data.upload_id ?? data.id
        await db.contestEntry.updateMany({
          where: { muxUploadId: uploadId },
          data: { muxAssetId: data.id },
        })
        break
      }

      case 'video.asset.ready': {
        const playbackId = data.playback_ids?.[0]?.id ?? null
        const thumbnailUrl = playbackId
          ? `https://image.mux.com/${playbackId}/thumbnail.jpg`
          : null
        const durationSeconds = data.duration ? Math.round(data.duration) : null

        await db.contestEntry.updateMany({
          where: { muxAssetId: data.id },
          data: {
            muxPlaybackId: playbackId,
            thumbnailUrl,
            durationSeconds,
          },
        })
        break
      }

      case 'video.asset.errored': {
        await db.contestEntry.updateMany({
          where: { muxAssetId: data.id },
          data: {
            status: 'pending',
            rejectionReason: 'Video processing failed',
          },
        })
        break
      }

      default:
        // Unknown event — no-op
        break
    }
  } catch (err) {
    console.error('[MUX WEBHOOK] DB error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
