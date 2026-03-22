'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AccountType } from '@collabworld/types'

interface RoleOption {
  role: Exclude<AccountType, 'admin'>
  icon: string
  title: string
  description: string
}

const ROLES: RoleOption[] = [
  {
    role: 'fan',
    icon: '\u2764\uFE0F',
    title: 'Fan',
    description: 'Discover and support emerging film and music talent. Vote in contests and earn rewards for engagement.',
  },
  {
    role: 'creator',
    icon: '\u{1F3AC}',
    title: 'Creator',
    description: 'Submit your films, music, or music videos to contests. Earn prizes and get discovered by millions.',
  },
  {
    role: 'influencer',
    icon: '\u{1F4F1}',
    title: 'Influencer',
    description: 'Receive contest assignments, post daily, and earn affiliate commissions on every conversion.',
  },
  {
    role: 'brand',
    icon: '\u{1F3E2}',
    title: 'Brand',
    description: 'Sponsor contests, reach engaged entertainment audiences, and fund campaigns with authentic creators.',
  },
]

interface RolePickerProps {
  onSelect?: (role: AccountType) => void
}

export default function RolePicker({ onSelect }: RolePickerProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<AccountType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSelect(role: AccountType) {
    setSelected(role)
    setLoading(true)
    setError(null)

    if (onSelect) {
      onSelect(role)
      return
    }

    try {
      const res = await fetch('/api/v1/users/me/role', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to set role')
        setLoading(false)
        return
      }

      router.push('/onboarding/profile')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROLES.map((option) => (
          <button
            key={option.role}
            onClick={() => { void handleSelect(option.role) }}
            disabled={loading}
            data-testid={`role-card-${option.role}`}
            className={`
              text-left bg-zinc-900 border rounded-2xl p-6 transition-all
              hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20
              disabled:opacity-50 disabled:cursor-not-allowed
              ${selected === option.role
                ? 'border-white ring-2 ring-white/20'
                : 'border-zinc-800'
              }
            `}
          >
            <div className="text-3xl mb-3">{option.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{option.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{option.description}</p>
            <div className="mt-4">
              <span
                className={`
                  inline-block text-sm font-medium px-4 py-2 rounded-lg transition-colors
                  ${selected === option.role
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-300'
                  }
                `}
              >
                {loading && selected === option.role ? 'Setting up...' : `Join as ${option.title}`}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
