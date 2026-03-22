import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-zinc-400 text-sm mt-2">Sign in to your Collab World account</p>
        </div>
        <SignIn
          appearance={{
            variables: {
              colorBackground: '#18181b',
              colorText: '#ffffff',
              colorPrimary: '#ffffff',
              colorInputBackground: '#27272a',
              colorInputText: '#ffffff',
            },
          }}
        />
      </div>
    </main>
  )
}
