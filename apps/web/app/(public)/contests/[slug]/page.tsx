import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getRoleFromMetadata } from '@/lib/auth'
import StatusBadge from '@/components/contests/StatusBadge'
import PrizeCard from '@/components/contests/PrizeCard'
import CountdownTimer from '@/components/contests/CountdownTimer'
import type { ContestStatus } from '@/lib/contest'

export const dynamic = 'force-dynamic'

interface Prize {
  id: string
  rank: number
  prizeAmount: number
  description?: string | null
}

interface ContestDetail {
  id: string
  title: string
  slug: string
  status: ContestStatus
  description?: string | null
  rules?: string | null
  prizePoolTotal: number
  thumbnailUrl?: string | null
  entryDeadline: string
  votingStart: string
  votingEnd: string
  contestEnd: string
  entryCount: number
  influencerCount: number
  daysRemaining: number
  brandSponsor?: { id: string; displayName: string; avatarUrl?: string | null } | null
  prizes: Prize[]
}

async function getContest(slug: string): Promise<ContestDetail | null> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/v1/contests/${slug}`, { cache: 'no-store' })
    if (res.status === 404) return null
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

function getCtaContent(
  status: ContestStatus,
  slug: string,
  isAuthed: boolean,
  role: string | null
): { text: string; href?: string; disabled?: boolean } {
  if (status === 'draft' || status === 'upcoming') {
    return { text: 'Registration Opening Soon', disabled: true }
  }
  if (status === 'active') {
    if (!isAuthed) return { text: 'Sign Up to Enter', href: '/sign-up' }
    if (role === 'creator') return { text: 'Submit Your Entry', href: `/contests/${slug}/enter` }
    return { text: 'Browse Entries', href: `/contests/${slug}/entries` }
  }
  if (status === 'voting') {
    return { text: 'Vote Now', href: `/contests/${slug}/entries` }
  }
  if (status === 'completed' || status === 'archived') {
    return { text: 'View Results', href: `/contests/${slug}/leaderboard` }
  }
  return { text: 'View Contest', disabled: true }
}

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const contest = await getContest(params.slug)
  if (!contest) return { title: 'Contest Not Found' }
  return {
    title: `${contest.title} — Collab World`,
    description: contest.description ?? `Enter the ${contest.title} contest on Collab World. $${Number(contest.prizePoolTotal).toLocaleString()} prize pool.`,
    openGraph: {
      title: contest.title,
      description: contest.description ?? undefined,
      images: contest.thumbnailUrl ? [{ url: contest.thumbnailUrl }] : undefined,
    },
  }
}

export default async function ContestDetailPage({ params }: PageProps) {
  const contest = await getContest(params.slug)
  if (!contest) notFound()

  const { userId } = auth()
  const isAuthed = !!userId
  let role: string | null = null
  if (isAuthed) {
    const user = await currentUser()
    role = getRoleFromMetadata(user?.publicMetadata ?? null)
  }

  const cta = getCtaContent(contest.status, contest.slug, isAuthed, role)

  const targetDate =
    contest.status === 'active'
      ? contest.entryDeadline
      : contest.status === 'upcoming'
      ? contest.entryDeadline
      : contest.status === 'voting'
      ? contest.votingEnd
      : contest.contestEnd

  const countdownLabel =
    contest.status === 'active'
      ? 'Submissions Closed'
      : contest.status === 'voting'
      ? 'Voting Ended'
      : 'Ended'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="relative w-full h-72 overflow-hidden">
        {contest.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={contest.thumbnailUrl}
            alt={contest.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <StatusBadge status={contest.status} />
            {contest.brandSponsor && (
              <span className="text-sm text-zinc-400">
                Sponsored by{' '}
                <span className="text-white font-medium">{contest.brandSponsor.displayName}</span>
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">{contest.title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Stats row */}
        <div className="flex flex-wrap gap-6 mb-10">
          <div>
            <div className="text-2xl font-bold text-white">
              ${Number(contest.prizePoolTotal).toLocaleString()}
            </div>
            <div className="text-sm text-zinc-500">Prize Pool</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{contest.entryCount.toLocaleString()}</div>
            <div className="text-sm text-zinc-500">Entries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{contest.daysRemaining}</div>
            <div className="text-sm text-zinc-500">Days Remaining</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {contest.description && (
              <section>
                <h2 className="text-xl font-bold text-white mb-3">About This Contest</h2>
                <p className="text-zinc-400 leading-relaxed">{contest.description}</p>
              </section>
            )}

            {/* Rules accordion */}
            {contest.rules && (
              <section>
                <details className="group">
                  <summary className="text-xl font-bold text-white mb-3 cursor-pointer list-none flex items-center gap-2">
                    <span>Contest Rules</span>
                    <span className="text-zinc-500 group-open:rotate-90 transition-transform">›</span>
                  </summary>
                  <div className="mt-3 text-zinc-400 leading-relaxed whitespace-pre-line">
                    {contest.rules}
                  </div>
                </details>
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Countdown */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="text-sm text-zinc-500 mb-3 font-medium uppercase tracking-wide">
                Time Remaining
              </div>
              <CountdownTimer targetDate={targetDate} label={countdownLabel} />
            </div>

            {/* CTA */}
            <div>
              {cta.href ? (
                <a
                  href={cta.href}
                  className="block w-full text-center px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-100 transition-colors"
                >
                  {cta.text}
                </a>
              ) : (
                <button
                  disabled
                  className="block w-full text-center px-6 py-3 rounded-xl bg-zinc-700 text-zinc-400 font-semibold cursor-not-allowed"
                >
                  {cta.text}
                </button>
              )}
            </div>

            {/* Prizes */}
            <div>
              <h2 className="text-lg font-bold text-white mb-3">Prizes</h2>
              <div className="space-y-3">
                {contest.prizes.map((prize) => (
                  <PrizeCard key={prize.id} prize={prize} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
