'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const GENRES = ['Film', 'Music', 'Music Video']

const schema = z.object({
  genre: z.array(z.string()).min(1, 'Select at least one genre'),
  bio: z.string().max(500).optional(),
  portfolioUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  imdbUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  spotifyUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function CreatorProfileForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { genre: [] },
  })

  const selectedGenres = watch('genre')

  function toggleGenre(genre: string) {
    const current = selectedGenres ?? []
    const updated = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre]
    setValue('genre', updated)
  }

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/v1/users/me/profile', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        genre: data.genre,
        bio: data.bio || null,
        portfolioUrl: data.portfolioUrl || null,
        imdbUrl: data.imdbUrl || null,
        spotifyUrl: data.spotifyUrl || null,
      }),
    })

    if (res.ok) {
      router.push('/dashboard/creator')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Genre <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedGenres?.includes(genre)
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        {errors.genre && (
          <p className="text-red-400 text-xs mt-2">{errors.genre.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
        <textarea
          {...register('bio')}
          rows={4}
          placeholder="Tell us about yourself and your work..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        />
        {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Portfolio URL</label>
        <input
          {...register('portfolioUrl')}
          type="url"
          placeholder="https://yourportfolio.com"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        />
        {errors.portfolioUrl && (
          <p className="text-red-400 text-xs mt-1">{errors.portfolioUrl.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">IMDB URL</label>
        <input
          {...register('imdbUrl')}
          type="url"
          placeholder="https://imdb.com/name/..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        />
        {errors.imdbUrl && (
          <p className="text-red-400 text-xs mt-1">{errors.imdbUrl.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Spotify URL</label>
        <input
          {...register('spotifyUrl')}
          type="url"
          placeholder="https://open.spotify.com/artist/..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        />
        {errors.spotifyUrl && (
          <p className="text-red-400 text-xs mt-1">{errors.spotifyUrl.message}</p>
        )}
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
