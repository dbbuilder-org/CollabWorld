import { NextRequest, NextResponse } from 'next/server'
import { db } from '@collabworld/db'
import { logger } from '@/lib/logger'

interface RouteContext {
  params: { id: string }
}

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  try {
    const entry = await db.contestEntry.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    })

    if (!entry || entry.status !== 'approved') {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    await db.contestEntry.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    logger.error('[POST /api/v1/entries/[id]/view]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
