const SkeletonDetail = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="h-5 bg-slate-700 rounded animate-pulse-slow w-32 mb-6"></div>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="animate-shimmer min-h-[300px]"></div>
          <div className="p-8 space-y-4">
            <div className="h-4 bg-slate-700 rounded animate-pulse-slow w-1/4"></div>
            <div className="h-8 bg-slate-700 rounded animate-pulse-slow w-3/4"></div>
            <div className="h-4 bg-slate-700 rounded animate-pulse-slow w-1/2"></div>
            <div className="h-10 bg-slate-700 rounded animate-pulse-slow w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded animate-pulse-slow w-full"></div>
              <div className="h-4 bg-slate-700 rounded animate-pulse-slow w-5/6"></div>
              <div className="h-4 bg-slate-700 rounded animate-pulse-slow w-4/6"></div>
            </div>
            <div className="h-24 bg-slate-700 rounded-lg animate-pulse-slow"></div>
            <div className="h-12 bg-slate-700 rounded-lg animate-pulse-slow"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonDetail
