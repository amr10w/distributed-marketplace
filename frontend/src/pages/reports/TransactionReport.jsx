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
        <h3 className="text-xl font-semibold text-gray-700">Please login to view reports</h3>
        <Link to="/login" className="text-blue-600 hover:underline mt-2 inline-block">Go to Login</Link>
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
    <div>
      <button
        onClick={() => navigate('/reports')}
        className="text-blue-600 hover:text-blue-800 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to Reports
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Report</h1>
        <p className="text-gray-500 mt-1">Complete overview of all marketplace transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Volume</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Purchases</p>
          <p className="text-2xl font-bold text-orange-600">{purchaseCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Deposits</p>
          <p className="text-2xl font-bold text-green-600">{depositCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="PURCHASE">Purchases</option>
              <option value="DEPOSIT">Deposits</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sort</label>
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ID</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Details</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">#{t.id}</td>
                    <td className="px-6 py-4">
                      <span className={
                        'text-xs px-2 py-1 rounded-full font-medium ' +
                        (t.type === 'PURCHASE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')
                      }>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {t.type === 'PURCHASE' ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t.productName}</p>
                          <p className="text-xs text-gray-500">{t.buyerName} → {t.sellerName}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Deposit</p>
                          <p className="text-xs text-gray-500">by {t.userName}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={
                        'text-xs px-2 py-1 rounded-full font-medium ' +
                        (t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')
                      }>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📜</div>
          <h3 className="text-xl font-semibold text-gray-700">No transactions found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}

export default TransactionReport
