import Image from 'next/image'
import Link from 'next/link'

// ─── Brand tokens (inline for RSC — no import overhead) ───────────────────────

const BRANDS = [
  'Lacoste','Coca-Cola','Gap','Ford','Target','Adidas',
  'Ray Ban','Rolex','Amazon','Audi','Pepsi','Apple',
]

const ROLES = [
  {
    icon: '🎬', title: 'Creators', color: 'border-blue-500/30 bg-blue-500/10 hover:border-blue-500/50',
    items: [
      'Submit films, music videos, or trailers to contests',
      'Earn prize money and revenue share',
      'Get discovered by brands and millions of fans',
    ],
  },
  {
    icon: '📱', title: 'Influencers', color: 'border-purple-500/30 bg-purple-500/10 hover:border-purple-500/50',
    items: [
      'Receive contest assignments and tracking links',
      'Post daily and earn affiliate commissions',
      'Build your verified talent portfolio',
    ],
  },
  {
    icon: '🏢', title: 'Brands', color: 'border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-500/50',
    items: [
      'Sponsor contests tied to your product campaigns',
      'Reach 500K+ engaged entertainment fans',
      'Fund prizes in exchange for authentic content',
    ],
  },
  {
    icon: '🎵', title: 'Fans', color: 'border-pink-500/30 bg-pink-500/10 hover:border-pink-500/50',
    items: [
      'Discover emerging music and film talent',
      'Vote for your favorites and shape the outcome',
      'Win rewards for engagement and referrals',
    ],
  },
]

const STEPS = [
  {
    n: '01', color: 'bg-blue-500/20 text-blue-400',
    title: 'Sign Up (Free)',
    desc: 'Creators, influencers, brands, and fans join Collab World for free. Once registered, participants gain access to contest rules, downloadable media assets, and their unique affiliate dashboard.',
  },
  {
    n: '02', color: 'bg-purple-500/20 text-purple-400',
    title: 'Download Official Assets',
    desc: 'Receive official film clips, featured soundtrack, brand-provided placement video clips, and your unique affiliate tracking links and promo codes.',
  },
  {
    n: '03', color: 'bg-pink-500/20 text-pink-400',
    title: 'Create & Post',
    desc: 'Create viral movie trailers or music videos using official assets. Post to YouTube, Instagram, TikTok, and Facebook with official hashtags. No professional editing required — simple video apps are encouraged.',
  },
  {
    n: '04', color: 'bg-yellow-500/20 text-yellow-400',
    title: 'Drive Engagement',
    desc: 'Performance tracked through verified analytics. Points awarded for views, likes, comments, shares, and affiliate sales. Live leaderboards showcase top performers weekly.',
  },
  {
    n: '05', color: 'bg-green-500/20 text-green-400',
    title: 'Earn Revenue + Win Prizes',
    desc: 'Earn commissions on sales through your unique link. Win cash prizes, brand rewards, exclusive experiences, and official credit. Influencers win cash bonuses, performance milestone rewards, and brand sponsorship deals.',
  },
  {
    n: '06', color: 'bg-red-500/20 text-red-400',
    title: 'Blockchain Transparency',
    desc: 'All revenue, commissions, and engagement metrics are tracked transparently on the Collab World platform, ensuring accurate payouts and fair competition.',
  },
]

const STATS = [
  { value: '5,000', label: 'Influencers assigned per contest' },
  { value: '25M+',  label: 'Organic impressions per cycle' },
  { value: '250K+', label: 'New members at 1% conversion' },
]

