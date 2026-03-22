# Collab World — Requirements

**Version:** 1.0 | **Date:** 2026-03-22 | **Status:** Approved

---

## 1. Overview

Collab World is a two-phase entertainment collaboration platform for independent film and music. Phase 1 launches a Viral Contest Engine to build a critical mass of registered members across four user types (Creators, Influencers, Brands, Fans) before Phase 2 activates a full Collaboration Marketplace.

### 1.1 User Roles

| Role | Description | Key Actions |
|------|-------------|-------------|
| **Fan** | General audience member | Like, comment, vote, share, stream content |
| **Creator** | Filmmaker or music artist | Submit contest entries, upload content, earn revenue |
| **Influencer** | Social media promoter | Sign service agreements, promote entries daily, earn commissions |
| **Brand** | Corporate sponsor | Fund prize pools, launch campaigns, purchase placement packages |
| **Admin** | Platform operator | Manage contests, approve entries, manage payouts, view analytics |

### 1.2 Public vs. Authenticated Actions

| Action | Fan | Creator | Influencer | Brand |
|--------|-----|---------|-----------|-------|
| View contest entries (passive) | ✅ No login | ✅ | ✅ | ✅ |
| Like / Vote / Comment | Auth required | ✅ | ✅ | ✅ |
| Share (tracked) | Auth required | ✅ | ✅ | ✅ |
| View leaderboard | Auth required | ✅ | ✅ | ✅ |
| Message other users | Auth required | ✅ | ✅ | ✅ |
| Submit contest entry | — | ✅ | — | — |
| Promote contest entries | — | — | ✅ | — |
| Create brand campaign | — | — | — | ✅ |

---

## 2. Phase 1 — Viral Contest Engine

### 2.1 Authentication & Onboarding

**REQ-AUTH-001** — The platform shall use Clerk for authentication, supporting email/password, Google OAuth, and social login.

**REQ-AUTH-002** — During registration, users shall select exactly one account type (Fan / Creator / Influencer / Brand).

**REQ-AUTH-003** — Account type selection shall be permanent; changes require admin approval.

**REQ-AUTH-004** — Creator and Influencer accounts shall require profile completion before participating in contests (genre, bio, social handles).

**REQ-AUTH-005** — Brand accounts shall require company name, website, and contact info before creating campaigns.

**REQ-AUTH-006** — Influencers shall digitally sign a Service Agreement before becoming active (PDF e-sign via document upload acknowledgment).

### 2.2 Contest Management (Admin)

**REQ-CONTEST-001** — Admins shall create contests with: title, description, rules, prize structure, start/end dates, voting period, and associated brand sponsor.

**REQ-CONTEST-002** — Contest states: `draft → upcoming → active → voting → completed → archived`.

**REQ-CONTEST-003** — Admins shall be able to upload a downloadable Contest Asset Package (brand logos, brief, templates).

**REQ-CONTEST-004** — Admins shall approve/reject submitted entries before they appear publicly.

**REQ-CONTEST-005** — Admins shall be able to pause or cancel an active contest.

**REQ-CONTEST-006** — Contest prize structure shall support multiple ranked prizes (1st, 2nd, 3rd, etc.) with defined amounts.

### 2.3 Creator Entry Submission

**REQ-ENTRY-001** — Creators shall upload a video submission (MP4, MOV, max 2GB) via chunked upload.

**REQ-ENTRY-002** — Each entry shall include: title, description, and video file. Thumbnail auto-generated from video.

**REQ-ENTRY-003** — Creators may submit only one entry per contest.

**REQ-ENTRY-004** — Creators shall be able to edit their entry title/description (but not replace the video) before the entry deadline.

**REQ-ENTRY-005** — Entry status shall be visible to the creator: pending review → approved → live.

**REQ-ENTRY-006** — Creators shall download the contest asset package from their entry dashboard.

### 2.4 Influencer Management

**REQ-INF-001** — Influencers shall be invited to contests by admins or self-apply via contest page.

**REQ-INF-002** — Influencer service agreement shall be presented and acknowledged during contest signup.

**REQ-INF-003** — Each influencer assignment shall record: daily post commitment, commission rate, tracking link.

**REQ-INF-004** — Influencers shall receive a unique referral/tracking URL per contest to measure conversions.

**REQ-INF-005** — Influencer dashboard shall show: assigned contests, daily post checklist, earnings, conversion stats.

### 2.5 Engagement System

**REQ-ENG-001** — Fans, Creators, Influencers, and Brands may like an entry once (idempotent).

**REQ-ENG-002** — Fans, Creators, Influencers, and Brands may vote for one entry per contest.

**REQ-ENG-003** — Comments shall support text only (max 500 chars), with profanity filtering.

**REQ-ENG-004** — Shares shall be tracked when a registered user uses the platform's share button (generates a referral link).

**REQ-ENG-005** — All engagement actions shall require a registered account. Unauthenticated users are prompted to register.

**REQ-ENG-006** — Engagement data shall be stored with user_id for audit and leaderboard computation.

### 2.6 Leaderboard

**REQ-LB-001** — A public leaderboard shall rank contest entries by composite score: votes (3pts) + likes (1pt) + comments (0.5pt) + tracked shares (2pt).

**REQ-LB-002** — Leaderboard shall refresh every 5 minutes during active contest, every 30 minutes during voting period.

**REQ-LB-003** — Leaderboard shall be publicly viewable but interactive elements require login.

**REQ-LB-004** — Historical leaderboard snapshots shall be retained for completed contests.

### 2.7 Email Notifications (Resend)

**REQ-EMAIL-001** — Welcome email upon registration (role-specific content).

**REQ-EMAIL-002** — Entry submission confirmation.

**REQ-EMAIL-003** — Entry approval/rejection notification to creator.

**REQ-EMAIL-004** — Contest going-live notification to all enrolled influencers.

**REQ-EMAIL-005** — Daily digest to influencers showing their tracking stats.

**REQ-EMAIL-006** — Voting period opening notification to all registered contest participants.

**REQ-EMAIL-007** — Contest results announcement to all enrolled users.

**REQ-EMAIL-008** — Prize payout initiated notification to winners.

---

## 3. Phase 2 — Collaboration Marketplace

### 3.1 Content Platform

**REQ-CONTENT-001** — Creators shall upload music (MP3/WAV) and film content (MP4) to the platform library.

**REQ-CONTENT-002** — Content shall be streamed free with ad breaks (Fan free tier).

**REQ-CONTENT-003** — Premium subscribers ($14.99/month) shall stream without ads.

**REQ-CONTENT-004** — Play/stream counts shall be tracked per content item per user session.

### 3.2 Collaboration Packages

**REQ-PKG-001** — The platform shall provide five pre-made collaboration package templates:
  - Influencer Promo Boost
  - Brand Integrated Music Video
  - Film Trailer Amplification
  - Affiliate Performance Campaign
  - Product Placement Package

**REQ-PKG-002** — Any user may propose a collaboration package to another user.

**REQ-PKG-003** — Package proposals shall include: type, budget, commission rates, deliverables, timeline.

**REQ-PKG-004** — Recipient shall accept/reject/counter-propose packages.

**REQ-PKG-005** — Accepted packages shall generate automated milestones and payout triggers.

### 3.3 Revenue & Payouts

**REQ-REV-001** — All revenue shall be split 70% to creators/influencers/rights holders, 30% to Collab World.

**REQ-REV-002** — Revenue types tracked: ad revenue, subscription pool share, brand campaign fees, affiliate commissions, contest prizes, product placement fees.

**REQ-REV-003** — Creators shall connect Stripe Connect accounts for payouts.

**REQ-REV-004** — Payouts shall be triggered automatically upon milestone completion or at period end.

**REQ-REV-005** — Revenue dashboard shall show earnings breakdown by type, period, and content item.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load (LCP) < 2.5s at P75
- Leaderboard API response < 200ms (cached)
- Video upload: chunked, resumable, max 2GB
- Support 10,000 concurrent users at Phase 1 peak

### 4.2 Security
- All auth via Clerk (no custom sessions)
- CSRF protection on all mutation endpoints
- File uploads scanned before processing
- PII encrypted at rest (Postgres column-level for SSN/payment info)
- Rate limiting on engagement endpoints (prevent vote stuffing)
- OWASP Top 10 compliance

### 4.3 Scalability
- Stateless Next.js app on Render (horizontal scaling)
- Redis for session cache + leaderboard hot cache
- Postgres connection pooling (PgBouncer via Render)
- Video storage on Mux (streaming CDN)

### 4.4 Reliability
- 99.9% uptime SLA target
- Automated database backups (daily, 30-day retention)
- Health check endpoint at `/api/health`

### 4.5 Accessibility
- WCAG 2.1 AA minimum
- Keyboard navigable
- Screen reader compatible (shadcn/ui components)

---

## 5. Out of Scope (Phase 1)

- Live streaming
- Native mobile apps (responsive web only)
- Blockchain/NFT features
- Self-serve brand campaign creation (admin-mediated in Phase 1)
- Multi-language / i18n
- Direct messaging between users (Phase 2)
