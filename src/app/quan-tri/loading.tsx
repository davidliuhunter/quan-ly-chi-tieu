// Server component loading - pure CSS skeleton, no framer-motion
export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 3 summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-glass !p-5 space-y-3">
            <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-7 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-2 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="card-glass !p-5 space-y-4">
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="card-glass !p-5 space-y-3">
        <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-2 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
