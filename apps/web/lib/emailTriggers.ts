import * as React from 'react'
import { sendEmail } from './email'
import {
  WelcomeEmail,
  ContestGoLiveEmail,
  EntrySubmittedEmail,
  EntryApprovedEmail,
  EntryRejectedEmail,
  VotingOpenEmail,
  WinnerAnnouncementEmail,
  InfluencerInviteEmail,
} from '@collabworld/email'

export async function sendWelcomeEmail(user: {
  email: string
  firstName: string
  role: string
}): Promise<void> {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://collabworld.io'}/dashboard`
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Collab World!',
    react: React.createElement(WelcomeEmail, {
      firstName: user.firstName,
      role: user.role,
      dashboardUrl,
    }),
  })
}

export async function sendContestGoLiveEmail(opts: {
  to: string
  contestTitle: string
  contestUrl: string
  endsAt: string
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: `Your contest is now live: ${opts.contestTitle}`,
    react: React.createElement(ContestGoLiveEmail, {
      contestTitle: opts.contestTitle,
      contestUrl: opts.contestUrl,
      endsAt: opts.endsAt,
    }),
  })
}

export async function sendEntrySubmittedEmail(opts: {
  to: string
  creatorName: string
  contestTitle: string
  entryUrl: string
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: `Entry submitted: ${opts.contestTitle}`,
    react: React.createElement(EntrySubmittedEmail, {
      creatorName: opts.creatorName,
      contestTitle: opts.contestTitle,
      entryUrl: opts.entryUrl,
    }),
  })
}

export async function sendEntryApprovedEmail(opts: {
  to: string
  creatorName: string
  contestTitle: string
  entryUrl: string
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: `Your entry has been approved: ${opts.contestTitle}`,
    react: React.createElement(EntryApprovedEmail, {
      creatorName: opts.creatorName,
      contestTitle: opts.contestTitle,
      entryUrl: opts.entryUrl,
    }),
  })
}

export async function sendEntryRejectedEmail(opts: {
  to: string
  creatorName: string
  contestTitle: string
  reason?: string
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: `Entry update: ${opts.contestTitle}`,
    react: React.createElement(EntryRejectedEmail, {
      creatorName: opts.creatorName,
      contestTitle: opts.contestTitle,
      reason: opts.reason,
    }),
  })
}

export async function sendVotingOpenEmail(opts: {
  to: string[]
  contestTitle: string
  votingUrl: string
  endsAt: string
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: `Voting is now open: ${opts.contestTitle}`,
    react: React.createElement(VotingOpenEmail, {
      contestTitle: opts.contestTitle,
      votingUrl: opts.votingUrl,
      endsAt: opts.endsAt,
    }),
  })
}

export async function sendWinnerAnnouncementEmail(opts: {
  to: string
  winnerName: string
  contestTitle: string
  prizeDescription: string
  claimUrl: string
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: `Congratulations! You won ${opts.contestTitle}`,
    react: React.createElement(WinnerAnnouncementEmail, {
      winnerName: opts.winnerName,
      contestTitle: opts.contestTitle,
      prizeDescription: opts.prizeDescription,
      claimUrl: opts.claimUrl,
    }),
  })
}

export async function sendInfluencerInviteEmail(opts: {
  to: string
  influencerName: string
  contestTitle: string
  commissionRate: number
  assignmentUrl: string
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: `You've been invited to collaborate on ${opts.contestTitle}`,
    react: React.createElement(InfluencerInviteEmail, {
      influencerName: opts.influencerName,
      contestTitle: opts.contestTitle,
      commissionRate: opts.commissionRate,
      assignmentUrl: opts.assignmentUrl,
    }),
  })
}
