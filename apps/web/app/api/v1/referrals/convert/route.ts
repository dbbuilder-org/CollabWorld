import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { trackConversion } from '@/lib/referral'
import { logger } from '@/lib/logger'

const convertSchema = z.object({
  referralCode: z.string().min(1),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = convertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    await trackConversion(userId, parsed.data.referralCode)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    logger.error('[POST /api/v1/referrals/convert]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
