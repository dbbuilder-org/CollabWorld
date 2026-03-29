'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Props {
  displayName: string
  bio: string | null
  avatarUrl: string | null
  email: string
}

export default function ProfileSettingsClient({ displayName: init, bio: initBio, avatarUrl, email }: Props) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(init)
  const [bio, setBio] = useState(initBio ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const res = await fetch('/api/v1/users/me', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName: displayName.trim(), bio: bio.trim() || null }),
    })

    if (res.ok) {
      setSaved(true)
      router.refresh()
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? 'Failed to save')
    }
    setSaving(false)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar must be under 5MB')
      return
    }
    setAvatarUploading(true)
    setError(null)
    const fd = new FormData()
    fd.append('avatar', file)
    const res = await fetch('/api/v1/account/avatar', { method: 'POST', body: fd })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json() as { error?: string }
      setError(data.error ?? 'Avatar upload failed')
    }
    setAvatarUploading(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-lg">
      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">Profile Photo</label>
        <div className="flex items-center gap-5">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={80}
              height={80}
              className="rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-2xl font-bold shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <label className="cursor-pointer inline-block">
              <span className={`text-sm font-medium px-5 py-2 rounded-full border border-gray-700 text-zinc-300 hover:text-white hover:border-gray-500 transition-colors ${avatarUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {avatarUploading ? 'Uploading…' : 'Change Photo'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={avatarUploading}
                onChange={handleAvatarChange}
              />
            </label>
            <p className="text-xs text-zinc-600 mt-1.5">JPG, PNG, WebP — max 5MB</p>
          </div>
        </div>
      </div>

      {/* Email (read-only, managed by Clerk) */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl px-4 py-3 text-zinc-500 text-sm cursor-not-allowed"
        />
        <p className="text-xs text-zinc-600 mt-1">Email is managed by your account provider.</p>
      </div>

      {/* Display name */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={100}
          required
          className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 transition-colors"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Tell the community about yourself…"
          className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-yellow-500/50 transition-colors resize-none"
        />
        <p className="text-xs text-zinc-600 mt-1 text-right">{bio.length}/500</p>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-yellow-400 text-black font-bold px-8 py-3 rounded-full hover:bg-yellow-300 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
      >
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
      </button>
    </form>
  )
}
