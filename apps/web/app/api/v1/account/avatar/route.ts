import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { randomBytes } from 'crypto'
import { uploadToR2, r2 } from '@/lib/r2'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('avatar')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed. Use JPEG, PNG, or WebP.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large. Maximum 5 MB.' }, { status: 400 })
    }

    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1] ?? 'jpg'
    const filename = `${randomBytes(16).toString('hex')}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    let avatarUrl: string

    if (r2) {
      avatarUrl = await uploadToR2(`avatars/${filename}`, buffer, file.type)
    } else {
      // Local fallback (dev only — ephemeral on Render)
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, filename), buffer)
      avatarUrl = `/uploads/avatars/${filename}`
    }

    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await db.user.update({ where: { id: user.id }, data: { avatarUrl } })

    return NextResponse.json({ avatarUrl }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
