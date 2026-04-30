import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { formatCurrency } from '../../lib/utils'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { getCartCount, toggleCart } = useCart()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const cartCount = getCartCount()

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
    <nav className="bg-slate-800 shadow-sm border-b border-slate-700 px-4 lg:px-6 py-3 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/marketplace" className="text-xl lg:text-2xl font-bold text-gold-400 whitespace-nowrap">
          MarketPlace
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name or brand..."
              className="w-full px-4 py-2.5 pl-10 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm bg-slate-800 text-slate-100"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gold-600"
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
            className="md:hidden p-2 text-slate-300 hover:text-gold-300"
          >
            🔍
          </button>

          {/* Cart Button */}
          {user && (
            <button
              onClick={toggleCart}
              className="relative p-2 text-slate-300 hover:text-gold-300 hover:bg-amber-900/30 rounded-lg transition"
              title="Shopping Cart"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-900/300 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          )}

          {user ? (
            <>
              {/* Balance Badge */}
              <Link
                to="/account/deposit"
                className="hidden sm:flex items-center gap-1 bg-emerald-900/30 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-emerald-900/50 transition"
              >
                💰 {formatCurrency(user.balance)}
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-600 px-3 py-2 rounded-lg transition"
                >
                  <div className="w-8 h-8 bg-gold-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(user.fullName || user.username || '?').charAt(0)}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-slate-100">
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
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50 py-2">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-700">
                        <p className="font-medium text-slate-100">{user.fullName}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        <p className="text-sm font-medium text-emerald-400 mt-1">
                          Balance: {formatCurrency(user.balance)}
                        </p>
                      </div>

                      {/* Links */}
                      <div className="py-1">
                        <Link
                          to="/account"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
                        >
                          👤 My Account
                        </Link>
                        <Link
                          to="/cart/checkout"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
                        >
                          🛒 My Cart
                          {cartCount > 0 && (
                            <span className="ml-2 bg-amber-900/30 text-gold-400 text-xs px-2 py-0.5 rounded-full font-medium">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/seller/items"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
                        >
                          📦 My Items
                        </Link>
                        <Link
                          to="/account/deposit"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
                        >
                          💳 Deposit Cash
                        </Link>
                        <Link
                          to="/reports"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
                        >
                          📊 Reports
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-700 py-1">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30"
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
                className="text-slate-300 hover:text-gold-300 font-medium text-sm px-3 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gold-500 text-white px-4 py-2 rounded-lg hover:bg-gold-600 text-sm font-medium transition shadow-md"
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
              className="w-full px-4 py-2.5 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm bg-slate-800 text-slate-100"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold-500 text-white px-3 py-1 rounded-md text-xs font-medium"
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