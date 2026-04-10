import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const menuSections = [
  {
    title: 'Marketplace',
    items: [
      { label: 'Browse Products', path: '/marketplace', icon: '🏪' },
    ],
  },
  {
    title: 'Seller',
    items: [
      { label: 'My Items', path: '/seller/items', icon: '📦' },
      { label: 'Add New Item', path: '/seller/items/new', icon: '➕' },
      { label: 'Inventory', path: '/seller/inventory', icon: '📋' },
    ],
  },
  {
    title: 'Store',
    items: [
      { label: 'Store Settings', path: '/store/settings', icon: '🏬' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Overview', path: '/account', icon: '👤' },
      { label: 'Deposit Cash', path: '/account/deposit', icon: '💳' },
      { label: 'Transactions', path: '/account/transactions', icon: '📜' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Dashboard', path: '/reports', icon: '📊' },
      { label: 'Transactions', path: '/reports/transactions', icon: '📄' },
      { label: 'Sales', path: '/reports/sales', icon: '💰' },
      { label: 'Purchases', path: '/reports/purchases', icon: '🛒' },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', path: '/settings', icon: '⚙️' },
    ],
  },
]

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-blue-700 transition"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={
          'bg-white border-r border-gray-200 z-40 transition-all duration-300 ' +
          'fixed lg:static inset-y-0 left-0 ' +
          (isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-64')
        }
      >
        <div className="h-full overflow-y-auto p-4 pt-2">
          {user && (
            <div className="lg:hidden bg-blue-50 rounded-lg p-3 mb-4">
              <p className="font-medium text-blue-900 text-sm">{user.fullName}</p>
              <p className="text-xs text-blue-600">{user.email}</p>
            </div>
          )}

          {menuSections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                {section.title}
              </p>
              <nav className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) setIsOpen(false)
                    }}
                    className={
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
                      (location.pathname === item.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100')
                    }
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
