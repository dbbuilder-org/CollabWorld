import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { logger } from '@/lib/logger'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify ownership
    const notification = await db.notification.findUnique({
      where: { id: params.id },
    })
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }
    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await db.notification.update({
      where: { id: params.id },
      data: { readAt: new Date() },
    })

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err) {
    logger.error('[PATCH /api/v1/notifications/[id]/read]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
