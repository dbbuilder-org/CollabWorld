import { MetadataRoute } from 'next'
import { db } from '@collabworld/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://collabworld.servicevision.io'

  const [contests, entries] = await Promise.all([
    db.contest.findMany({
      where: { status: { in: ['active', 'voting', 'upcoming'] } },
      select: { slug: true, updatedAt: true },
    }),
    db.contestEntry.findMany({
      where: { status: 'approved', isPrivate: false },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    }),
  ])

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/contests`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/feed`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    ...contests.map((c) => ({
      url: `${baseUrl}/contests/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
    ...entries.map((e) => ({
      url: `${baseUrl}/watch/${e.id}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}
