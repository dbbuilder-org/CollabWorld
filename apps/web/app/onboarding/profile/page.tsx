import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getRoleFromMetadata } from '@/lib/auth'
import CreatorProfileForm from '@/components/onboarding/CreatorProfileForm'
import InfluencerProfileForm from '@/components/onboarding/InfluencerProfileForm'
import BrandProfileForm from '@/components/onboarding/BrandProfileForm'
import FanProfileForm from '@/components/onboarding/FanProfileForm'

export default async function ProfilePage() {
  const { userId } = auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  const role = getRoleFromMetadata(user?.publicMetadata ?? null)

  if (!role) {
    redirect('/onboarding')
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-3">Complete Your Profile</h1>
          <p className="text-zinc-400">
            Tell us a bit about yourself as a{' '}
            <span className="text-white font-semibold capitalize">{role}</span>.
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {role === 'creator' && <CreatorProfileForm />}
          {role === 'influencer' && <InfluencerProfileForm />}
          {role === 'brand' && <BrandProfileForm />}
          {role === 'fan' && <FanProfileForm />}
          {role === 'admin' && (
            <p className="text-zinc-400 text-center">Admin profile managed separately.</p>
          )}
        </div>
      </div>
    </main>
  )
}
