import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-blue-600 mb-3">🛒 MarketPlace</h3>
            <p className="text-sm text-gray-500">
              A distributed online marketplace system built for CSE352s - Parallel and Distributed Systems.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Marketplace</h4>
            <div className="space-y-2">
              <Link to="/marketplace" className="block text-sm text-gray-500 hover:text-blue-600">Browse Products</Link>
              <Link to="/seller/items/new" className="block text-sm text-gray-500 hover:text-blue-600">Sell an Item</Link>
              <Link to="/store/settings" className="block text-sm text-gray-500 hover:text-blue-600">My Store</Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Account</h4>
            <div className="space-y-2">
              <Link to="/account" className="block text-sm text-gray-500 hover:text-blue-600">My Account</Link>
              <Link to="/account/deposit" className="block text-sm text-gray-500 hover:text-blue-600">Deposit Cash</Link>
              <Link to="/account/transactions" className="block text-sm text-gray-500 hover:text-blue-600">Transactions</Link>
            </div>
          </div>

          {/* Reports */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Reports</h4>
            <div className="space-y-2">
              <Link to="/reports" className="block text-sm text-gray-500 hover:text-blue-600">Dashboard</Link>
              <Link to="/reports/sales" className="block text-sm text-gray-500 hover:text-blue-600">Sales Report</Link>
              <Link to="/reports/purchases" className="block text-sm text-gray-500 hover:text-blue-600">Purchase Report</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-400">
            Ain Shams University - Faculty of Engineering - CSE352s Spring 2026
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
