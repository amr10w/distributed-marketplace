import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-gold-400 mb-3"> MarketPlace</h3>
            <p className="text-sm text-slate-400">
              A distributed online marketplace system built for CSE352s - Parallel and Distributed Systems.
            </p>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-3 text-sm">Marketplace</h4>
            <div className="space-y-2">
              <Link to="/marketplace" className="block text-sm text-slate-400 hover:text-gold-300">Browse Products</Link>
              <Link to="/seller/items/new" className="block text-sm text-slate-400 hover:text-gold-300">Sell an Item</Link>
              <Link to="/store/settings" className="block text-sm text-slate-400 hover:text-gold-300">My Store</Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-3 text-sm">Account</h4>
            <div className="space-y-2">
              <Link to="/account" className="block text-sm text-slate-400 hover:text-gold-300">My Account</Link>
              <Link to="/account/deposit" className="block text-sm text-slate-400 hover:text-gold-300">Deposit Cash</Link>
              <Link to="/account/transactions" className="block text-sm text-slate-400 hover:text-gold-300">Transactions</Link>
            </div>
          </div>

          {/* Reports */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-3 text-sm">Reports</h4>
            <div className="space-y-2">
              <Link to="/reports" className="block text-sm text-slate-400 hover:text-gold-300">Dashboard</Link>
              <Link to="/reports/sales" className="block text-sm text-slate-400 hover:text-gold-300">Sales Report</Link>
              <Link to="/reports/purchases" className="block text-sm text-slate-400 hover:text-gold-300">Purchase Report</Link>
            </div>
          </div>
        </div>

        {/* Decorative gold divider */}
        <div className="mt-8 pt-6 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold-300"></div>
            <div className="w-2 h-2 bg-amber-400 rotate-45"></div>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold-300"></div>
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Ain Shams University - Faculty of Engineering - CSE352s Spring 2026
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
