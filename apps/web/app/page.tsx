import Image from 'next/image'
import Link from 'next/link'

const roles = [
  {
    icon: '🎬',
    title: 'Creators',
    color: 'blue',
    description: [
      'Submit films, music videos, or trailers to contests',
      'Earn prize money and revenue share',
      'Get discovered by brands and millions of fans',
    ],
  },
  {
    icon: '📱',
    title: 'Influencers',
    color: 'purple',
    description: [
      'Receive contest assignments and tracking links',
      'Post daily and earn affiliate commissions',
      'Build your verified talent portfolio',
    ],
  },
  {
    icon: '🏢',
    title: 'Brands',
    color: 'yellow',
    description: [
      'Sponsor contests tied to your product campaigns',
      'Reach 500K+ engaged entertainment fans',
      'Fund prizes in exchange for authentic content',
    ],
  },
  {
    icon: '🎵',
    title: 'Fans',
    color: 'pink',
    description: [
      'Discover emerging music and film talent',
      'Vote for your favorites and shape the outcome',
      'Win rewards for engagement and referrals',
    ],
  },
]

const roleColors: Record<string, string> = {
  blue:   'border-blue-500/30 bg-blue-500/10 hover:border-blue-500/50',
  purple: 'border-purple-500/30 bg-purple-500/10 hover:border-purple-500/50',
  yellow: 'border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-500/50',
  pink:   'border-pink-500/30 bg-pink-500/10 hover:border-pink-500/50',
}

const contestSteps = [
  {
    step: '01',
    title: 'Brand Sponsors a Contest',
    desc: 'A brand funds a prize pool tied to a film or music contest theme.',
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    step: '02',
    title: 'Creators Submit Entries',
    desc: 'Creators upload their films, music videos, or trailers for review.',
    color: 'bg-purple-500/20 text-purple-400',
  },
  {
    step: '03',
    title: 'Influencers Drive Traffic',
    desc: '5,000 influencers post daily with tracking links to their audiences.',
    color: 'bg-pink-500/20 text-pink-400',
  },
  {
    step: '04',
    title: 'Fans Vote and Engage',
    desc: 'Fans vote, share, and comment — generating 25M+ organic impressions.',
    color: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    step: '05',
    title: 'Winners and Revenue Split',
    desc: 'Prize money distributed to top creators. Influencers earn commissions.',
    color: 'bg-green-500/20 text-green-400',
  },
]

const stats = [
  { value: '5,000', label: 'Influencers assigned per contest' },
  { value: '25M+', label: 'Organic impressions per cycle' },
  { value: '250K+', label: 'New members at 1% conversion' },
]

// Placeholder brand logos (text names until real logos are provided)
const brandNames = [
  'NIKE', 'SONY', 'NETFLIX', 'AMAZON', 'SPOTIFY', 'APPLE',
  'SAMSUNG', 'DISNEY', 'HBO', 'UNIVERSAL', 'PARAMOUNT', 'WB',
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Collab World"
              width={120}
              height={48}
              className="h-12 w-auto md:h-14"
              priority
            />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/contests" className="hidden md:block text-zinc-400 hover:text-white text-sm transition-colors">
              Contests
            </Link>
            <Link href="/sign-in" className="hidden md:block text-zinc-400 hover:text-white text-sm transition-colors">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_30px_rgba(255,255,255,0.25)]"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-24">
        {/* Background image */}
        <Image
          src="/hero-bg.jpg"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-blue-500/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="Collab World"
            width={160}
            height={64}
            className="h-16 md:h-24 w-auto mb-8 animate-[fade-in_1s_ease_forwards]"
            priority
          />

          <h1 className="font-serif font-bold text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight mb-6 max-w-4xl">
            The Viral Trailer &amp;
            <br />
            <span className="italic">Music Video Contests</span>
          </h1>

          <p className="text-xl sm:text-2xl text-yellow-400 font-semibold mb-4 tracking-wide">
            Earn Revenue with Brands!
          </p>

          <p className="text-zinc-300 text-lg max-w-2xl mb-12 leading-relaxed">
            Collab World connects creators, influencers, brands, and fans in a single
            revenue-sharing ecosystem. One contest cycle generates 500,000+ new members
            and 25M+ organic impressions.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-white text-black font-bold px-10 py-4 rounded-full text-base hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_40px_rgba(255,255,255,0.3)] tracking-wide uppercase"
            >
              Join as Creator
            </Link>
            <Link
              href="/sign-up"
              className="border-2 border-white/60 bg-transparent text-white font-bold px-10 py-4 rounded-full text-base hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-1 tracking-wide uppercase"
            >
              Join as Influencer
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Brand Marquee ─── */}
      <div className="border-y border-zinc-800 py-6 overflow-hidden bg-zinc-950">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...brandNames, ...brandNames].map((name, i) => (
            <span
              key={i}
              className="mx-10 text-zinc-600 font-bold text-sm tracking-[0.2em] uppercase"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Four Roles ─── */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800">
        <h2 className="font-serif font-bold text-4xl md:text-5xl text-center mb-4">
          Four Roles. One Ecosystem.
        </h2>
        <p className="text-zinc-400 text-center mb-14 max-w-xl mx-auto text-lg">
          Every participant has a defined role with aligned incentives. No one is just a spectator.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <div
              key={role.title}
              className={`rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${roleColors[role.color]}`}
            >
              <div className="text-5xl mb-5">{role.icon}</div>
              <h3 className="font-serif font-semibold text-xl mb-4">{role.title}</h3>
              <ul className="space-y-2">
                {role.description.map((item) => (
                  <li key={item} className="text-zinc-400 text-sm flex items-start gap-2">
                    <span className="text-zinc-600 mt-0.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ─── The Numbers ─── */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800">
        <h2 className="font-serif font-bold text-4xl md:text-5xl text-center mb-4">
          1 Contest Cycle = 500,000+ New Members
        </h2>
        <p className="text-zinc-400 text-center mb-14 max-w-xl mx-auto text-lg">
          The math behind viral growth through aligned incentives:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="bg-gray-900/50 border border-gray-800 rounded-3xl p-10 hover:shadow-2xl transition-shadow"
            >
              <div className="font-black text-5xl text-white mb-3">{stat.value}</div>
              <div className="text-zinc-400 text-sm leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-zinc-800">
        <h2 className="font-serif font-bold text-4xl md:text-5xl text-center mb-4">
          How the Contest Engine Works
        </h2>
        <p className="text-zinc-400 text-center mb-14 max-w-xl mx-auto text-lg">
          A repeatable five-step flywheel that generates revenue, content, and community simultaneously.
        </p>
        <div className="space-y-4 max-w-3xl mx-auto">
          {contestSteps.map((step) => (
            <div
              key={step.step}
              className="flex gap-6 items-start bg-gray-900/40 border border-gray-800 rounded-3xl p-8 hover:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div className={`rounded-2xl w-12 h-12 flex items-center justify-center shrink-0 font-black text-sm ${step.color}`}>
                {step.step}
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">{step.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Financial Incentives ─── */}
      <section className="bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/10 border-y border-yellow-500/20 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif font-bold text-4xl md:text-5xl mb-6">
            Real Revenue. Real Payouts.
          </h2>
          <p className="text-zinc-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Influencers earn based on their tier — from $1,650 for Nano (25k followers)
            up to $25,000 for Mega influencers (500k+). Guaranteed payouts when you hit the threshold.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-yellow-400 text-black font-bold px-10 py-4 rounded-full text-base hover:bg-yellow-300 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_40px_rgba(250,204,21,0.35)] tracking-wide uppercase"
            >
              Start Earning
            </Link>
            <Link
              href="/contests"
              className="border-2 border-yellow-400/60 text-yellow-400 font-bold px-10 py-4 rounded-full text-base hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:-translate-y-1 tracking-wide uppercase"
            >
              View Contests
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h2 className="font-serif font-bold text-4xl md:text-6xl mb-6">Ready to Join?</h2>
        <p className="text-zinc-400 text-xl mb-12 max-w-lg mx-auto leading-relaxed">
          Whether you create, promote, sponsor, or discover — there is a role for you in Collab World.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/sign-up"
            className="bg-white text-black font-bold px-12 py-5 rounded-full text-lg hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-1 shadow-[0_0_50px_rgba(255,255,255,0.3)] tracking-wide uppercase"
          >
            Join as Creator
          </Link>
          <Link
            href="/sign-up"
            className="border-2 border-zinc-600 text-white font-bold px-12 py-5 rounded-full text-lg hover:border-white transition-all duration-300 hover:-translate-y-1 tracking-wide uppercase"
          >
            Join as Fan
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-zinc-800 px-6 py-10 text-center">
        <Image
          src="/logo.png"
          alt="Collab World"
          width={80}
          height={32}
          className="h-8 w-auto mx-auto mb-4 opacity-60"
        />
        <div className="flex flex-wrap gap-6 justify-center text-zinc-500 text-sm mb-4">
          <Link href="/contests" className="hover:text-white transition-colors">Contests</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/sign-up" className="hover:text-white transition-colors">Sign Up</Link>
        </div>
        <p className="text-zinc-600 text-sm">&copy; 2026 Collab World. All rights reserved.</p>
      </footer>
    </main>
  )
}
