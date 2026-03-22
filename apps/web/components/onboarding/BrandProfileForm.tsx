'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const schema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contactName: z.string().max(100).optional(),
  contactPhone: z.string().max(50).optional(),
  industry: z.string().max(100).optional(),
})

type FormData = z.infer<typeof schema>

export default function BrandProfileForm() {
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
      body: JSON.stringify({
        companyName: data.companyName,
        website: data.website || null,
        contactName: data.contactName || null,
        contactPhone: data.contactPhone || null,
        industry: data.industry || null,
      }),
    })

    if (res.ok) {
      router.push('/dashboard/brand')
    }
  }

  const inputClass =
    'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          {...register('companyName')}
          placeholder="Acme Corp"
          className={inputClass}
        />
        {errors.companyName && (
          <p className="text-red-400 text-xs mt-1">{errors.companyName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Website</label>
        <input
          {...register('website')}
          type="url"
          placeholder="https://yourcompany.com"
          className={inputClass}
        />
        {errors.website && (
          <p className="text-red-400 text-xs mt-1">{errors.website.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Contact Name</label>
          <input
            {...register('contactName')}
            placeholder="Jane Smith"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Contact Phone</label>
          <input
            {...register('contactPhone')}
            type="tel"
            placeholder="+1 555 000 0000"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Industry</label>
        <input
          {...register('industry')}
          placeholder="Entertainment, Fashion, Tech..."
          className={inputClass}
        />
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
