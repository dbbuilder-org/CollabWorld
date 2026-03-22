import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'

export async function POST(_req: NextRequest): Promise<NextResponse> {
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

    const result = await db.notification.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    })

    return NextResponse.json({ data: { count: result.count } }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/v1/notifications/mark-all-read]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
