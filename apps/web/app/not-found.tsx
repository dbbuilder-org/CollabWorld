import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-gray-600">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="mt-4 inline-block rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Go Home
        </Link>
      </div>
    </div>
  )
}
