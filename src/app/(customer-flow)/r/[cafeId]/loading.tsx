export default function CustomerReviewLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex flex-col items-center justify-start p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 pt-6 sm:pt-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 shadow-sm" />
          <div className="h-6 w-44 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Stars Shimmer */}
        <div className="bg-white dark:bg-gray-800/60 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4">
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
          <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Tags Shimmer */}
        <div className="space-y-3 px-1">
          <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-9 w-24 rounded-full bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        </div>

        {/* Text Area Shimmer */}
        <div className="h-28 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800" />

        {/* CTA Shimmer */}
        <div className="h-14 rounded-2xl bg-gray-300 dark:bg-gray-700" />
      </div>
    </div>
  );
}

