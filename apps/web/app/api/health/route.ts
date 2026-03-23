import { NextResponse } from 'next/server'

// Lightweight liveness check for Render health probe.
// Returns 200 immediately — DB connectivity is checked separately at /api/health/db.
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
