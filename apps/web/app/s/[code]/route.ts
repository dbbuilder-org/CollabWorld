import { NextRequest, NextResponse } from 'next/server'
import { db } from '@collabworld/db'

interface RouteContext {
  params: { code: string }
}

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

  try {
    const shareCode = await db.shareCode.findUnique({
      where: { code: params.code },
      include: {
        entry: {
          select: {
            id: true,
            status: true,
            contest: { select: { slug: true } },
          },
        },
      },
    })

    if (!shareCode || shareCode.entry.status !== 'approved') {
      return NextResponse.redirect(`${appUrl}/feed`, { status: 302 })
    }

    // Mark as clicked and increment share count
    await Promise.all([
      db.shareCode.update({
        where: { id: shareCode.id },
        data: { clickedAt: new Date() },
      }),
      db.contestEntry.update({
        where: { id: shareCode.entryId },
        data: { shareCount: { increment: 1 } },
      }),
    ])

    const watchUrl = `${appUrl}/watch/${shareCode.entryId}`
    return NextResponse.redirect(watchUrl, { status: 301 })
  } catch (err) {
    console.error('[GET /s/[code]]', err)
    return NextResponse.redirect(`${appUrl}/feed`, { status: 302 })
  }
}
