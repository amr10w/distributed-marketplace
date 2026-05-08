import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useReportData } from '../../hooks/useReportData'
import { formatCurrency, formatDate } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const TransactionReport = () => {
  const { user } = useAuth()
  const { transactions, loading } = useReportData()
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState('all')
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

  if (loading) return <LoadingSpinner />

  let filtered = [...transactions]
  if (typeFilter === 'purchases') filtered = filtered.filter((t) => t.buyerId === user.id)
  if (typeFilter === 'sales') filtered = filtered.filter((t) => t.sellerId === user.id)

  filtered.sort((a, b) =>
    dateSort === 'newest'
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
  )

  const totalVolume = filtered.reduce((sum, t) => sum + t.amount, 0)
  const purchaseCount = filtered.filter((t) => t.buyerId === user.id).length
  const saleCount = filtered.filter((t) => t.sellerId === user.id).length

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
        <p className="text-slate-400 mt-1">Complete overview of all your marketplace transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-100">{filtered.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Volume</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(totalVolume)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Purchases Made</p>
          <p className="text-2xl font-bold text-red-400">{purchaseCount}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Sales Made</p>
          <p className="text-2xl font-bold text-emerald-400">{saleCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Filter</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-800 text-slate-100"
            >
              <option value="all">All Transactions</option>
              <option value="purchases">Purchases</option>
              <option value="sales">Sales</option>
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
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Counterparty</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtered.map((t) => {
                  const isBuyer = t.buyerId === user.id
                  return (
                    <tr key={t.id} className="hover:bg-slate-900 transition">
                      <td className="px-6 py-4 text-sm text-slate-400">#{t.id}</td>
                      <td className="px-6 py-4">
                        <span className={
                          'text-xs px-2 py-1 rounded-full font-medium border ' +
                          (isBuyer
                            ? 'bg-red-900/30 text-red-400 border-red-800'
                            : 'bg-emerald-900/30 text-emerald-400 border-emerald-800')
                        }>
                          {isBuyer ? 'Purchase' : 'Sale'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-100">{t.productName || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {isBuyer ? t.sellerName || '—' : t.buyerName || '—'}
                      </td>
                      <td className={'px-6 py-4 font-medium ' + (isBuyer ? 'text-red-400' : 'text-emerald-400')}>
                        {isBuyer ? '-' : '+'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 rounded-full font-medium border bg-emerald-900/30 text-emerald-400 border-emerald-800">
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(t.createdAt)}</td>
                    </tr>
                  )
                })}
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
