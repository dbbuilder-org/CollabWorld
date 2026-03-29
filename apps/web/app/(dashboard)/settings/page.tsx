import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@collabworld/db'
import ProfileSettingsClient from './ProfileSettingsClient'
import BillingSection from './BillingSection'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings — Collab World',
}

export default async function SettingsPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    db.user.findUnique({
      where: { clerkId: userId },
      select: { displayName: true, bio: true, avatarUrl: true, subscriptionPlan: true, stripeCustomerId: true },
    }),
  ])

  if (!dbUser || !clerkUser) redirect('/sign-in')

  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? ''

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black text-white mb-1">Settings</h1>
        <p className="text-zinc-400 text-sm">Manage your profile and account preferences.</p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
        <h2 className="font-serif font-bold text-xl text-white mb-6">Profile</h2>
        <ProfileSettingsClient
          displayName={dbUser.displayName}
          bio={dbUser.bio}
          avatarUrl={dbUser.avatarUrl}
          email={email}
        />
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
        <h2 className="font-serif font-bold text-xl text-white mb-6">Subscription</h2>
        <BillingSection
          plan={dbUser.subscriptionPlan === 'premium' ? 'premium' : 'free'}
          hasStripeCustomer={!!dbUser.stripeCustomerId}
        />
      </div>
    </div>
  )
}
