import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-zinc-400 text-sm mt-2">Join the Collab World ecosystem</p>
        </div>
        <SignUp
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
