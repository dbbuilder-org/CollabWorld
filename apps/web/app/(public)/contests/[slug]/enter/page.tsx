import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { getRoleFromMetadata } from '@/lib/auth'
import { db } from '@collabworld/db'
import EntrySubmissionForm from '@/components/entries/EntrySubmissionForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const contest = await db.contest.findUnique({
    where: { slug: params.slug },
    select: { title: true },
  })
  if (!contest) return { title: 'Contest Not Found' }
  return { title: `Enter: ${contest.title} — Collab World` }
}

export default async function ContestEnterPage({ params }: PageProps) {
  const { userId, sessionClaims } = auth()

  if (!userId) {
    redirect(`/sign-in?redirect_url=/contests/${params.slug}/enter`)
  }

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (role !== 'creator') {
    redirect(`/contests/${params.slug}`)
  }

  const contest = await db.contest.findUnique({
    where: { slug: params.slug },
    select: { id: true, title: true, slug: true, status: true, entryDeadline: true },
  })

  if (!contest) notFound()

  if (contest.status !== 'active') {
    redirect(`/contests/${params.slug}`)
  }

  // Check for duplicate entry
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })

  const existingEntry = dbUser
    ? await db.contestEntry.findUnique({
        where: { contestId_creatorId: { contestId: contest.id, creatorId: dbUser.id } },
        select: { id: true },
      })
    : null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back */}
        <Link
          href={`/contests/${params.slug}`}
          className="text-zinc-400 hover:text-white text-sm transition-colors mb-8 inline-block"
        >
          ← Back to Contest
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-yellow-400 text-xs font-medium uppercase tracking-widest mb-2">
            Submit Your Entry
          </p>
          <h1 className="font-serif font-bold text-3xl text-white mb-2">{contest.title}</h1>
          <p className="text-zinc-400 text-sm">
            Deadline:{' '}
            {new Date(contest.entryDeadline).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {existingEntry ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-3xl p-8 text-center">
            <div className="text-4xl mb-3">✓</div>
            <h2 className="font-serif font-bold text-xl text-white mb-2">Already entered!</h2>
            <p className="text-zinc-400 text-sm mb-6">
              You&apos;ve already submitted an entry to this contest. You can only submit one entry per contest.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/watch/${existingEntry.id}`}
                className="inline-block bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-all uppercase tracking-widest text-sm"
              >
                View My Entry
              </Link>
              <Link
                href={`/contests/${params.slug}/entries`}
                className="inline-block border border-gray-700 text-zinc-300 font-bold px-8 py-3 rounded-full hover:border-gray-500 hover:text-white transition-all uppercase tracking-widest text-sm"
              >
                Browse All Entries
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
            <EntrySubmissionForm contestId={contest.id} />
          </div>
        )}
      </div>
    </div>
  )
}
