import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { itemsApi } from '../../api/itemsApi'
import { transactionsApi } from '../../api/transactionsApi'
import { formatCurrency, formatDate } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const AccountOverviewPage = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      itemsApi.getUserInventory({ ownerId: user.id }),
      transactionsApi.getByUser(user.id),
    ]).then(([itemsResult, txResult]) => {
      if (cancelled) return
      if (itemsResult.success) setItems(itemsResult.items)
      if (txResult.success) setTransactions(txResult.transactions)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [user?.id])

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  if (loading) return <LoadingSpinner />

  const purchases = transactions.filter((t) => t.type === 'PURCHASE' && t.buyerId === user.id)
  const sales = transactions.filter((t) => t.type === 'PURCHASE' && t.sellerId === user.id)
  const itemsForSale = items.filter((i) => i.quantity > 0)

  const totalSales = sales.reduce((sum, t) => sum + t.amount, 0)
  const totalPurchases = purchases.reduce((sum, t) => sum + t.amount, 0)

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'purchased', label: 'Purchased (' + purchases.length + ')' },
    { key: 'sold', label: 'Sold (' + sales.length + ')' },
    { key: 'forsale', label: 'For Sale (' + itemsForSale.length + ')' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">My Account</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user.username}</p>
        </div>
        <Link
          to="/account/deposit"
          className="bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-800 transition shadow-md"
        >
          + Deposit Cash
        </Link>
      </div>

      {/* Balance Card */}
      <div className="relative bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl p-6 text-white mb-6 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-15"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300"></div>
        <div className="relative">
          <p className="text-gold-200 text-sm mb-1">Current Balance</p>
          <p className="text-4xl font-bold mb-4">{formatCurrency(user.balance)}</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
              <p className="text-gold-300 text-xs">Total Sales</p>
              <p className="text-lg font-semibold">{formatCurrency(totalSales)}</p>
            </div>
            <div className="bg-slate-800/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
              <p className="text-gold-300 text-xs">Total Purchases</p>
              <p className="text-lg font-semibold">{formatCurrency(totalPurchases)}</p>
            </div>
            <div className="bg-slate-800/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
              <p className="text-gold-300 text-xs">Listed Items</p>
              <p className="text-lg font-semibold">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Items Purchased</p>
          <p className="text-2xl font-bold text-gold-400">{purchases.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Items Sold</p>
          <p className="text-2xl font-bold text-emerald-400">{sales.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Items For Sale</p>
          <p className="text-2xl font-bold text-gold-400">{itemsForSale.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-100">{transactions.length}</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-400">Username</p>
            <p className="font-medium text-slate-100">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Store Name</p>
            <p className="font-medium text-slate-100">{user.storeName || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                'px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ' +
                (activeTab === tab.key
                  ? 'border-gold-400 text-gold-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="font-semibold text-slate-100 mb-4">Recent Activity</h3>
          {transactions.length > 0 ? (
            transactions.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={
                    'w-10 h-10 rounded-full flex items-center justify-center text-lg ' +
                    (t.buyerId === user.id ? 'bg-red-900/30' : 'bg-emerald-900/30')
                  }>
                    {t.buyerId === user.id ? '🛒' : '💰'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-100 text-sm">
                      {t.buyerId === user.id
                        ? 'Purchased ' + (t.productName || 'item')
                        : 'Sold ' + (t.productName || 'item')}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(t.createdAt)}</p>
                  </div>
                </div>
                <span className={'font-semibold ' + (t.buyerId === user.id ? 'text-red-400' : 'text-emerald-400')}>
                  {t.buyerId === user.id ? '-' : '+'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-slate-400">No activity yet</p>
            </div>
          )}
        </div>
      )}

      {/* Purchased Tab */}
      {activeTab === 'purchased' && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          {purchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Product</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Seller</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Amount</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Date</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {purchases.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-900">
                      <td className="px-6 py-4 font-medium text-slate-100">{t.productName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{t.sellerName || '—'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-red-400">-{formatCurrency(t.amount)}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(t.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 font-medium border border-emerald-800">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-slate-400">No purchases yet</p>
              <Link to="/marketplace" className="text-gold-400 hover:underline mt-2 inline-block">Browse Marketplace</Link>
            </div>
          )}
        </div>
      )}

      {/* Sold Tab */}
      {activeTab === 'sold' && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          {sales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Product</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Buyer</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Revenue</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Date</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {sales.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-900">
                      <td className="px-6 py-4 font-medium text-slate-100">{t.productName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{t.buyerName || '—'}</td>
                      <td className="px-6 py-4 text-sm font-medium text-emerald-400">+{formatCurrency(t.amount)}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(t.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 font-medium border border-emerald-800">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-slate-400">No sales yet</p>
              <Link to="/seller/items/new" className="text-gold-400 hover:underline mt-2 inline-block">List an item</Link>
            </div>
          )}
        </div>
      )}

      {/* For Sale Tab */}
      {activeTab === 'forsale' && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          {itemsForSale.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Product</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Category</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Price</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Stock</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {itemsForSale.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=No+Img' }}
                          />
                          <div>
                            <p className="font-medium text-slate-100">{item.name}</p>
                            <p className="text-sm text-slate-400">{item.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">{item.category}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gold-400">{formatCurrency(item.price)}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{item.quantity}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 font-medium border border-emerald-800">
                          Available
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-slate-400">No items for sale</p>
              <Link to="/seller/items/new" className="text-gold-400 hover:underline mt-2 inline-block">Add an item</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AccountOverviewPage
