'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useUser, UserButton } from '@clerk/nextjs'
import { useState } from 'react'

export default function Navbar() {
  const { isSignedIn } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Collab World"
            width={120}
            height={48}
            className="h-12 w-auto md:h-14"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/feed" className="text-zinc-400 hover:text-white text-sm transition-colors">
            Videos
          </Link>
          <Link href="/contests" className="text-zinc-400 hover:text-white text-sm transition-colors">
            Contests
          </Link>
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm transition-colors">
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  variables: {
                    colorBackground: '#18181b',
                    colorText: '#ffffff',
                  },
                }}
              />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-zinc-400 hover:text-white text-sm transition-colors">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full hover:bg-zinc-100 transition-all duration-300 hover:-translate-y-0.5 glow-white"
              >
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden max-w-7xl mx-auto pt-4 pb-3 flex flex-col gap-3 border-t border-zinc-800 mt-3">
          <Link
            href="/contests"
            className="text-zinc-400 hover:text-white text-sm transition-colors py-1"
            onClick={() => setMenuOpen(false)}
          >
            Contests
          </Link>
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-zinc-400 hover:text-white text-sm transition-colors py-1"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <div className="py-1">
                <UserButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-zinc-400 hover:text-white text-sm transition-colors py-1"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full hover:bg-zinc-100 transition-colors text-center"
                onClick={() => setMenuOpen(false)}
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
