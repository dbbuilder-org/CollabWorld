import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/contests', label: 'Contests' },
  { href: '/admin/entries', label: 'Entries' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/audit-log', label: 'Audit Log' },
] as const

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const role = getRoleFromMetadata(user?.publicMetadata ?? null)

  if (!isAdmin(role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Admin sidebar */}
      <aside className="w-56 shrink-0 border-r border-zinc-800 flex flex-col">
        <div className="px-6 py-5 border-b border-zinc-800">
          <div className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Admin
          </div>
          <div className="text-lg font-bold text-white mt-0.5">Collab World</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-zinc-800">
          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
