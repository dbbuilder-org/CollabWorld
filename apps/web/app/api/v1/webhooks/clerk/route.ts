import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@collabworld/db'

interface ClerkEmailAddress {
  email_address: string
}

interface ClerkUserCreatedData {
  id: string
  email_addresses: ClerkEmailAddress[]
  first_name: string | null
  last_name: string | null
  image_url: string | null
}

interface ClerkUserDeletedData {
  id: string
}

interface ClerkEvent {
  type: string
  data: ClerkUserCreatedData | ClerkUserDeletedData
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // Get svix headers
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await req.text()

  // Verify webhook signature
  let event: ClerkEvent
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkEvent
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'user.created': {
        const data = event.data as ClerkUserCreatedData
        const email = data.email_addresses?.[0]?.email_address ?? ''
        const displayName = [data.first_name, data.last_name].filter(Boolean).join(' ') || email

        await db.user.create({
          data: {
            clerkId: data.id,
            email,
            displayName,
            avatarUrl: data.image_url ?? null,
            accountType: 'fan', // default — will be updated at onboarding
          },
        })

        // TODO: send welcome email via @collabworld/email
        break
      }

      case 'user.updated': {
        const data = event.data as ClerkUserCreatedData
        const email = data.email_addresses?.[0]?.email_address ?? ''
        const displayName = [data.first_name, data.last_name].filter(Boolean).join(' ') || email

        await db.user.update({
          where: { clerkId: data.id },
          data: {
            email,
            displayName,
            avatarUrl: data.image_url ?? null,
          },
        })
        break
      }

      case 'user.deleted': {
        const data = event.data as ClerkUserDeletedData
        await db.user.update({
          where: { clerkId: data.id },
          data: { isActive: false },
        })
        break
      }

      default:
        // Unhandled event type — return 200 to acknowledge
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error('[webhook/clerk] DB error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
