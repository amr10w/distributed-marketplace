const SkeletonCard = () => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="w-full h-48 animate-shimmer"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-slate-700 rounded animate-pulse-slow w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded animate-pulse-slow w-1/2"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-slate-700 rounded animate-pulse-slow w-1/3"></div>
          <div className="h-5 bg-slate-700 rounded-full animate-pulse-slow w-1/4"></div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
          <div className="w-6 h-6 bg-slate-700 rounded-full animate-pulse-slow"></div>
          <div className="h-3 bg-slate-700 rounded animate-pulse-slow w-1/3"></div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonCard
