const SkeletonTable = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse-slow flex-1"></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="px-6 py-4 flex gap-6 border-b border-gray-100 last:border-0"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={
                'h-4 bg-gray-200 rounded animate-pulse-slow flex-1 ' +
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
