const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-700 rounded animate-pulse-slow flex-1"></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="px-6 py-4 flex gap-6 border-b border-slate-700 last:border-0"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={
                'h-4 bg-slate-700 rounded animate-pulse-slow flex-1 ' +
                (colIndex === 0 ? 'w-2/3' : '')
              }
            ></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default SkeletonTable
