export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-9 w-64 bg-gray-800 rounded-xl mb-2" />
        <div className="h-4 w-80 bg-gray-900 rounded-lg" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 text-center">
            <div className="h-8 w-16 bg-gray-800 rounded-lg mx-auto mb-2" />
            <div className="h-3 w-24 bg-gray-900 rounded mx-auto" />
          </div>
        ))}
      </div>
      {/* Card skeleton */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
        <div className="h-6 w-40 bg-gray-800 rounded-lg mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-800/50 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
