'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const schema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100),
  bio: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

export default function FanProfileForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/v1/users/me/profile', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName: data.displayName, bio: data.bio || null }),
    })

    if (res.ok) {
      router.push('/dashboard/fan')
    }
  }

  const inputClass =
    'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('displayName')}
          placeholder="Your name"
          className={inputClass}
        />
        {errors.displayName && (
          <p className="text-red-400 text-xs mt-1">{errors.displayName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Bio <span className="text-zinc-500 font-normal">(optional)</span>
        </label>
        <textarea
          {...register('bio')}
          rows={3}
          placeholder="Tell us a little about yourself..."
          className={inputClass}
        />
        {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Go to Dashboard'}
      </button>
    </form>
  )
}
