import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl mb-4">😕</div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/marketplace"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Go to Marketplace
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
