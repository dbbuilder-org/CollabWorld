import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const unreadOnly = req.nextUrl.searchParams.get('unreadOnly') === 'true'

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ data: notifications }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/notifications]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
