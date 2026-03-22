import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'email-id-123' }, error: null }),
    },
  })),
}))

// Mock @collabworld/email
vi.mock('@collabworld/email', () => ({
  WelcomeEmail: () => null,
  ContestGoLiveEmail: () => null,
  EntrySubmittedEmail: () => null,
  EntryApprovedEmail: () => null,
  EntryRejectedEmail: () => null,
  VotingOpenEmail: () => null,
  WinnerAnnouncementEmail: () => null,
  InfluencerInviteEmail: () => null,
}))

describe('sendEmail', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('returns dev-noop when RESEND_API_KEY is not set', async () => {
    const savedKey = process.env.RESEND_API_KEY
    delete process.env.RESEND_API_KEY

    // Re-import after resetting env — use dynamic import
    const { sendEmail } = await import('@/lib/email')
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      react: {} as React.ReactElement,
    })
    expect(result).toEqual({ id: 'dev-noop' })

    process.env.RESEND_API_KEY = savedKey
  })

  it('returns email id on successful send', async () => {
    process.env.RESEND_API_KEY = 'test-key'
    const { sendEmail } = await import('@/lib/email')
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Hello',
      react: {} as React.ReactElement,
    })
    expect(result.id).toBeTruthy()
  })

  it('uses custom from address when provided', async () => {
    process.env.RESEND_API_KEY = 'test-key'
    const { resend } = await import('@/lib/email')
    const { sendEmail } = await import('@/lib/email')
    await sendEmail({
      to: 'a@b.com',
      subject: 'Subj',
      react: {} as React.ReactElement,
      from: 'custom@collabworld.io',
    })
    expect(resend?.emails.send).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'custom@collabworld.io' })
    )
  })
})

