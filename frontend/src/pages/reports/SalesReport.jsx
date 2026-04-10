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
        <h3 className="text-xl font-semibold text-gray-700">Please login to view reports</h3>
        <Link to="/login" className="text-blue-600 hover:underline mt-2 inline-block">Go to Login</Link>
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
    <div>
      <button
        onClick={() => navigate('/reports')}
        className="text-blue-600 hover:text-blue-800 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to Reports
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
        <p className="text-gray-500 mt-1">Track your sales performance and revenue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">{mySales.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Average Sale</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(avgSaleValue)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Highest Sale</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(highestSale)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h2>
          {Object.keys(productSales).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(productSales)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .map(([name, data]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{name}</span>
                      <span className="text-sm font-medium text-green-600">{formatCurrency(data.revenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2"
                          style={{ width: Math.min(100, (data.revenue / totalRevenue * 100)) + '%' }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{data.count} sold</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No sales data yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Listed Products</h2>
          {myProducts.length > 0 ? (
            <div className="space-y-3">
              {myProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.quantity} in stock</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(p.price)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No products listed</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sales History</h2>
        </div>
        {mySales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Buyer</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Qty</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Revenue</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mySales.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{t.productName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.buyerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.quantity || 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">+{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-gray-500">No sales yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesReport
