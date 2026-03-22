# Collab World — Data Model

**Version:** 1.0 | **Date:** 2026-03-22 | **Status:** Approved

---

## 1. Entity Relationship Overview

```
users ──────────────────────────┐
  │                              │
  ├── creator_profiles           │
  ├── influencer_profiles        │
  ├── brand_profiles             │
  │                              │
  ├── contest_entries ──── contests ──── contest_prizes
  │       │                     │
  │       └── entry_engagements  └── influencer_assignments
  │                                         │
  ├── collaboration_packages ──────── (Phase 2)
  ├── content ──────────────────────── (Phase 2)
  ├── subscriptions ────────────────── (Phase 2)
  ├── revenue_events ────────────────── (Phase 2)
  └── notifications
```

---

## 2. Core Tables

### 2.1 `users`

Primary record for every registered member. Clerk manages auth; we extend with domain data.

```sql
Table: users
─────────────────────────────────────────────────────────
id              UUID          PK, default gen_random_uuid()
clerk_id        TEXT          UNIQUE NOT NULL
email           TEXT          UNIQUE NOT NULL
display_name    TEXT          NOT NULL
avatar_url      TEXT
account_type    ENUM          NOT NULL  -- fan | creator | influencer | brand | admin
bio             TEXT
social_links    JSONB         DEFAULT '{}'  -- { instagram, tiktok, youtube, twitter }
is_verified     BOOLEAN       DEFAULT false
is_active       BOOLEAN       DEFAULT true
referred_by     UUID          FK → users(id), nullable
referral_code   TEXT          UNIQUE  -- for influencer tracking links
created_at      TIMESTAMPTZ   DEFAULT now()
updated_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (clerk_id), (email), (account_type), (referral_code)
```

### 2.2 `creator_profiles`

Extended profile for Creator accounts.

```sql
Table: creator_profiles
─────────────────────────────────────────────────────────
id              UUID          PK
user_id         UUID          UNIQUE FK → users(id) ON DELETE CASCADE
genre           TEXT[]        -- ['film', 'music', 'music_video']
portfolio_url   TEXT
imdb_url        TEXT
spotify_url     TEXT
total_earnings  DECIMAL(12,2) DEFAULT 0.00
stripe_account_id TEXT        -- Stripe Connect account for payouts
stripe_account_status ENUM    -- pending | active | restricted
created_at      TIMESTAMPTZ   DEFAULT now()
updated_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (user_id)
```

### 2.3 `influencer_profiles`

Extended profile for Influencer accounts.

```sql
Table: influencer_profiles
─────────────────────────────────────────────────────────
id              UUID          PK
user_id         UUID          UNIQUE FK → users(id) ON DELETE CASCADE
platform_handles JSONB        -- { instagram: '@handle', tiktok, youtube, twitter }
total_followers INTEGER       DEFAULT 0
engagement_rate DECIMAL(5,2)  -- percentage
agreement_signed_at TIMESTAMPTZ  nullable
agreement_version TEXT        nullable  -- version of service agreement signed
stripe_account_id TEXT        -- Stripe Connect account for payouts
total_earnings  DECIMAL(12,2) DEFAULT 0.00
created_at      TIMESTAMPTZ   DEFAULT now()
updated_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (user_id)
```

### 2.4 `brand_profiles`

Extended profile for Brand accounts.

```sql
Table: brand_profiles
─────────────────────────────────────────────────────────
id              UUID          PK
user_id         UUID          UNIQUE FK → users(id) ON DELETE CASCADE
company_name    TEXT          NOT NULL
website         TEXT
contact_name    TEXT
contact_phone   TEXT
industry        TEXT
stripe_customer_id TEXT       -- for charging brands
total_spent     DECIMAL(12,2) DEFAULT 0.00
created_at      TIMESTAMPTZ   DEFAULT now()
updated_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (user_id), (company_name)
```

---

## 3. Contest Tables

