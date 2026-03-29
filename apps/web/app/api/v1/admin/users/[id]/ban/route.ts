import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { isAdmin, getRoleFromMetadata } from '@/lib/auth'

interface RouteContext {
  params: { id: string }
}

export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const target = await db.user.findUnique({
      where: { id: params.id },
      select: { id: true, isBanned: true, accountType: true },
    })

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (target.accountType === 'admin') {
      return NextResponse.json({ error: 'Cannot ban an admin user' }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: params.id },
      data: { isBanned: !target.isBanned },
      select: { id: true, isBanned: true, displayName: true, email: true },
    })

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err) {
    console.error('[PATCH /api/v1/admin/users/[id]/ban]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
