import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getRoleFromMetadata } from '@/lib/auth'
import RolePicker from '@/components/onboarding/RolePicker'

export default async function OnboardingPage() {
  const { userId } = auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  const role = getRoleFromMetadata(user?.publicMetadata ?? null)

  if (role) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-3">Welcome to Collab World</h1>
          <p className="text-zinc-400 text-lg">
            Choose your role to get started. You can always update your profile later.
          </p>
        </div>
        <RolePicker />
      </div>
    </main>
  )
}