### 3.1 `contests`

```sql
Table: contests
─────────────────────────────────────────────────────────
id              UUID          PK
title           TEXT          NOT NULL
slug            TEXT          UNIQUE NOT NULL
description     TEXT
rules           TEXT
status          ENUM          NOT NULL  -- draft | upcoming | active | voting | completed | archived
brand_sponsor_id UUID         FK → users(id), nullable  -- Brand user
prize_pool_total DECIMAL(12,2) DEFAULT 0.00
entry_deadline  TIMESTAMPTZ   NOT NULL
voting_start    TIMESTAMPTZ   NOT NULL
voting_end      TIMESTAMPTZ   NOT NULL
contest_end     TIMESTAMPTZ   NOT NULL
asset_package_url TEXT        -- downloadable contest brief + brand assets
max_entries     INTEGER       -- nullable = unlimited
thumbnail_url   TEXT
created_by      UUID          FK → users(id)  -- admin who created it
created_at      TIMESTAMPTZ   DEFAULT now()
updated_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (slug), (status), (brand_sponsor_id)
```

### 3.2 `contest_prizes`

```sql
Table: contest_prizes
─────────────────────────────────────────────────────────
id              UUID          PK
contest_id      UUID          FK → contests(id) ON DELETE CASCADE
rank            INTEGER       NOT NULL  -- 1, 2, 3, etc.
prize_amount    DECIMAL(12,2) NOT NULL
description     TEXT          -- "Grand Prize", "Runner-Up", etc.
winner_entry_id UUID          FK → contest_entries(id), nullable  -- set after judging
─────────────────────────────────────────────────────────
UNIQUE: (contest_id, rank)
INDEX: (contest_id)
```

### 3.3 `contest_entries`

```sql
Table: contest_entries
─────────────────────────────────────────────────────────
id              UUID          PK
contest_id      UUID          FK → contests(id) ON DELETE CASCADE
creator_id      UUID          FK → users(id)
title           TEXT          NOT NULL
description     TEXT
mux_upload_id   TEXT          -- Mux upload identifier
mux_asset_id    TEXT          -- Mux processed asset
mux_playback_id TEXT          -- Mux streaming playback ID
thumbnail_url   TEXT
duration_seconds INTEGER
status          ENUM          NOT NULL  -- pending | approved | rejected | winner
rejection_reason TEXT         -- admin note if rejected
vote_count      INTEGER       DEFAULT 0
like_count      INTEGER       DEFAULT 0
comment_count   INTEGER       DEFAULT 0
share_count     INTEGER       DEFAULT 0
composite_score DECIMAL(10,2) DEFAULT 0.00  -- cached leaderboard score
created_at      TIMESTAMPTZ   DEFAULT now()
updated_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
UNIQUE: (contest_id, creator_id)  -- one entry per creator per contest
INDEX: (contest_id, status), (creator_id), (contest_id, composite_score DESC)
```

### 3.4 `entry_engagements`

Every interaction (like, vote, comment, share) stored individually for auditability.

```sql
Table: entry_engagements
─────────────────────────────────────────────────────────
id              UUID          PK
entry_id        UUID          FK → contest_entries(id) ON DELETE CASCADE
user_id         UUID          FK → users(id)
type            ENUM          NOT NULL  -- like | vote | comment | share
content         TEXT          nullable  -- comment text only
ip_address      INET          -- for fraud detection
created_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
UNIQUE: (entry_id, user_id, type) WHERE type IN ('like', 'vote')
  -- one like and one vote per user per entry; comments/shares are multi
UNIQUE: (user_id, contest_id_via_entry, type) WHERE type = 'vote'
  -- enforced via trigger: one vote per user per contest total
INDEX: (entry_id, type), (user_id, type), (created_at)

-- Note: vote uniqueness per contest enforced via application logic + DB trigger
```

### 3.5 `influencer_contest_assignments`

