import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-30"></div>

      <div className="text-center relative z-10">
        <div className="text-8xl mb-4">🕌</div>
        <h1 className="text-7xl font-bold text-gold-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-100 mb-2">Page Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-px bg-amber-400"></div>
          <div className="w-2 h-2 bg-amber-400 rotate-45"></div>
          <div className="w-16 h-px bg-amber-400"></div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            to="/marketplace"
            className="bg-gold-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-600 transition shadow-md"
          >
            Go to Marketplace
          </Link>
          <Link
            to="/login"
            className="border border-slate-600 text-slate-200 px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
