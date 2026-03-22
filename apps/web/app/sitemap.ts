import { MetadataRoute } from 'next'
import { db } from '@collabworld/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://collabworld.servicevision.io'

  const contests = await db.contest.findMany({
    where: { status: { in: ['ACTIVE', 'VOTING', 'UPCOMING'] } },
    select: { slug: true, updatedAt: true },
  })

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/contests`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    ...contests.map(c => ({
      url: `${baseUrl}/contests/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
  ]
}
