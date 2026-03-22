'use client'
import { useRouter } from 'next/navigation'

interface Props {
  children: React.ReactNode
  isPremium: boolean
  featureName: string
}

export function PremiumGate({ children, isPremium, featureName }: Props) {
  const router = useRouter()

  if (isPremium) return <>{children}</>

  return (
    <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center">
      <p className="font-semibold text-amber-800">Premium Feature</p>
      <p className="mt-1 text-sm text-amber-700">{featureName} is available on the Premium plan.</p>
      <button
        onClick={() => router.push('/pricing')}
        className="mt-3 rounded bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
      >
        Upgrade to Premium
      </button>
    </div>
  )
}
