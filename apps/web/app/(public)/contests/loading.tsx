export default function ContestsLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-10 w-48 bg-gray-800 rounded-xl mb-2" />
        <div className="h-4 w-72 bg-gray-900 rounded-lg mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden">
              <div className="aspect-video bg-gray-800" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-gray-800 rounded-lg" />
                <div className="h-4 w-1/2 bg-gray-900 rounded" />
                <div className="h-8 w-full bg-gray-800 rounded-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
