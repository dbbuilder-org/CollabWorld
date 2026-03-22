import { db } from '@collabworld/db'

export async function createNotification(opts: {
  recipientClerkId: string
  type: string
  title: string
  body: string
  link?: string
}): Promise<void> {
  try {
    const user = await db.user.findUnique({
      where: { clerkId: opts.recipientClerkId },
      select: { id: true },
    })
    if (!user) return

    await db.notification.create({
      data: {
        userId: user.id,
        type: opts.type,
        title: opts.title,
        body: opts.body,
        actionUrl: opts.link ?? null,
      },
    })
  } catch (err) {
    // fire-and-forget — never throws
    console.error('[notify] createNotification error:', err)
  }
}
