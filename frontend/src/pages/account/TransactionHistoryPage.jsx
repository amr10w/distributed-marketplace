import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { transactionsApi } from '../../api/transactionsApi'
import { formatCurrency, formatDate } from '../../lib/utils'
import Pagination from '../../components/common/Pagination'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const ITEMS_PER_PAGE = 10

const TransactionHistoryPage = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)
    transactionsApi.getByUser(user.id).then((result) => {
      if (cancelled) return
      if (result.success) setTransactions(result.transactions)
      else setError(result.error)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [user?.id])

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to view transactions</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">Failed to load transactions</h3>
        <p className="text-slate-400">{error}</p>
      </div>
    )
  }

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'purchases') return t.type === 'PURCHASE' && t.buyerId === user.id
    if (filter === 'sales') return t.type === 'PURCHASE' && t.sellerId === user.id
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortOrder === 'highest') return b.amount - a.amount
    if (sortOrder === 'lowest') return a.amount - b.amount
    return 0
  })

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const totalIn = transactions
    .filter((t) => t.type === 'PURCHASE' && t.sellerId === user.id)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOut = transactions
    .filter((t) => t.type === 'PURCHASE' && t.buyerId === user.id)
    .reduce((sum, t) => sum + t.amount, 0)

  const getDetails = (t) => {
    if (t.buyerId === user.id) {
      return {
        icon: '🛒',
        iconBg: 'bg-red-900/30',
        label: 'Purchase',
        description: 'Bought ' + (t.productName || 'item') + (t.sellerName ? ' from ' + t.sellerName : ''),
        amountColor: 'text-red-400',
        prefix: '-',
      }
    }
    return {
      icon: '💰',
      iconBg: 'bg-emerald-900/30',
      label: 'Sale',
      description: 'Sold ' + (t.productName || 'item') + (t.buyerName ? ' to ' + t.buyerName : ''),
      amountColor: 'text-emerald-400',
      prefix: '+',
    }
  }

  const handleFilterChange = (f) => { setFilter(f); setCurrentPage(1) }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Transaction History</h1>
        <p className="text-slate-400 mt-1">View all your marketplace transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-100">{transactions.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Money In (Sales)</p>
          <p className="text-2xl font-bold text-emerald-400">+{formatCurrency(totalIn)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Money Out (Purchases)</p>
          <p className="text-2xl font-bold text-red-400">-{formatCurrency(totalOut)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'All' },
            { key: 'purchases', label: 'Purchases' },
            { key: 'sales', label: 'Sales' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={
                'px-4 py-2 rounded-full text-sm font-medium transition ' +
                (filter === f.key
                  ? 'bg-gold-500 text-white shadow-md'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-amber-900/30 hover:text-gold-300 hover:border-gold-500')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={sortOrder}
          onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1) }}
          className="px-4 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-800 text-slate-200"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      {paginated.length > 0 ? (
        <>
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            {paginated.map((t, i) => {
              const details = getDetails(t)
              return (
                <div
                  key={t.id}
                  className={
                    'flex items-center justify-between px-6 py-4 hover:bg-slate-900 transition ' +
                    (i < paginated.length - 1 ? 'border-b border-slate-700' : '')
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className={'w-12 h-12 rounded-full flex items-center justify-center text-xl ' + details.iconBg}>
                      {details.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-100">{details.label}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-emerald-900/30 text-emerald-400 border-emerald-800">
                          {t.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{details.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <span className={'text-lg font-semibold ' + details.amountColor}>
                    {details.prefix}{formatCurrency(t.amount)}
                  </span>
                </div>
              )
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          />
        </>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-6xl mb-4">📜</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">No transactions found</h3>
          <p className="text-slate-400">
            {filter !== 'all' ? 'Try selecting a different filter' : 'Start by depositing funds or making a purchase'}
          </p>
        </div>
      )}
    </div>
  )
}

export default TransactionHistoryPage