```sql
Table: influencer_contest_assignments
─────────────────────────────────────────────────────────
id              UUID          PK
contest_id      UUID          FK → contests(id) ON DELETE CASCADE
influencer_id   UUID          FK → users(id)
status          ENUM          NOT NULL  -- invited | agreement_pending | active | completed | dropped
daily_posts_required INTEGER  DEFAULT 1
commission_rate DECIMAL(5,2)  -- percentage
tracking_url    TEXT          UNIQUE NOT NULL  -- unique referral URL
conversions     INTEGER       DEFAULT 0  -- registered members via this link
total_earned    DECIMAL(12,2) DEFAULT 0.00
agreement_signed_at TIMESTAMPTZ nullable
joined_at       TIMESTAMPTZ   DEFAULT now()
updated_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
UNIQUE: (contest_id, influencer_id)
INDEX: (contest_id, status), (influencer_id)
```

### 3.6 `leaderboard_snapshots`

Point-in-time leaderboard snapshots for analytics and completed contest history.

```sql
Table: leaderboard_snapshots
─────────────────────────────────────────────────────────
id              UUID          PK
contest_id      UUID          FK → contests(id)
entry_id        UUID          FK → contest_entries(id)
rank            INTEGER       NOT NULL
composite_score DECIMAL(10,2) NOT NULL
snapshot_at     TIMESTAMPTZ   NOT NULL
─────────────────────────────────────────────────────────
INDEX: (contest_id, snapshot_at), (entry_id)
```

---

## 4. Phase 2 Tables

### 4.1 `content`

```sql
Table: content
─────────────────────────────────────────────────────────
id              UUID          PK
creator_id      UUID          FK → users(id)
type            ENUM          NOT NULL  -- music | film | music_video | trailer
title           TEXT          NOT NULL
description     TEXT
mux_asset_id    TEXT          -- for video types
mux_playback_id TEXT
audio_url       TEXT          -- for music (R2 storage)
thumbnail_url   TEXT
duration_seconds INTEGER
genre           TEXT[]
tags            TEXT[]
is_published    BOOLEAN       DEFAULT false
is_premium_only BOOLEAN       DEFAULT false
view_count      INTEGER       DEFAULT 0
play_count      INTEGER       DEFAULT 0
created_at      TIMESTAMPTZ   DEFAULT now()
updated_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (creator_id), (type), (is_published), (genre)
```

### 4.2 `collaboration_packages`

```sql
Table: collaboration_packages
─────────────────────────────────────────────────────────
id              UUID          PK
package_type    ENUM          NOT NULL
  -- influencer_promo_boost | brand_integrated_music_video |
  -- film_trailer_amplification | affiliate_performance_campaign |
  -- product_placement_package
title           TEXT          NOT NULL
description     TEXT
proposer_id     UUID          FK → users(id)
recipient_id    UUID          FK → users(id)
status          ENUM          NOT NULL  -- proposed | negotiating | active | completed | cancelled
budget          DECIMAL(12,2)
commission_rate DECIMAL(5,2)
deliverables    TEXT
performance_metrics JSONB     -- { views_target, clicks_target, etc. }
start_date      TIMESTAMPTZ
end_date        TIMESTAMPTZ
notes           TEXT
created_at      TIMESTAMPTZ   DEFAULT now()
updated_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (proposer_id), (recipient_id), (status), (package_type)
```

### 4.3 `subscriptions`

```sql
Table: subscriptions
─────────────────────────────────────────────────────────
id              UUID          PK
user_id         UUID          UNIQUE FK → users(id)
stripe_subscription_id TEXT   UNIQUE
stripe_customer_id TEXT
plan            ENUM          NOT NULL  -- free | premium
status          ENUM          NOT NULL  -- active | past_due | cancelled | trialing
current_period_start TIMESTAMPTZ
current_period_end   TIMESTAMPTZ
cancel_at_period_end BOOLEAN   DEFAULT false
created_at      TIMESTAMPTZ   DEFAULT now()
updated_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (user_id), (stripe_subscription_id), (status)
```