const PAYOUTS = [
  { range: '25k – 50k',   amount: '$1,650' },
  { range: '50k – 75k',   amount: '$3,300' },
  { range: '75k – 100k',  amount: '$5,000' },
  { range: '100k – 150k', amount: '$6,600' },
  { range: '150k – 200k', amount: '$9,900' },
  { range: '200k – 250k', amount: '$12,500' },
  { range: '250k – 300k', amount: '$15,000' },
  { range: '300k – 400k', amount: '$17,000' },
  { range: '400k – 500k', amount: '$19,250' },
  { range: '500k+',       amount: '$25,000' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ═══ NAVBAR ═══════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="Collab World" width={140} height={56} className="h-12 md:h-14 w-auto" priority />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/contests" className="hidden md:block text-zinc-400 hover:text-white text-sm transition-colors">Contests</Link>
            <Link href="/rules-creatives" className="hidden md:block text-zinc-400 hover:text-white text-sm transition-colors">For Creators</Link>
            <Link href="/rules-influencers" className="hidden md:block text-zinc-400 hover:text-white text-sm transition-colors">For Influencers</Link>
            <Link href="/sign-in" className="hidden md:block text-zinc-400 hover:text-white text-sm transition-colors">Sign In</Link>
            <Link href="/sign-up" className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_30px_rgba(255,255,255,0.25)]">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-24">
        <Image src="/hero-bg.jpg" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-blue-500/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <Image src="/logo.png" alt="Collab World" width={180} height={72} className="h-16 md:h-24 w-auto mb-3" priority />

          <p className="font-serif italic text-zinc-300 text-lg tracking-[0.2em] uppercase mb-6">Presents</p>

          <h1 className="font-serif font-bold text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight mb-5 max-w-4xl">
            The Viral Trailer &amp;
            <br />
            <span className="italic">Music Video Contests</span>
          </h1>

          <p className="text-2xl text-yellow-400 font-semibold mb-10 tracking-wide drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">
            Earn Revenue with Brands!
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/sign-up" className="bg-white text-black font-bold px-10 py-4 rounded-full hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_40px_rgba(255,255,255,0.3)] tracking-widest uppercase text-sm">
              Sign Up Now!
            </Link>
            <Link href="/contests" className="border-2 border-white/60 text-white font-bold px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-1 tracking-widest uppercase text-sm">
              View Contests
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ BRAND MARQUEE ════════════════════════════════════════════════════ */}
      <div className="border-y border-zinc-800 py-5 overflow-hidden bg-zinc-950">
        <p className="text-center text-zinc-600 text-[10px] tracking-[0.3em] uppercase mb-3">Featured Brand Partners</p>
        <div className="flex animate-marquee whitespace-nowrap">
          {[...BRANDS, ...BRANDS].map((name, i) => (
            <span key={i} className="mx-10 text-zinc-500 font-bold text-sm tracking-[0.25em] uppercase hover:text-zinc-300 transition-colors cursor-default">
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ CALLING ALL CREATIVES ════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto bg-gray-900/50 border border-gray-800 rounded-3xl p-10 md:p-16">
          <h2 className="font-serif font-bold text-4xl md:text-5xl text-center mb-3">
            Calling All Creatives
          </h2>
          <p className="text-center text-yellow-400 font-semibold tracking-widest text-sm uppercase mb-10">
            Film Makers&nbsp;•&nbsp;Music Artists&nbsp;•&nbsp;Content Creators&nbsp;•&nbsp;Videographers&nbsp;•&nbsp;Editors
          </p>

          <p className="text-zinc-400 text-lg leading-relaxed mb-6">
            Welcome to Collab World — a new and dynamic platform where creativity meets collaboration.
            Now in our Pre-Launch phase, through 2 separate and alternating monthly contests, we connect
            creatives, brands, and influencers to craft impactful, product-integrated campaigns that
            amplify reach and drive engagement.
          </p>

          <p className="text-zinc-400 text-base leading-relaxed mb-8">Our mission is to:</p>
          <ul className="space-y-3 mb-8">
            {[
              'Empower Creatives to focus on their craft',
              'Help Brands seamlessly integrate into authentic content',
              'Enable Influencers to Thrive with consistent revenue streams elevating campaigns',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-300">
                <span className="text-yellow-400 mt-1 shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-8 py-5 text-center mb-8">
            <p className="font-serif font-bold text-2xl text-yellow-400">All Without Financial Barriers!</p>
          </div>

          <p className="text-zinc-400 text-base leading-relaxed text-center">
            Within our 2 contests, we spotlight film makers and music artists in viral videos created by
            other film makers, videographers, editors, and content creators. All videos implement strategic
            product placements and leverage influencer networks to boost visibility — while getting all
            participants paid for their work!
          </p>
        </div>
      </section>

      {/* ═══ HOW THE VIDEO CONTESTS WORK (6 steps) ═══════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800">
        <h2 className="font-serif font-bold text-4xl md:text-5xl text-center mb-4">How the Video Contests Work</h2>
        <p className="text-zinc-400 text-center mb-14 max-w-xl mx-auto text-lg">
          Six steps from signup to payout — a repeatable flywheel for creators, influencers, brands, and fans.
        </p>
        <div className="space-y-4 max-w-3xl mx-auto">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-6 items-start bg-gray-900/40 border border-gray-800 rounded-3xl p-8 hover:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className={`rounded-2xl w-12 h-12 flex items-center justify-center shrink-0 font-black text-xs ${step.color}`}>
                {step.n}
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRIZES ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800">
        <h2 className="font-serif font-bold text-4xl md:text-5xl text-center mb-4">Prizes</h2>
        <p className="text-zinc-400 text-center mb-14 max-w-xl mx-auto text-lg">
          Real money. Real experiences. Real recognition.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Creators */}
          <div className="bg-gray-900/50 border border-blue-500/30 rounded-3xl p-10 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="font-serif font-bold text-2xl mb-6 text-blue-400">For Creators</h3>
            <ul className="space-y-4">
              <li className="border-b border-zinc-800 pb-4">
                <p className="text-yellow-400 font-bold mb-1">🥇 Grand Prize</p>
                <ul className="text-zinc-400 text-sm space-y-1">
                  <li>$10,000 cash</li>
                  <li>2 red carpet tickets + flight &amp; hotel to Hollywood premiere</li>
                  <li>Multiple high-value brand prizes</li>
                  <li>Trailer becomes The Official Movie Trailer with ongoing monetization</li>
                </ul>
              </li>
              <li className="border-b border-zinc-800 pb-4">
                <p className="text-zinc-300 font-bold mb-1">🥈 Runners-Up (100)</p>
                <p className="text-zinc-400 text-sm">High-value brand prizes and luxury experiences</p>
              </li>
              <li>
                <p className="text-zinc-300 font-bold mb-1">⚡ Top Performer</p>
                <p className="text-zinc-400 text-sm">Special rewards for most engagement in a single week</p>
              </li>
            </ul>
          </div>

          {/* Influencers */}
          <div className="bg-gray-900/50 border border-purple-500/30 rounded-3xl p-10 hover:border-purple-500/50 hover:shadow-2xl transition-all duration-300">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="font-serif font-bold text-2xl mb-6 text-purple-400">For Influencers</h3>
            <ul className="space-y-4">
              <li className="border-b border-zinc-800 pb-4">
                <p className="text-yellow-400 font-bold mb-1">🥇 Grand Prize</p>
                <ul className="text-zinc-400 text-sm space-y-1">
                  <li>$10,000 cash</li>
                  <li>2 red carpet tickets + flight &amp; hotel to Hollywood premiere</li>
                  <li>Multiple high-value brand prizes</li>
                </ul>
              </li>
              <li className="border-b border-zinc-800 pb-4">
                <p className="text-zinc-300 font-bold mb-1">🥈 Runners-Up (100)</p>
                <p className="text-zinc-400 text-sm">High-value brand prizes and luxury experiences</p>
              </li>
              <li>
                <p className="text-zinc-300 font-bold mb-1">⚡ Top Performer</p>
                <p className="text-zinc-400 text-sm">Special rewards for most engagement in a single week</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ FOUR ROLES ═══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800">
        <h2 className="font-serif font-bold text-4xl md:text-5xl text-center mb-4">Four Roles. One Ecosystem.</h2>
        <p className="text-zinc-400 text-center mb-14 max-w-xl mx-auto text-lg">
          Every participant has a defined role with aligned incentives. No one is just a spectator.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES.map((role) => (
            <div key={role.title} className={`rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${role.color}`}>
              <div className="text-5xl mb-5">{role.icon}</div>
              <h3 className="font-serif font-semibold text-xl mb-4">{role.title}</h3>
              <ul className="space-y-2">
                {role.items.map((item) => (
                  <li key={item} className="text-zinc-400 text-sm flex items-start gap-2">
                    <span className="text-zinc-600 mt-0.5 shrink-0">•</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CREATORS + INFLUENCERS SECTIONS ══════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Creators */}
          <div className="text-center md:text-left">
            <div className="text-5xl mb-5">🎬</div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mb-4">Creators</h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Film makers, music artists, videographers, and editors: submit your best work to our monthly
              contests. Earn cash prizes, brand sponsorships, and official credits — while keeping full
              creative ownership of your content.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link href="/rules-creatives" className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-0.5 tracking-wide uppercase text-sm">
                Official Rules for Creators
              </Link>
              <Link href="/sign-up" className="border-2 border-white/50 text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-0.5 tracking-wide uppercase text-sm">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Influencers */}
          <div className="text-center md:text-left">
            <div className="text-5xl mb-5">📱</div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mb-4">Influencers</h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Turn your existing audience into guaranteed income. Share one pre-made trailer per day
              across 3 platforms for 30 days and earn your guaranteed payout — from $1,650 (25k followers)
              up to $25,000 (500k+ followers).
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link href="/rules-influencers" className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-0.5 tracking-wide uppercase text-sm">
                Official Rules for Influencers
              </Link>
              <Link href="/sign-up" className="border-2 border-white/50 text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-0.5 tracking-wide uppercase text-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THE NUMBERS ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800">
        <h2 className="font-serif font-bold text-4xl md:text-5xl text-center mb-4">1 Contest Cycle = 500,000+ New Members</h2>
        <p className="text-zinc-400 text-center mb-14 max-w-xl mx-auto text-lg">The math behind viral growth through aligned incentives:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STATS.map((stat) => (
            <div key={stat.value} className="bg-gray-900/50 border border-gray-800 rounded-3xl p-10 hover:shadow-2xl transition-shadow text-center">
              <div className="font-black text-5xl text-white mb-3">{stat.value}</div>
              <div className="text-zinc-400 text-sm leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINANCIAL INCENTIVES / AFFILIATE PLAN ════════════════════════════ */}
      <section className="bg-gradient-to-r from-yellow-500/15 via-transparent to-yellow-500/10 border-y border-yellow-500/20 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif font-bold text-4xl md:text-5xl mb-4">Financial Incentives</h2>
            <p className="text-zinc-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Guaranteed payouts for influencers who meet the threshold. Post once per day to all 3 platforms
              for 30 days with 5%+ engagement. If commissions fall short, we cover the difference.
            </p>
          </div>

          {/* Payout grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-12">
            {PAYOUTS.map((row) => (
              <div key={row.range} className="bg-gray-900/60 border border-yellow-500/20 rounded-2xl p-4 text-center hover:border-yellow-500/40 transition-colors">
                <div className="text-yellow-400 font-black text-lg">{row.amount}</div>
                <div className="text-zinc-500 text-xs mt-1">{row.range} followers</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/affiliate-compensation-plan" className="bg-yellow-400 text-black font-bold px-10 py-4 rounded-full hover:bg-yellow-300 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_40px_rgba(250,204,21,0.35)] tracking-widest uppercase text-sm">
              Full Compensation Plan
            </Link>
            <Link href="/sign-up" className="border-2 border-yellow-400/60 text-yellow-400 font-bold px-10 py-4 rounded-full hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:-translate-y-1 tracking-widest uppercase text-sm">
              Start Earning
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h2 className="font-serif font-bold text-4xl md:text-6xl mb-6">Ready to Collaborate?</h2>
        <p className="text-zinc-400 text-xl mb-12 max-w-lg mx-auto leading-relaxed">
          Whether you create, promote, sponsor, or discover — there is a role for you in Collab World.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/sign-up" className="bg-white text-black font-bold px-12 py-5 rounded-full text-lg hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_50px_rgba(255,255,255,0.3)] tracking-widest uppercase">
            Join Free
          </Link>
          <Link href="/contests" className="border-2 border-zinc-600 text-white font-bold px-12 py-5 rounded-full text-lg hover:border-white transition-all duration-300 hover:-translate-y-1 tracking-widest uppercase">
            Browse Contests
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-zinc-800 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <Image src="/logo.png" alt="Collab World" width={100} height={40} className="h-10 w-auto opacity-70" />
            <nav className="flex flex-wrap gap-6 text-zinc-500 text-sm">
              <Link href="/contests" className="hover:text-white transition-colors">Contests</Link>
              <Link href="/rules-creatives" className="hover:text-white transition-colors">Creator Rules</Link>
              <Link href="/rules-influencers" className="hover:text-white transition-colors">Influencer Rules</Link>
              <Link href="/affiliate-compensation-plan" className="hover:text-white transition-colors">Affiliate Plan</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            </nav>
          </div>
          <div className="border-t border-zinc-800 pt-6 text-center text-zinc-600 text-sm">
            &copy; 2026 Collab World. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
