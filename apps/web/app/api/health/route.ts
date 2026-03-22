import { NextResponse } from 'next/server'
import { db } from '@collabworld/db'

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {}

  // DB check
  try {
    await db.$queryRaw`SELECT 1`
    checks.db = 'ok'
  } catch {
    checks.db = 'error'
  }

  const allOk = Object.values(checks).every(v => v === 'ok')
  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  )
}