### 4.4 `revenue_events`

```sql
Table: revenue_events
─────────────────────────────────────────────────────────
id              UUID          PK
type            ENUM          NOT NULL
  -- ad_revenue | subscription_share | brand_campaign |
  -- affiliate_commission | contest_prize | product_placement
amount_gross    DECIMAL(12,2) NOT NULL
platform_cut    DECIMAL(12,2) NOT NULL  -- 30%
creator_cut     DECIMAL(12,2) NOT NULL  -- 70%
recipient_id    UUID          FK → users(id)  -- who gets paid
content_id      UUID          FK → content(id), nullable
package_id      UUID          FK → collaboration_packages(id), nullable
contest_id      UUID          FK → contests(id), nullable
entry_id        UUID          FK → contest_entries(id), nullable
stripe_transfer_id TEXT       nullable  -- set after Stripe payout
paid_at         TIMESTAMPTZ   nullable
period_start    TIMESTAMPTZ   nullable  -- for subscription pool calculations
period_end      TIMESTAMPTZ   nullable
notes           TEXT
created_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (recipient_id), (type), (created_at), (contest_id)
```

---

## 5. Shared Tables

### 5.1 `notifications`

```sql
Table: notifications
─────────────────────────────────────────────────────────
id              UUID          PK
user_id         UUID          FK → users(id) ON DELETE CASCADE
type            TEXT          NOT NULL  -- welcome | entry_approved | contest_live | etc.
title           TEXT          NOT NULL
body            TEXT
action_url      TEXT          nullable  -- deep link
metadata        JSONB         DEFAULT '{}'
read_at         TIMESTAMPTZ   nullable
created_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (user_id, read_at), (created_at)
```

### 5.2 `audit_log`

```sql
Table: audit_log
─────────────────────────────────────────────────────────
id              UUID          PK
actor_id        UUID          FK → users(id), nullable  -- null = system
action          TEXT          NOT NULL  -- 'entry.approved', 'user.banned', etc.
resource_type   TEXT          NOT NULL  -- 'entry', 'user', 'contest'
resource_id     UUID          NOT NULL
metadata        JSONB         DEFAULT '{}'
ip_address      INET
created_at      TIMESTAMPTZ   DEFAULT now()
─────────────────────────────────────────────────────────
INDEX: (actor_id), (resource_type, resource_id), (created_at)
RETENTION: 7 years (platform compliance requirement)
```

---

## 6. Enums (Prisma)

```prisma
enum AccountType { fan creator influencer brand admin }
enum ContestStatus { draft upcoming active voting completed archived }
enum EntryStatus { pending approved rejected winner }
enum EngagementType { like vote comment share }
enum AssignmentStatus { invited agreement_pending active completed dropped }
enum PackageType {
  influencer_promo_boost
  brand_integrated_music_video
  film_trailer_amplification
  affiliate_performance_campaign
  product_placement_package
}
enum PackageStatus { proposed negotiating active completed cancelled }
enum ContentType { music film music_video trailer }
enum SubscriptionPlan { free premium }
enum SubscriptionStatus { active past_due cancelled trialing }
enum RevenueType {
  ad_revenue subscription_share brand_campaign
  affiliate_commission contest_prize product_placement
}
enum StripeAccountStatus { pending active restricted }
```

---

## 7. Indexes & Performance Notes

- **Leaderboard hot path:** `contest_entries(contest_id, composite_score DESC)` — direct Postgres index for leaderboard fallback; Redis sorted set as primary cache.
- **Engagement fraud detection:** `entry_engagements(ip_address, created_at)` — rate limit queries.
- **Referral tracking:** `users(referral_code)` — unique index for O(1) lookup on influencer link clicks.
- **Notification inbox:** `notifications(user_id, read_at)` — partial index `WHERE read_at IS NULL` for unread count badge.
