import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTransactions } from '../../hooks/useTransactions'
import { formatCurrency, formatDate } from '../../lib/utils'

const PurchaseReport = () => {
  const { user } = useAuth()
  const { getPurchasesByUser } = useTransactions()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-700">Please login to view reports</h3>
        <Link to="/login" className="text-blue-600 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const myPurchases = getPurchasesByUser(user.id)
  const totalSpent = myPurchases.reduce((sum, t) => sum + t.amount, 0)
  const avgPurchase = myPurchases.length > 0 ? totalSpent / myPurchases.length : 0
  const highestPurchase = myPurchases.length > 0 ? Math.max(...myPurchases.map((t) => t.amount)) : 0
  const lowestPurchase = myPurchases.length > 0 ? Math.min(...myPurchases.map((t) => t.amount)) : 0

  const sellerBreakdown = {}
  myPurchases.forEach((t) => {
    if (!sellerBreakdown[t.sellerName]) {
      sellerBreakdown[t.sellerName] = { count: 0, spent: 0 }
    }
    sellerBreakdown[t.sellerName].count++
    sellerBreakdown[t.sellerName].spent += t.amount
  })

  return (
    <div>
      <button
        onClick={() => navigate('/reports')}
        className="text-blue-600 hover:text-blue-800 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to Reports
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Report</h1>
        <p className="text-gray-500 mt-1">Review your purchase history and spending patterns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Purchases</p>
          <p className="text-2xl font-bold text-gray-900">{myPurchases.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Average Purchase</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(avgPurchase)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Highest Purchase</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(highestPurchase)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchases by Seller</h2>
          {Object.keys(sellerBreakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(sellerBreakdown)
                .sort((a, b) => b[1].spent - a[1].spent)
                .map(([seller, data]) => (
                  <div key={seller}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{seller}</span>
                      <span className="text-sm font-medium text-gray-700">{formatCurrency(data.spent)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 rounded-full h-2"
                          style={{ width: Math.min(100, (data.spent / totalSpent * 100)) + '%' }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{data.count} purchase{data.count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No purchase data yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Spent</span>
              <span className="font-medium text-red-600">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Average per Purchase</span>
              <span className="font-medium text-gray-900">{formatCurrency(avgPurchase)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Highest Purchase</span>
              <span className="font-medium text-gray-900">{formatCurrency(highestPurchase)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Lowest Purchase</span>
              <span className="font-medium text-gray-900">{formatCurrency(lowestPurchase)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Number of Sellers</span>
              <span className="font-medium text-gray-900">{Object.keys(sellerBreakdown).length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Purchase History</h2>
        </div>
        {myPurchases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Seller</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Qty</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myPurchases.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{t.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.sellerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.quantity || 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-red-600">-{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(t.createdAt)}</td>
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
    </div>
  )
}

export default PurchaseReport
