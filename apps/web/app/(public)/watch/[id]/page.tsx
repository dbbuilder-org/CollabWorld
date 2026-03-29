import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import WatchPageClient from './WatchPageClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = await db.contestEntry.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      description: true,
      thumbnailUrl: true,
      muxPlaybackId: true,
      creator: { select: { displayName: true } },
    },
  })

  if (!entry) return { title: 'Video Not Found' }

  const thumbnail =
    entry.thumbnailUrl ??
    (entry.muxPlaybackId
      ? `https://image.mux.com/${entry.muxPlaybackId}/thumbnail.jpg`
      : undefined)

  return {
    title: `${entry.title} by ${entry.creator.displayName} — Collab World`,
    description: entry.description ?? `Watch "${entry.title}" on Collab World`,
    openGraph: {
      title: entry.title,
      description: entry.description ?? undefined,
      images: thumbnail ? [{ url: thumbnail }] : undefined,
    },
  }
}

export default async function WatchPage({ params }: Props) {
  const { userId } = auth()

  const [entry, dbUser] = await Promise.all([
    db.contestEntry.findUnique({
      where: { id: params.id, status: 'approved' },
      include: {
        creator: {
          select: { id: true, displayName: true, avatarUrl: true, accountType: true, bio: true },
        },
        contest: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
    }),
    userId
      ? db.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
      : Promise.resolve(null),
  ])

  if (!entry || entry.isPrivate) {
    notFound()
  }

  // Check user's existing like + vote state
  const [existingLike, existingVote] = dbUser
    ? await Promise.all([
        db.entryEngagement.findFirst({
          where: { entryId: params.id, userId: dbUser.id, type: 'like' },
          select: { id: true },
        }),
        db.entryEngagement.findFirst({
          where: { entryId: params.id, userId: dbUser.id, type: 'vote' },
          select: { id: true },
        }),
      ])
    : [null, null]

  const initialLiked = !!existingLike
  const initialVoted = !!existingVote

  // Increment view count (fire-and-forget)
  db.contestEntry
    .update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {})

  // Trending entries for "Up Next" sidebar
  const upNext = await db.contestEntry.findMany({
    where: {
      status: 'approved',
      isPrivate: false,
      NOT: { id: params.id },
    },
    orderBy: { compositeScore: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      muxPlaybackId: true,
      thumbnailUrl: true,
      likeCount: true,
      viewCount: true,
      creator: { select: { displayName: true, avatarUrl: true } },
      contest: { select: { title: true, slug: true } },
    },
  })

  return (
    <WatchPageClient
      initialLiked={initialLiked}
      initialVoted={initialVoted}
      entry={{
        id: entry.id,
        title: entry.title,
        description: entry.description ?? null,
        muxPlaybackId: entry.muxPlaybackId ?? null,
        thumbnailUrl: entry.thumbnailUrl ?? null,
        voteCount: entry.voteCount,
        likeCount: entry.likeCount,
        commentCount: entry.commentCount,
        shareCount: entry.shareCount,
        viewCount: entry.viewCount,
        createdAt: entry.createdAt.toISOString(),
        creator: entry.creator,
        contest: entry.contest,
      }}
      upNext={upNext.map((e) => ({
        id: e.id,
        title: e.title,
        muxPlaybackId: e.muxPlaybackId ?? null,
        thumbnailUrl: e.thumbnailUrl ?? null,
        likeCount: e.likeCount,
        viewCount: e.viewCount,
        creator: e.creator,
        contest: e.contest,
      }))}
    />
  )
}
