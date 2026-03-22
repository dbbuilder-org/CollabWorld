'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const schema = z.object({
  instagram: z.string().max(100).optional(),
  tiktok: z.string().max(100).optional(),
  youtube: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  totalFollowers: z.string().optional(),
  engagementRate: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function InfluencerProfileForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const handles: Record<string, string> = {}
    if (data.instagram) handles['instagram'] = data.instagram
    if (data.tiktok) handles['tiktok'] = data.tiktok
    if (data.youtube) handles['youtube'] = data.youtube
    if (data.twitter) handles['twitter'] = data.twitter

    const res = await fetch('/api/v1/users/me/profile', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        platformHandles: handles,
        totalFollowers: data.totalFollowers ? parseInt(data.totalFollowers, 10) : undefined,
        engagementRate: data.engagementRate ? parseFloat(data.engagementRate) : undefined,
      }),
    })

    if (res.ok) {
      router.push('/dashboard/influencer')
    }
  }

  const inputClass =
    'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-4">Platform Handles</h3>
        <div className="space-y-3">
          {[
            { name: 'instagram' as const, placeholder: '@yourhandle' },
            { name: 'tiktok' as const, placeholder: '@yourhandle' },
            { name: 'youtube' as const, placeholder: '@yourchannel' },
            { name: 'twitter' as const, placeholder: '@yourhandle' },
          ].map(({ name, placeholder }) => (
            <div key={name} className="flex items-center gap-3">
              <span className="text-zinc-500 text-sm w-20 capitalize shrink-0">{name}</span>
              <input
                {...register(name)}
                placeholder={placeholder}
                className={inputClass}
              />
              {errors[name] && (
                <p className="text-red-400 text-xs">{errors[name]?.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Total Followers
          </label>
          <input
            {...register('totalFollowers')}
            type="number"
            min={0}
            placeholder="50000"
            className={inputClass}
          />
          {errors.totalFollowers && (
            <p className="text-red-400 text-xs mt-1">{errors.totalFollowers.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Engagement Rate (%)
          </label>
          <input
            {...register('engagementRate')}
            type="number"
            step="0.1"
            min={0}
            max={100}
            placeholder="4.5"
            className={inputClass}
          />
          {errors.engagementRate && (
            <p className="text-red-400 text-xs mt-1">{errors.engagementRate.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Continue to Dashboard'}
      </button>
    </form>
  )
}
