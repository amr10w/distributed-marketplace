import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProducts } from '../../hooks/useProducts'
import { useTransactions } from '../../hooks/useTransactions'
import { formatCurrency, formatDate } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const AccountOverviewPage = () => {
  const { user } = useAuth()
  const { products, loading } = useProducts()
  const { getTransactionsByUser, getPurchasesByUser, getSalesByUser, getDepositsByUser } = useTransactions()
  const [activeTab, setActiveTab] = useState('overview')

  if (loading) return <LoadingSpinner />

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-700">Please login</h3>
        <Link to="/login" className="text-blue-600 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const myListedItems = products.filter((p) => p.sellerId === user.id)
  const itemsForSale = myListedItems.filter((p) => p.quantity > 0)
  const allTransactions = getTransactionsByUser(user.id)
  const purchasedTransactions = getPurchasesByUser(user.id)
  const soldTransactions = getSalesByUser(user.id)
  const depositTransactions = getDepositsByUser(user.id)

  const totalSales = soldTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalPurchases = purchasedTransactions.reduce((sum, t) => sum + t.amount, 0)

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'purchased', label: 'Purchased (' + purchasedTransactions.length + ')' },
    { key: 'sold', label: 'Sold (' + soldTransactions.length + ')' },
    { key: 'forsale', label: 'For Sale (' + itemsForSale.length + ')' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.fullName}</p>
        </div>
        <Link
          to="/account/deposit"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
        >
          + Deposit Cash
        </Link>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
        <p className="text-blue-100 text-sm mb-1">Current Balance</p>
        <p className="text-4xl font-bold mb-4">{formatCurrency(user.balance)}</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-blue-200 text-xs">Total Sales</p>
            <p className="text-lg font-semibold">{formatCurrency(totalSales)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Total Purchases</p>
            <p className="text-lg font-semibold">{formatCurrency(totalPurchases)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Listed Items</p>
            <p className="text-lg font-semibold">{myListedItems.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Items Purchased</p>
          <p className="text-2xl font-bold text-blue-600">{purchasedTransactions.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Items Sold</p>
          <p className="text-2xl font-bold text-green-600">{soldTransactions.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Items For Sale</p>
          <p className="text-2xl font-bold text-orange-600">{itemsForSale.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Deposits Made</p>
          <p className="text-2xl font-bold text-purple-600">{depositTransactions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium text-gray-900">{user.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium text-gray-900">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Store Name</p>
            <p className="font-medium text-gray-900">{user.storeName || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                'px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ' +
                (activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {allTransactions.length > 0 ? (
            allTransactions.slice(0, 10).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      'w-10 h-10 rounded-full flex items-center justify-center text-lg ' +
                      (t.type === 'PURCHASE'
                        ? t.buyerId === user.id ? 'bg-red-100' : 'bg-green-100'
                        : 'bg-blue-100')
                    }
                  >
                    {t.type === 'PURCHASE' ? (t.buyerId === user.id ? '🛒' : '💰') : '💳'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {t.type === 'PURCHASE'
                        ? t.buyerId === user.id
                          ? 'Purchased ' + t.productName
                          : 'Sold ' + t.productName
                        : 'Deposited funds'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(t.createdAt)}</p>
                  </div>
                </div>
                <span
                  className={
                    'font-semibold ' +
                    (t.type === 'PURCHASE' && t.buyerId === user.id ? 'text-red-600' : 'text-green-600')
                  }
                >
                  {t.type === 'PURCHASE' && t.buyerId === user.id ? '-' : '+'}
                  {formatCurrency(t.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-gray-500">No activity yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'purchased' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {purchasedTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Seller</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Qty</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchasedTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{t.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.sellerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.quantity || 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-red-600">-{formatCurrency(t.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(t.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🛒</div>
              <p className="text-gray-500">No purchases yet</p>
              <Link to="/marketplace" className="text-blue-600 hover:underline mt-2 inline-block">Browse Marketplace</Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sold' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {soldTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Buyer</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Qty</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Revenue</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {soldTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{t.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.buyerName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.quantity || 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">+{formatCurrency(t.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(t.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-gray-500">No sales yet</p>
              <Link to="/seller/items/new" className="text-blue-600 hover:underline mt-2 inline-block">List an item</Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'forsale' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {itemsForSale.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {itemsForSale.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(item.price)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Available</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-gray-500">No items for sale</p>
              <Link to="/seller/items/new" className="text-blue-600 hover:underline mt-2 inline-block">Add an item</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AccountOverviewPage
