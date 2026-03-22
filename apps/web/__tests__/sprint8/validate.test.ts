import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { validateBody, validateQuery } from '@/lib/validate'

describe('validateBody', () => {
  const schema = z.object({ name: z.string(), age: z.number() })
  const validate = validateBody(schema)

  it('returns data when body is valid', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice', age: 30 }),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await validate(req)
    expect('data' in result).toBe(true)
    if ('data' in result) {
      expect(result.data.name).toBe('Alice')
      expect(result.data.age).toBe(30)
    }
  })

  it('returns error response when body fails validation', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ name: 123, age: 'not-a-number' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await validate(req)
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error.status).toBe(400)
      const body = await result.error.json()
      expect(body.error).toBe('Validation failed')
      expect(Array.isArray(body.issues)).toBe(true)
    }
  })

  it('returns error response when body is missing required fields', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await validate(req)
    expect('error' in result).toBe(true)
  })

  it('returns error when JSON is invalid', async () => {
    const req = new Request('http://localhost', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await validate(req)
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error.status).toBe(400)
    }
  })

  it('works with nested object schemas', async () => {
    const nestedSchema = z.object({ user: z.object({ id: z.string() }) })
    const nestedValidate = validateBody(nestedSchema)
    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ user: { id: 'abc' } }),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await nestedValidate(req)
    expect('data' in result).toBe(true)
  })
})

describe('validateQuery', () => {
  const schema = z.object({ page: z.string(), limit: z.string() })

  it('returns data when query params are valid', () => {
    const params = new URLSearchParams({ page: '1', limit: '10' })
    const result = validateQuery(schema, params)
    expect('data' in result).toBe(true)
    if ('data' in result) {
      expect(result.data.page).toBe('1')
      expect(result.data.limit).toBe('10')
    }
  })

  it('returns error when required params are missing', () => {
    const params = new URLSearchParams({ page: '1' })
    const result = validateQuery(schema, params)
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error.status).toBe(400)
    }
  })

  it('returns issues array in error response', async () => {
    const params = new URLSearchParams({ page: '1' })
    const result = validateQuery(schema, params)
    if ('error' in result) {
      const body = await result.error.json()
      expect(body.error).toBe('Invalid query params')
      expect(Array.isArray(body.issues)).toBe(true)
    }
  })

  it('works with optional params schema', () => {
    const optionalSchema = z.object({ page: z.string().optional() })
    const params = new URLSearchParams()
    const result = validateQuery(optionalSchema, params)
    expect('data' in result).toBe(true)
  })

  it('returns valid data for empty params with fully-optional schema', () => {
    const emptySchema = z.object({})
    const params = new URLSearchParams()
    const result = validateQuery(emptySchema, params)
    expect('data' in result).toBe(true)
  })
})
