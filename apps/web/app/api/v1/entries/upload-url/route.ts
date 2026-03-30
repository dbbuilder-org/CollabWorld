import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata } from '@/lib/auth'
import { createDirectUploadUrl } from '@/lib/mux'
import { logger } from '@/lib/logger'

const bodySchema = z.object({
  contestId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  isPrivate: z.boolean().optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (role !== 'creator') {
    return NextResponse.json({ error: 'Forbidden — creator role required' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { contestId, title, description, isPrivate } = parsed.data

  try {
    // Find the contest
    const contest = await db.contest.findUnique({
      where: { id: contestId },
      select: { id: true, status: true },
    })

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    if (contest.status !== 'active') {
      return NextResponse.json({ error: 'Contest is not active' }, { status: 400 })
    }

    // Find the internal user record
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check for duplicate entry
    const existing = await db.contestEntry.findUnique({
      where: { contestId_creatorId: { contestId, creatorId: user.id } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted an entry for this contest' },
        { status: 409 }
      )
    }

    // Create Mux upload URL
    const origin = req.headers.get('origin') ?? req.nextUrl.origin
    const { uploadId, uploadUrl } = await createDirectUploadUrl(origin)

    // Create the entry record
    const entry = await db.contestEntry.create({
      data: {
        contestId,
        creatorId: user.id,
        title,
        description,
        muxUploadId: uploadId,
        status: 'pending',
        isPrivate: isPrivate ?? false,
      },
      select: { id: true },
    })

    return NextResponse.json({ uploadUrl, entryId: entry.id }, { status: 201 })
  } catch (err) {
    logger.error('[POST /api/v1/entries/upload-url]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
