import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { getRoleFromMetadata } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (role !== 'creator') {
    return NextResponse.json({ error: 'Forbidden — creator role required' }, { status: 403 })
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const entries = await db.contestEntry.findMany({
      where: { creatorId: user.id },
      include: {
        contest: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: entries }, { status: 200 })
  } catch (err) {
    logger.error('[GET /api/v1/entries]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
