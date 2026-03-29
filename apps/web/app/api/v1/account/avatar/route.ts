import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
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
      return NextResponse.json({ error: 'File type not allowed. Use JPEG, PNG, GIF, or WebP.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large. Maximum 5 MB.' }, { status: 400 })
    }

    const ext = file.type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg'
    const filename = `${randomBytes(16).toString('hex')}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')

    await mkdir(uploadDir, { recursive: true })
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(join(uploadDir, filename), buffer)

    const avatarUrl = `/uploads/avatars/${filename}`

    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await db.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    })

    return NextResponse.json({ avatarUrl }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/v1/account/avatar]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
