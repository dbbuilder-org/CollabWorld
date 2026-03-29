'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BanButtonProps {
  userId: string
  isBanned: boolean
}

export default function BanButton({ userId, isBanned }: BanButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    if (loading) return
    const action = isBanned ? 'Unban' : 'Ban'
    if (!confirm(`${action} this user?`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/ban`, { method: 'PATCH' })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs font-medium transition-colors ${
        isBanned
          ? 'text-green-400 hover:text-green-300'
          : 'text-red-400 hover:text-red-300'
      } disabled:opacity-50`}
    >
      {loading ? '...' : isBanned ? 'Unban' : 'Ban'}
    </button>
  )
}
