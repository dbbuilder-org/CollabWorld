import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import Link from 'next/link'
import { Suspense } from 'react'

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/contests', label: 'Contests' },
  { href: '/admin/entries', label: 'Entries' },
  { href: '/admin/analytics', label: 'Analytics' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, sessionClaims } = auth()
  if (!userId) redirect('/sign-in')

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) redirect('/')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-zinc-950 border-r border-zinc-800 flex flex-col p-4">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Admin</p>
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Suspense fallback={<div className="text-zinc-400 text-sm">Loading...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  )
}
