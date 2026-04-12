import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProducts } from '../../hooks/useProducts'
import { useTransactions } from '../../hooks/useTransactions'
import { formatCurrency, formatDate } from '../../lib/utils'

const SalesReport = () => {
  const { user } = useAuth()
  const { products } = useProducts()
  const { getSalesByUser } = useTransactions()
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

  const mySales = getSalesByUser(user.id)
  const myProducts = products.filter((p) => p.sellerId === user.id)

  const totalRevenue = mySales.reduce((sum, t) => sum + t.amount, 0)
  const avgSaleValue = mySales.length > 0 ? totalRevenue / mySales.length : 0
  const highestSale = mySales.length > 0 ? Math.max(...mySales.map((t) => t.amount)) : 0

  const productSales = {}
  mySales.forEach((t) => {
    if (!productSales[t.productName]) {
      productSales[t.productName] = { count: 0, revenue: 0 }
    }
    productSales[t.productName].count += (t.quantity || 1)
    productSales[t.productName].revenue += t.amount
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
        <h1 className="text-3xl font-bold text-slate-100">Sales Report</h1>
        <p className="text-slate-400 mt-1">Track your sales performance and revenue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Sales</p>
          <p className="text-2xl font-bold text-slate-100">{mySales.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Average Sale</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(avgSaleValue)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Highest Sale</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(highestSale)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Product Performance */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Product Performance</h2>
          {Object.keys(productSales).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(productSales)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .map(([name, data]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-100">{name}</span>
                      <span className="text-sm font-medium text-emerald-400">{formatCurrency(data.revenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-2">
                        <div
                          className="bg-emerald-900/300 rounded-full h-2 transition-all"
                          style={{ width: Math.min(100, (data.revenue / totalRevenue * 100)) + '%' }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400">{data.count} sold</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-4">No sales data yet</p>
          )}
        </div>

        {/* Listed Products */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Listed Products</h2>
          {myProducts.length > 0 ? (
            <div className="space-y-3">
              {myProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-8 h-8 rounded object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/32x32?text=No' }}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-100">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.quantity} in stock</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gold-400">{formatCurrency(p.price)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-4">No products listed</p>
          )}
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Sales History</h2>
        </div>
        {mySales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Buyer</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Qty</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Revenue</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {mySales.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900 transition">
                    <td className="px-6 py-4 font-medium text-slate-100">{t.productName}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{t.buyerName}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{t.quantity || 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-emerald-400">+{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-slate-400">No sales yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesReport
