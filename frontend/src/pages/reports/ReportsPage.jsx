import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProducts } from '../../hooks/useProducts'
import { useTransactions } from '../../hooks/useTransactions'
import { formatCurrency } from '../../lib/utils'

const ReportsPage = () => {
  const { user } = useAuth()
  const { products } = useProducts()
  const { transactions, getSalesByUser, getPurchasesByUser, getDepositsByUser } = useTransactions()

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-700">Please login to view reports</h3>
        <Link to="/login" className="text-blue-600 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const myProducts = products.filter((p) => p.sellerId === user.id)
  const mySales = getSalesByUser(user.id)
  const myPurchases = getPurchasesByUser(user.id)
  const myDeposits = getDepositsByUser(user.id)

  const totalRevenue = mySales.reduce((sum, t) => sum + t.amount, 0)
  const totalSpent = myPurchases.reduce((sum, t) => sum + t.amount, 0)
  const totalDeposited = myDeposits.reduce((sum, t) => sum + t.amount, 0)
  const inventoryValue = myProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)

  const reportCards = [
    {
      title: 'Transaction Report',
      description: 'View all transactions including purchases, sales, and deposits',
      icon: '📜',
      link: '/reports/transactions',
      stats: [
        { label: 'Total Transactions', value: transactions.length },
        { label: 'Total Volume', value: formatCurrency(transactions.reduce((s, t) => s + t.amount, 0)) },
      ],
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Sales Report',
      description: 'Track your sales performance and revenue',
      icon: '💰',
      link: '/reports/sales',
      stats: [
        { label: 'Total Sales', value: mySales.length },
        { label: 'Revenue', value: formatCurrency(totalRevenue) },
      ],
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Purchase Report',
      description: 'Review your purchase history and spending',
      icon: '🛒',
      link: '/reports/purchases',
      stats: [
        { label: 'Total Purchases', value: myPurchases.length },
        { label: 'Total Spent', value: formatCurrency(totalSpent) },
      ],
      color: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
        <p className="text-gray-500 mt-1">View detailed reports about your marketplace activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">💳</div>
            <p className="text-sm text-gray-500">Current Balance</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(user.balance)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">💰</div>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-xl">🛒</div>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">📦</div>
            <p className="text-sm text-gray-500">Inventory Value</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(inventoryValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {reportCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className={'bg-gradient-to-r ' + card.color + ' p-6 text-white'}>
              <div className="text-3xl mb-2">{card.icon}</div>
              <h3 className="text-xl font-bold">{card.title}</h3>
              <p className="text-white/80 text-sm mt-1">{card.description}</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {card.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-blue-600 font-medium text-sm">View Full Report →</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
        <table className="w-full">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-3 text-gray-600">Total Deposited</td>
              <td className="py-3 text-right font-medium text-green-600">+{formatCurrency(totalDeposited)}</td>
            </tr>
            <tr>
              <td className="py-3 text-gray-600">Total Revenue from Sales</td>
              <td className="py-3 text-right font-medium text-green-600">+{formatCurrency(totalRevenue)}</td>
            </tr>
            <tr>
              <td className="py-3 text-gray-600">Total Spent on Purchases</td>
              <td className="py-3 text-right font-medium text-red-600">-{formatCurrency(totalSpent)}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-3 text-gray-900">Current Balance</td>
              <td className="py-3 text-right text-blue-600">{formatCurrency(user.balance)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportsPage
