import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useReportData } from '../../hooks/useReportData'
import { formatCurrency } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const ReportsPage = () => {
  const { user } = useAuth()
  const { items, transactions, sales, purchases, loading } = useReportData()

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

  const totalRevenue = sales.reduce((sum, t) => sum + t.amount, 0)
  const totalSpent = purchases.reduce((sum, t) => sum + t.amount, 0)
  const inventoryValue = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const reportCards = [
    {
      title: 'Transaction Report',
      description: 'View all your purchases and sales',
      icon: '📜',
      link: '/reports/transactions',
      stats: [
        { label: 'Total Transactions', value: transactions.length },
        { label: 'Total Volume', value: formatCurrency(transactions.reduce((s, t) => s + t.amount, 0)) },
      ],
      gradient: 'from-gold-400 to-amber-600',
    },
    {
      title: 'Sales Report',
      description: 'Track your sales performance and revenue',
      icon: '💰',
      link: '/reports/sales',
      stats: [
        { label: 'Total Sales', value: sales.length },
        { label: 'Revenue', value: formatCurrency(totalRevenue) },
      ],
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Purchase Report',
      description: 'Review your purchase history and spending',
      icon: '🛒',
      link: '/reports/purchases',
      stats: [
        { label: 'Total Purchases', value: purchases.length },
        { label: 'Total Spent', value: formatCurrency(totalSpent) },
      ],
      gradient: 'from-lapis-500 to-lapis-600',
    },
    {
      title: 'Checkout Report',
      description: 'Audit log of every cart checkout you complete',
      icon: '🛍️',
      link: '/reports/checkout',
      stats: [
        { label: 'Source', value: 'ReportLog' },
        { label: 'Type', value: 'checkout' },
      ],
      gradient: 'from-rose-500 to-red-600',
    },
    {
      title: 'Deposit Cash Report',
      description: 'Audit log of every cash deposit to your wallet',
      icon: '💵',
      link: '/reports/deposit-cash',
      stats: [
        { label: 'Source', value: 'ReportLog' },
        { label: 'Type', value: 'deposit_cash' },
      ],
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Activity Log',
      description: 'Combined view of all checkouts and deposits',
      icon: '📋',
      link: '/reports/activity',
      stats: [
        { label: 'Source', value: 'ReportLog' },
        { label: 'Events', value: 'All' },
      ],
      gradient: 'from-purple-500 to-fuchsia-600',
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Reports Dashboard</h1>
        <p className="text-slate-400 mt-1">Detailed reports about your marketplace activity</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-lapis-50 rounded-lg flex items-center justify-center text-xl">💳</div>
            <p className="text-sm text-slate-400">Current Balance</p>
          </div>
          <p className="text-2xl font-bold text-slate-100">{formatCurrency(user.balance)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-900/30 rounded-lg flex items-center justify-center text-xl">💰</div>
            <p className="text-sm text-slate-400">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-900/30 rounded-lg flex items-center justify-center text-xl">🛒</div>
            <p className="text-sm text-slate-400">Total Spent</p>
          </div>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-900/30 rounded-lg flex items-center justify-center text-xl">📦</div>
            <p className="text-sm text-slate-400">Inventory Value</p>
          </div>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(inventoryValue)}</p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {reportCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 overflow-hidden hover:shadow-lg hover:border-gold-500 transition-all duration-300 group"
          >
            <div className={'relative bg-gradient-to-r ' + card.gradient + ' p-6 text-white overflow-hidden'}>
              <div className="absolute inset-0 islamic-pattern opacity-10"></div>
              <div className="relative">
                <div className="text-3xl mb-2">{card.icon}</div>
                <h3 className="text-xl font-bold">{card.title}</h3>
                <p className="text-white/80 text-sm mt-1">{card.description}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {card.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                    <p className="text-lg font-bold text-slate-100">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-gold-400 font-medium text-sm group-hover:text-gold-300 transition">
                View Full Report →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Financial Summary</h2>
        <table className="w-full">
          <tbody className="divide-y divide-slate-700">
            <tr>
              <td className="py-3 text-slate-300">Total Revenue from Sales</td>
              <td className="py-3 text-right font-medium text-emerald-400">+{formatCurrency(totalRevenue)}</td>
            </tr>
            <tr>
              <td className="py-3 text-slate-300">Total Spent on Purchases</td>
              <td className="py-3 text-right font-medium text-red-400">-{formatCurrency(totalSpent)}</td>
            </tr>
            <tr>
              <td className="py-3 text-slate-300">Inventory Value (unsold stock)</td>
              <td className="py-3 text-right font-medium text-gold-400">{formatCurrency(inventoryValue)}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-3 text-slate-100">Current Wallet Balance</td>
              <td className="py-3 text-right text-gold-400">{formatCurrency(user.balance)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReportsPage
