import Link from 'next/link'

const roles = [
  {
    icon: '\u{1F3AC}',
    title: 'Creators',
    description: [
      'Submit films, music, or music videos to contests',
      'Earn prize money and revenue share',
      'Get discovered by brands and millions of fans',
    ],
  },
  {
    icon: '\u{1F4F1}',
    title: 'Influencers',
    description: [
      'Receive contest assignments and tracking links',
      'Post daily and earn affiliate commissions',
      'Build your verified talent portfolio',
    ],
  },
  {
    icon: '\u{1F3E2}',
    title: 'Brands',
    description: [
      'Sponsor contests tied to your product campaigns',
      'Reach 500K+ engaged entertainment fans',
      'Fund prizes in exchange for authentic content',
    ],
  },
  {
    icon: '\u{1F3B5}',
    title: 'Fans',
    description: [
      'Discover emerging music and film talent',
      'Vote for your favorites and shape the outcome',
      'Win rewards for engagement and referrals',
    ],
  },
]

const contestSteps = [
  {
    step: '01',
    title: 'Brand Sponsors a Contest',
    desc: 'A brand funds a prize pool tied to a film or music contest theme.',
  },
  {
    step: '02',
    title: 'Creators Submit Entries',
    desc: 'Creators upload their films, music videos, or trailers for review.',
  },
  {
    step: '03',
    title: 'Influencers Drive Traffic',
    desc: '5,000 influencers post daily with tracking links to their audiences.',
  },
  {
    step: '04',
    title: 'Fans Vote and Engage',
    desc: 'Fans vote, share, and comment — generating 25M+ organic impressions.',
  },
  {
    step: '05',
    title: 'Winners and Revenue Split',
    desc: 'Prize money distributed to top creators. Influencers earn commissions.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <span className="text-xl font-bold tracking-tight">Collab World</span>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Join
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center rounded-full bg-zinc-800 px-4 py-2 text-xs text-zinc-400 mb-8">
          Phase 1 Contest Engine &mdash; Launching Soon
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-none">
          The Collaboration Economy
          <br />
          <span className="text-zinc-400">for Film &amp; Music</span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          Collab World solves the cold-start problem for independent creators by connecting
          them with influencers, brands, and fans in a single revenue-sharing ecosystem.
        </p>
        <p className="text-base text-zinc-500 max-w-xl mx-auto mb-12">
          One contest cycle can generate 500,000+ new members and 25M+ organic impressions
          &mdash; entirely driven by aligned incentives.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/sign-up"
            className="bg-white text-black font-semibold px-8 py-4 rounded-xl text-base hover:bg-zinc-100 transition-colors"
          >
            Join as Creator
          </Link>
          <Link
            href="/sign-up"
            className="bg-zinc-800 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Join as Influencer
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-800">
        <h2 className="text-3xl font-bold text-center mb-4">Four Roles. One Ecosystem.</h2>
        <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
          Every participant has a defined role with aligned incentives. No one is just a spectator.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <div
              key={role.title}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-colors"
            >
              <div className="text-4xl mb-4">{role.icon}</div>
              <h3 className="text-lg font-bold mb-3">{role.title}</h3>
              <ul className="space-y-2">
                {role.description.map((item) => (
                  <li key={item} className="text-zinc-400 text-sm flex items-start gap-2">
                    <span className="text-zinc-600 mt-0.5 shrink-0">&bull;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* The Numbers */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-800">
        <h2 className="text-3xl font-bold text-center mb-4">
          1 Contest Cycle = 500,000+ New Members
        </h2>
        <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
          The math behind viral growth through aligned incentives:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-4xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="text-4xl font-black text-white mb-2">5,000</div>
            <div className="text-zinc-400 text-sm">Influencers assigned per contest</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="text-4xl font-black text-white mb-2">25M+</div>
            <div className="text-zinc-400 text-sm">
              Organic impressions (5k avg followers &times; 5k influencers)
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="text-4xl font-black text-white mb-2">250K+</div>
            <div className="text-zinc-400 text-sm">New members at 1% conversion</div>
          </div>
        </div>
        <p className="text-zinc-500 text-center text-sm mt-8 max-w-2xl mx-auto">
          Each influencer averages 5,000 engaged followers. At 5,000 influencers and 1% conversion,
          one contest brings 250,000+ new fans &mdash; compounding with each cycle.
        </p>
      </section>

      {/* Contest Model */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-800">
        <h2 className="text-3xl font-bold text-center mb-4">How the Contest Engine Works</h2>
        <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
          A repeatable five-step flywheel that generates revenue, content, and community simultaneously.
        </p>
        <div className="space-y-4 max-w-3xl mx-auto">
          {contestSteps.map((step) => (
            <div
              key={step.step}
              className="flex gap-6 items-start bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-colors"
            >
              <div className="text-3xl font-black text-zinc-700 shrink-0 w-10">
                {step.step}
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{step.title}</h3>
                <p className="text-zinc-400 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-zinc-800 text-center">
        <h2 className="text-4xl font-black mb-4">Ready to Join?</h2>
        <p className="text-zinc-400 text-lg mb-10 max-w-lg mx-auto">
          Whether you create, promote, sponsor, or discover &mdash; there is a role for you in Collab World.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/sign-up"
            className="bg-white text-black font-semibold px-8 py-4 rounded-xl text-base hover:bg-zinc-100 transition-colors"
          >
            Join as Creator
          </Link>
          <Link
            href="/sign-up"
            className="bg-zinc-800 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Join as Fan
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-zinc-600 text-sm">
        <p>&copy; 2026 Collab World. All rights reserved.</p>
      </footer>
    </main>
  )
}
