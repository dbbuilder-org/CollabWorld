export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Collab World
        </h1>
        <p className="text-xl text-zinc-400">
          The Collaboration Economy for Film &amp; Music
        </p>
        <p className="text-zinc-500 text-lg leading-relaxed">
          Uniting creators, influencers, brands, and fans into one
          collaborative, revenue-sharing ecosystem.
        </p>
        <div className="pt-4">
          <span className="inline-flex items-center rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-300">
            Platform launching soon — Phase 1 Contest Engine in development
          </span>
        </div>
      </div>
    </main>
  );
}
