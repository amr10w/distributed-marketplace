import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/utils'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('/marketplace/search?q=' + encodeURIComponent(searchQuery.trim()))
      setSearchQuery('')
      setShowMobileSearch(false)
    }
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-3 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/marketplace" className="text-xl lg:text-2xl font-bold text-blue-600 whitespace-nowrap">
          🛒 MarketPlace
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or brand..."
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-700"
              >
                Search
              </button>
            )}
          </div>
        </form>

        {/* Right Side */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-600"
          >
            🔍
          </button>

          {user ? (
            <>
              {/* Balance Badge */}
              <Link
                to="/account/deposit"
                className="hidden sm:flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-green-100 transition"
              >
                💰 {formatCurrency(user.balance)}
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {user.fullName}
                  </span>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm font-medium text-green-600 mt-1">
                          Balance: {formatCurrency(user.balance)}
                        </p>
                      </div>

                      {/* Links */}
                      <div className="py-1">
                        <Link
                          to="/account"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          👤 My Account
                        </Link>
                        <Link
                          to="/seller/items"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          📦 My Items
                        </Link>
                        <Link
                          to="/account/deposit"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          💳 Deposit Cash
                        </Link>
                        <Link
                          to="/reports"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          📊 Reports
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-gray-600 hover:text-blue-600 font-medium text-sm px-3 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium"
            >
              Search
            </button>
          </div>
        </form>
      )}
    </nav>
  )
}

export default Navbar