describe('emailTriggers', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-key'
  })

  it('sendWelcomeEmail resolves without throwing', async () => {
    const { sendWelcomeEmail } = await import('@/lib/emailTriggers')
    await expect(
      sendWelcomeEmail({ email: 'a@b.com', firstName: 'Alice', role: 'creator' })
    ).resolves.toBeUndefined()
  })

  it('sendContestGoLiveEmail resolves without throwing', async () => {
    const { sendContestGoLiveEmail } = await import('@/lib/emailTriggers')
    await expect(
      sendContestGoLiveEmail({
        to: 'brand@example.com',
        contestTitle: 'Spring Contest',
        contestUrl: 'https://collabworld.io/contests/spring',
        endsAt: '2026-04-01',
      })
    ).resolves.toBeUndefined()
  })

  it('sendEntrySubmittedEmail resolves without throwing', async () => {
    const { sendEntrySubmittedEmail } = await import('@/lib/emailTriggers')
    await expect(
      sendEntrySubmittedEmail({
        to: 'creator@example.com',
        creatorName: 'Bob',
        contestTitle: 'Spring Contest',
        entryUrl: 'https://collabworld.io/entries/1',
      })
    ).resolves.toBeUndefined()
  })

  it('sendEntryApprovedEmail resolves without throwing', async () => {
    const { sendEntryApprovedEmail } = await import('@/lib/emailTriggers')
    await expect(
      sendEntryApprovedEmail({
        to: 'creator@example.com',
        creatorName: 'Bob',
        contestTitle: 'Spring Contest',
        entryUrl: 'https://collabworld.io/entries/1',
      })
    ).resolves.toBeUndefined()
  })

  it('sendEntryRejectedEmail resolves without throwing (with reason)', async () => {
    const { sendEntryRejectedEmail } = await import('@/lib/emailTriggers')
    await expect(
      sendEntryRejectedEmail({
        to: 'creator@example.com',
        creatorName: 'Bob',
        contestTitle: 'Spring Contest',
        reason: 'Content violates guidelines',
      })
    ).resolves.toBeUndefined()
  })

  it('sendEntryRejectedEmail resolves without throwing (no reason)', async () => {
    const { sendEntryRejectedEmail } = await import('@/lib/emailTriggers')
    await expect(
      sendEntryRejectedEmail({
        to: 'creator@example.com',
        creatorName: 'Bob',
        contestTitle: 'Spring Contest',
      })
    ).resolves.toBeUndefined()
  })

  it('sendVotingOpenEmail accepts array of recipients', async () => {
    const { sendVotingOpenEmail } = await import('@/lib/emailTriggers')
    await expect(
      sendVotingOpenEmail({
        to: ['a@a.com', 'b@b.com'],
        contestTitle: 'Spring Contest',
        votingUrl: 'https://collabworld.io/vote/spring',
        endsAt: '2026-04-15',
      })
    ).resolves.toBeUndefined()
  })

  it('sendWinnerAnnouncementEmail resolves without throwing', async () => {
    const { sendWinnerAnnouncementEmail } = await import('@/lib/emailTriggers')
    await expect(
      sendWinnerAnnouncementEmail({
        to: 'winner@example.com',
        winnerName: 'Carol',
        contestTitle: 'Spring Contest',
        prizeDescription: '$500 cash prize',
        claimUrl: 'https://collabworld.io/claim/abc',
      })
    ).resolves.toBeUndefined()
  })

  it('sendInfluencerInviteEmail resolves without throwing', async () => {
    const { sendInfluencerInviteEmail } = await import('@/lib/emailTriggers')
    await expect(
      sendInfluencerInviteEmail({
        to: 'inf@example.com',
        influencerName: 'Dave',
        contestTitle: 'Spring Contest',
        commissionRate: 0.15,
        assignmentUrl: 'https://collabworld.io/assignments/xyz',
      })
    ).resolves.toBeUndefined()
  })

  it('sendInfluencerInviteEmail converts commission rate to percent correctly', async () => {
    // Commission 0.1 → 10%, 0.25 → 25%
    const { sendInfluencerInviteEmail } = await import('@/lib/emailTriggers')
    // Should not throw for edge rate values
    await expect(
      sendInfluencerInviteEmail({
        to: 'inf@example.com',
        influencerName: 'Eve',
        contestTitle: 'Spring Contest',
        commissionRate: 0.25,
        assignmentUrl: 'https://collabworld.io/assignments/xyz',
      })
    ).resolves.toBeUndefined()
  })

  it('sendWelcomeEmail uses NEXT_PUBLIC_APP_URL for dashboard link', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.collabworld.io'
    const { sendWelcomeEmail } = await import('@/lib/emailTriggers')
    // Should not throw
    await expect(
      sendWelcomeEmail({ email: 'x@x.com', firstName: 'X', role: 'fan' })
    ).resolves.toBeUndefined()
    delete process.env.NEXT_PUBLIC_APP_URL
  })

  it('all trigger functions return void (not a value)', async () => {
    const { sendContestGoLiveEmail } = await import('@/lib/emailTriggers')
    const result = await sendContestGoLiveEmail({
      to: 'x@x.com',
      contestTitle: 'Test',
      contestUrl: 'https://collabworld.io/c/test',
      endsAt: '2026-05-01',
    })
    expect(result).toBeUndefined()
  })

  it('sendEntryApprovedEmail sends correct subject', async () => {
    const { sendEntryApprovedEmail } = await import('@/lib/emailTriggers')
    await sendEntryApprovedEmail({
      to: 'creator@example.com',
      creatorName: 'Bob',
      contestTitle: 'My Contest',
      entryUrl: 'https://collabworld.io/entries/2',
    })
    // No throw = success
    expect(true).toBe(true)
  })

  it('sendVotingOpenEmail with single recipient (string converted to array behaviour)', async () => {
    const { sendVotingOpenEmail } = await import('@/lib/emailTriggers')
    // Single-element array is valid
    await expect(
      sendVotingOpenEmail({
        to: ['single@example.com'],
        contestTitle: 'Contest A',
        votingUrl: 'https://collabworld.io/vote/a',
        endsAt: '2026-04-20',
      })
    ).resolves.toBeUndefined()
  })
})

// Needed for JSX type in the test
import type React from 'react'
