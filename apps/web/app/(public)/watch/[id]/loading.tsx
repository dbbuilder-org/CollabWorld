export default function WatchLoading() {
  return (
    <main className="min-h-screen bg-black text-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex gap-2 mb-6">
          <div className="h-4 w-12 bg-gray-800 rounded" />
          <div className="h-4 w-4 bg-gray-900 rounded" />
          <div className="h-4 w-32 bg-gray-800 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-6">
            {/* Video player */}
            <div className="aspect-video rounded-3xl bg-gray-900 border border-gray-800" />
            {/* Title */}
            <div>
              <div className="h-8 w-3/4 bg-gray-800 rounded-xl mb-3" />
              <div className="flex gap-3">
                <div className="h-4 w-20 bg-gray-900 rounded" />
                <div className="h-4 w-24 bg-gray-900 rounded" />
              </div>
            </div>
            {/* Engagement */}
            <div className="flex gap-3 border-t border-b border-gray-800 py-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-9 w-24 bg-gray-900 rounded-full" />
              ))}
            </div>
            {/* Creator */}
            <div className="flex gap-4 bg-gray-900/50 border border-gray-800 rounded-3xl p-5">
              <div className="w-14 h-14 rounded-full bg-gray-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 bg-gray-800 rounded" />
                <div className="h-4 w-64 bg-gray-900 rounded" />
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-4">
            <div className="h-6 w-20 bg-gray-800 rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-28 h-16 rounded-xl bg-gray-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-gray-800 rounded" />
                  <div className="h-3 w-2/3 bg-gray-900 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
