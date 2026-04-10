const SkeletonDetail = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="h-5 bg-gray-200 rounded animate-pulse-slow w-32 mb-6"></div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="bg-gray-200 animate-pulse-slow min-h-[300px]"></div>
          <div className="p-8 space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse-slow w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse-slow w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse-slow w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse-slow w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse-slow w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse-slow w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse-slow w-4/6"></div>
            </div>
            <div className="h-24 bg-gray-200 rounded-lg animate-pulse-slow"></div>
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse-slow"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonDetail
