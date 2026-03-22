import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status') ?? 'pending'

  const validStatuses = ['pending', 'approved', 'rejected', 'winner']
  const statusFilter = validStatuses.includes(statusParam) ? statusParam : 'pending'

  try {
    const [data, total] = await Promise.all([
      db.contestEntry.findMany({
        where: { status: statusFilter as 'pending' | 'approved' | 'rejected' | 'winner' },
        include: {
          creator: { select: { displayName: true, avatarUrl: true } },
          contest: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.contestEntry.count({
        where: { status: statusFilter as 'pending' | 'approved' | 'rejected' | 'winner' },
      }),
    ])

    return NextResponse.json({ data, total }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/admin/entries]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
