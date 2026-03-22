import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getRoleFromMetadata, getDashboardPath } from '@/lib/auth'

export default async function DashboardRedirectPage() {
  const { userId } = auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()
  const role = getRoleFromMetadata(user?.publicMetadata ?? null)

  if (!role) {
    redirect('/onboarding')
  }

  redirect(getDashboardPath(role))
}
