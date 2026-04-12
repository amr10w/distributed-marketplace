import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTransactions } from '../../hooks/useTransactions'
import { formatCurrency, formatDate } from '../../lib/utils'

const TransactionReport = () => {
  const { user } = useAuth()
  const { transactions } = useTransactions()
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateSort, setDateSort] = useState('newest')

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to view reports</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  let filtered = [...transactions]

  if (typeFilter !== 'all') {
    filtered = filtered.filter((t) => t.type === typeFilter)
  }
  if (statusFilter !== 'all') {
    filtered = filtered.filter((t) => t.status === statusFilter)
  }

  filtered.sort((a, b) => {
    if (dateSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    return new Date(a.createdAt) - new Date(b.createdAt)
  })

  const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0)
  const purchaseCount = filtered.filter((t) => t.type === 'PURCHASE').length
  const depositCount = filtered.filter((t) => t.type === 'DEPOSIT').length

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/reports')}
        className="text-gold-400 hover:text-gold-300 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to Reports
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Transaction Report</h1>
        <p className="text-slate-400 mt-1">Complete overview of all marketplace transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-100">{filtered.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Volume</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Purchases</p>
          <p className="text-2xl font-bold text-gold-400">{purchaseCount}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Deposits</p>
          <p className="text-2xl font-bold text-emerald-400">{depositCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-800 text-slate-100"
            >
              <option value="all">All Types</option>
              <option value="PURCHASE">Purchases</option>
              <option value="DEPOSIT">Deposits</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-800 text-slate-100"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Sort</label>
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              className="px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-800 text-slate-100"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">ID</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Type</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Details</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900 transition">
                    <td className="px-6 py-4 text-sm text-slate-400">#{t.id}</td>
                    <td className="px-6 py-4">
                      <span className={
                        'text-xs px-2 py-1 rounded-full font-medium border ' +
                        (t.type === 'PURCHASE'
                          ? 'bg-amber-900/30 text-gold-300 border-gold-700'
                          : 'bg-emerald-900/30 text-emerald-400 border-emerald-800')
                      }>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {t.type === 'PURCHASE' ? (
                        <div>
                          <p className="text-sm font-medium text-slate-100">{t.productName}</p>
                          <p className="text-xs text-slate-400">{t.buyerName} → {t.sellerName}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-slate-100">Deposit</p>
                          <p className="text-xs text-slate-400">by {t.userName}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gold-400">{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={
                        'text-xs px-2 py-1 rounded-full font-medium border ' +
                        (t.status === 'COMPLETED'
                          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800'
                          : 'bg-amber-900/30 text-gold-400 border-gold-700')
                      }>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-6xl mb-4">📜</div>
          <h3 className="text-xl font-semibold text-slate-200">No transactions found</h3>
          <p className="text-slate-400">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

export default TransactionReport
