import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useReportData } from '../../hooks/useReportData'
import { formatCurrency, formatDate } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const PurchaseReport = () => {
  const { user } = useAuth()
  const { purchases, loading } = useReportData()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to view reports</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  if (loading) return <LoadingSpinner />

  const totalSpent = purchases.reduce((sum, t) => sum + t.amount, 0)
  const avgPurchase = purchases.length > 0 ? totalSpent / purchases.length : 0
  const highestPurchase = purchases.length > 0 ? Math.max(...purchases.map((t) => t.amount)) : 0
  const lowestPurchase = purchases.length > 0 ? Math.min(...purchases.map((t) => t.amount)) : 0

  // Group by seller
  const sellerBreakdown = {}
  purchases.forEach((t) => {
    const key = t.sellerName || 'Unknown'
    if (!sellerBreakdown[key]) sellerBreakdown[key] = { count: 0, spent: 0 }
    sellerBreakdown[key].count++
    sellerBreakdown[key].spent += t.amount
  })

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/reports')}
        className="text-gold-400 hover:text-gold-300 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to Reports
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Purchase Report</h1>
        <p className="text-slate-400 mt-1">Review your purchase history and spending patterns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Purchases</p>
          <p className="text-2xl font-bold text-slate-100">{purchases.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Spent</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Average Purchase</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(avgPurchase)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Highest Purchase</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(highestPurchase)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* By Seller */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Purchases by Seller</h2>
          {Object.keys(sellerBreakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(sellerBreakdown)
                .sort((a, b) => b[1].spent - a[1].spent)
                .map(([seller, data]) => (
                  <div key={seller}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-100 truncate mr-2">{seller}</span>
                      <span className="text-sm font-medium text-slate-200 shrink-0">
                        {formatCurrency(data.spent)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gold-500 rounded-full h-2 transition-all"
                          style={{ width: totalSpent > 0 ? Math.min(100, (data.spent / totalSpent) * 100) + '%' : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {data.count} purchase{data.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-4">No purchase data yet</p>
          )}
        </div>

        {/* Spending Summary */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Spending Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">Total Spent</span>
              <span className="font-medium text-red-400">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">Average per Purchase</span>
              <span className="font-medium text-slate-100">{formatCurrency(avgPurchase)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">Highest Purchase</span>
              <span className="font-medium text-slate-100">{formatCurrency(highestPurchase)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-slate-300">Lowest Purchase</span>
              <span className="font-medium text-slate-100">{formatCurrency(lowestPurchase)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-300">Unique Sellers</span>
              <span className="font-medium text-slate-100">{Object.keys(sellerBreakdown).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Purchase History</h2>
        </div>
        {purchases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Seller</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {purchases.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900 transition">
                    <td className="px-6 py-4 font-medium text-slate-100">{t.productName || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{t.sellerName || '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-red-400">-{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{formatDate(t.createdAt)}</td>
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
    </div>
  )
}

export default PurchaseReport
