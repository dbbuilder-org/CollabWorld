'use client'

interface LoginModalProps {
  onClose: () => void
}

export default function LoginModal({ onClose }: LoginModalProps) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl">
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Join to Like, Vote &amp; Comment
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Create a free account to engage with entries, vote for your favorites,
            and be part of the Collab World community.
          </p>

          <div className="space-y-3">
            <a
              href="/sign-up"
              className="block w-full text-center px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-100 transition-colors"
            >
              Create Free Account
            </a>
            <a
              href="/sign-in"
              className="block w-full text-center px-6 py-3 rounded-xl border border-zinc-700 text-white font-semibold hover:border-zinc-500 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
