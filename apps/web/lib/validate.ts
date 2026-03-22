import { z, ZodError, ZodType } from 'zod'
import { NextResponse } from 'next/server'

export function validateBody<T>(schema: ZodType<T>) {
  return async (req: Request): Promise<{ data: T } | { error: NextResponse }> => {
    try {
      const body = await req.json()
      const data = schema.parse(body)
      return { data }
    } catch (err) {
      if (err instanceof ZodError) {
        return { error: NextResponse.json({ error: 'Validation failed', issues: err.issues }, { status: 400 }) }
      }
      return { error: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
    }
  }
}

export function validateQuery<T>(schema: ZodType<T>, searchParams: URLSearchParams): { data: T } | { error: NextResponse } {
  try {
    const raw = Object.fromEntries(searchParams.entries())
    const data = schema.parse(raw)
    return { data }
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: NextResponse.json({ error: 'Invalid query params', issues: err.issues }, { status: 400 }) }
    }
    return { error: NextResponse.json({ error: 'Invalid params' }, { status: 400 }) }
  }
}
