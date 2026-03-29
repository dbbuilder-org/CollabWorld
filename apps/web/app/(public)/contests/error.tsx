'use client'

export default function ContestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="font-serif font-bold text-2xl text-white mb-3">Something went wrong</h2>
        <p className="text-zinc-400 text-sm mb-6">
          {error.message || 'Failed to load contests. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-all uppercase tracking-widest text-sm"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
