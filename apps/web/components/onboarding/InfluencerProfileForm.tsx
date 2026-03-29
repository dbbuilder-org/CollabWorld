'use client'

import { useForm, useWatch } from 'react-hook-form'
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
type InfluencerTier = 'nano' | 'micro' | 'mid_tier' | 'macro' | 'mega'

function getTierFromFollowers(followers: number): InfluencerTier {
  if (followers >= 1_000_000) return 'mega'
  if (followers >= 500_000) return 'macro'
  if (followers >= 100_000) return 'mid_tier'
  if (followers >= 10_000) return 'micro'
  return 'nano'
}

const TIER_LABELS: Record<InfluencerTier, string> = {
  nano: 'Nano (< 10K)',
  micro: 'Micro (10K – 100K)',
  mid_tier: 'Mid-Tier (100K – 500K)',
  macro: 'Macro (500K – 1M)',
  mega: 'Mega (1M+)',
}

export default function InfluencerProfileForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const followersValue = useWatch({ control, name: 'totalFollowers' })
  const followersNum = followersValue ? parseInt(followersValue, 10) : 0
  const detectedTier: InfluencerTier | null = followersNum > 0 ? getTierFromFollowers(followersNum) : null

  async function onSubmit(data: FormData) {
    const handles: Record<string, string> = {}
    if (data.instagram) handles['instagram'] = data.instagram
    if (data.tiktok) handles['tiktok'] = data.tiktok
    if (data.youtube) handles['youtube'] = data.youtube
    if (data.twitter) handles['twitter'] = data.twitter

    const totalFollowers = data.totalFollowers ? parseInt(data.totalFollowers, 10) : undefined

    const res = await fetch('/api/v1/users/me/profile', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        platformHandles: handles,
        totalFollowers,
        engagementRate: data.engagementRate ? parseFloat(data.engagementRate) : undefined,
        tier: totalFollowers ? getTierFromFollowers(totalFollowers) : undefined,
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

      {detectedTier && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-4 h-4 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div>
            <p className="text-yellow-400 text-sm font-medium">
              Tier: {TIER_LABELS[detectedTier]}
            </p>
            <p className="text-zinc-500 text-xs">Auto-detected from your follower count</p>
          </div>
        </div>
      )}

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
