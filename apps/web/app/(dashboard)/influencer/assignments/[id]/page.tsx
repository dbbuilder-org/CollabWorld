import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@collabworld/db'
import { getRoleFromMetadata } from '@/lib/auth'
import { createReferralLink } from '@/lib/referral'
import { SignAgreementButton } from './SignAgreementButton'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://collabworld.io'

const SERVICE_AGREEMENT_TEXT = `
COLLAB WORLD INFLUENCER SERVICE AGREEMENT

This Influencer Service Agreement ("Agreement") is entered into between Collab World ("Company") and the influencer ("Influencer") identified by their platform account.

1. SERVICES
   Influencer agrees to promote the assigned contest across their social media platforms using the provided tracking link. Influencer will create authentic content that complies with all applicable FTC disclosure requirements.

2. COMMISSION
   Influencer will receive the agreed commission rate on qualifying conversions tracked through the unique referral link provided. Conversions are attributed for 30 days after a click.

3. CONTENT STANDARDS
   All promotional content must be original, accurate, and comply with Collab World's brand guidelines. Influencer may not make misleading claims about prizes or contest terms.

4. TERM
   This Agreement is effective upon signing and remains in effect for the duration of the assigned contest.

5. CONFIDENTIALITY
   Influencer agrees to keep the terms of this Agreement and any non-public contest information confidential.

6. GOVERNING LAW
   This Agreement is governed by the laws of the State of California.

By clicking "Sign Agreement" below, you acknowledge that you have read, understood, and agree to all terms of this Agreement.
`

export default async function AssignmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { userId, sessionClaims } = auth()
  if (!userId) redirect('/sign-in')

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (role !== 'influencer') redirect('/dashboard')

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect('/sign-in')

  const assignment = await db.influencerContestAssignment.findUnique({
    where: { id: params.id },
    include: {
      contest: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          description: true,
          entryDeadline: true,
          votingStart: true,
          contestEnd: true,
          prizePoolTotal: true,
        },
      },
    },
  })

  if (!assignment) notFound()
  if (assignment.influencerId !== user.id) redirect('/influencer')

  const isSigned = assignment.status === 'active' || assignment.status === 'completed'
  const referralLink = createReferralLink(assignment.trackingUrl, BASE_URL)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white mb-2">Service Agreement</h1>
        <p className="text-zinc-400">
          Review and sign your agreement for{' '}
          <span className="text-white font-semibold">{assignment.contest.title}</span>
        </p>
      </div>

      {/* Assignment Details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Assignment Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500">Contest</p>
            <p className="text-white font-semibold">{assignment.contest.title}</p>
          </div>
          <div>
            <p className="text-zinc-500">Commission Rate</p>
            <p className="text-white font-semibold">
              {(Number(assignment.commissionRate) * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Contest Ends</p>
            <p className="text-white font-semibold">
              {new Date(assignment.contest.contestEnd).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-zinc-500">Prize Pool</p>
            <p className="text-white font-semibold">
              ${Number(assignment.contest.prizePoolTotal).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Agreement Text */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Agreement Terms</h2>
        <div className="bg-zinc-950 rounded-xl p-4 max-h-64 overflow-y-auto">
          <pre className="text-zinc-400 text-xs whitespace-pre-wrap font-sans leading-relaxed">
            {SERVICE_AGREEMENT_TEXT.trim()}
          </pre>
        </div>
      </div>

      {/* Sign or Show Referral Link */}
      {isSigned ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-full bg-green-900/30 border border-green-800 px-3 py-1 text-xs text-green-400 font-medium">
              Agreement Signed
            </span>
            {assignment.agreementSignedAt && (
              <span className="text-zinc-500 text-sm">
                on {new Date(assignment.agreementSignedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Your Referral Link</h2>
          <p className="text-zinc-400 text-sm mb-3">
            Share this link to start earning commissions. Conversions are tracked for 30 days.
          </p>
          <div className="bg-zinc-950 rounded-xl p-4">
            <p className="text-blue-400 font-mono text-sm break-all">{referralLink}</p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-2">Sign to Activate</h2>
          <p className="text-zinc-400 text-sm mb-6">
            By signing this agreement, you will receive your unique referral link and can begin
            promoting the contest.
          </p>
          <SignAgreementButton assignmentId={assignment.id} />
        </div>
      )}
    </div>
  )
}
