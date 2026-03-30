import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { isAdmin, getRoleFromMetadata } from '@/lib/auth'
import { logger } from '@/lib/logger'

interface RouteContext {
  params: { id: string }
}

export async function DELETE(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const comment = await db.entryEngagement.findUnique({
      where: { id: params.id },
      select: { id: true, type: true },
    })

    if (!comment || comment.type !== 'comment') {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    await db.entryEngagement.delete({ where: { id: params.id } })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    logger.error('[DELETE /api/v1/admin/comments/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
