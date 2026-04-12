import { Link, useLocation } from 'react-router-dom'

const routeLabels = {
  'marketplace': 'Marketplace',
  'search': 'Search Results',
  'seller': 'Seller',
  'items': 'My Items',
  'new': 'Add New',
  'edit': 'Edit',
  'inventory': 'Inventory',
  'store': 'Store',
  'settings': 'Settings',
  'account': 'Account',
  'deposit': 'Deposit',
  'transactions': 'Transactions',
  'reports': 'Reports',
  'sales': 'Sales Report',
  'purchases': 'Purchase Report',
  'cart': 'Cart',
  'checkout': 'Checkout',
}

const Breadcrumbs = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  if (pathnames.length <= 1) return null

  return (
    <nav className="flex items-center gap-2 text-sm mb-4 flex-wrap">
      <Link to="/marketplace" className="text-slate-400 hover:text-gold-300 transition">
        Home
      </Link>

      {pathnames.map((segment, index) => {
        const path = '/' + pathnames.slice(0, index + 1).join('/')
        const isLast = index === pathnames.length - 1
        const isId = !isNaN(segment)
        const label = isId ? '#' + segment : (routeLabels[segment] || segment)

        return (
          <span key={path} className="flex items-center gap-2">
            <span className="text-slate-500">/</span>
            {isLast ? (
              <span className="text-slate-100 font-medium">{label}</span>
            ) : (
              <Link to={path} className="text-slate-400 hover:text-gold-300 transition">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs
