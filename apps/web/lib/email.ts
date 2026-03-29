import { Resend } from 'resend'
import type React from 'react'

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail(opts: {
  to: string | string[]
  subject: string
  react: React.ReactElement
  from?: string
}): Promise<{ id?: string; error?: string }> {
  if (!resend) return { id: 'dev-noop' }
  const from = opts.from ?? process.env.RESEND_FROM_EMAIL ?? 'noreply@collabworld.io'
  const { data, error } = await resend.emails.send({ ...opts, from })
  if (error) return { error: error.message }
  return { id: data?.id }
}
