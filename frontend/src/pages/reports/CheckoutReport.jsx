import { useEffect, useState, Fragment } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { reportsApi } from '../../api/reportsApi'
import { formatCurrency, formatDate } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const CheckoutReport = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    Promise.resolve().then(async () => {
      if (cancelled) return
      setLoading(true)
      setError('')
      const res = await reportsApi.getActivityLog(user.id, 'checkout')
      if (cancelled) return
      if (res.success) {
        setReports(res.reports)
      } else {
        setError(res.error)
        setReports([])
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [user, refreshKey])

  const refresh = () => setRefreshKey((k) => k + 1)

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to view this report</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const totalsByReport = reports.map((r) => {
    const snap = r.resultSnapshot
    const total = snap && typeof snap === 'object' ? Number(snap.TotalAmount ?? 0) : 0
    const itemCount = r.parameters && Array.isArray(r.parameters.Items) ? r.parameters.Items.length : 0
    const remaining = snap && typeof snap === 'object' ? Number(snap.RemainingBalance ?? 0) : 0
    return { ...r, total, itemCount, remaining }
  })

  const totalSpent = totalsByReport.reduce((s, t) => s + t.total, 0)
  const avg = totalsByReport.length > 0 ? totalSpent / totalsByReport.length : 0
  const highest = totalsByReport.length > 0 ? Math.max(...totalsByReport.map((t) => t.total)) : 0

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/reports')}
        className="text-gold-400 hover:text-gold-300 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to Reports
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Checkout Report</h1>
        <p className="text-slate-400 mt-1">Audit log of every checkout you've completed</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Checkouts</p>
          <p className="text-2xl font-bold text-slate-100">{totalsByReport.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Spent</p>
          <p className="text-2xl font-bold text-red-400">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Average Checkout</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(avg)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Largest Checkout</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(highest)}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-6 flex justify-end">
        <button
          onClick={refresh}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gold-500 hover:bg-gold-400 text-slate-900 transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : totalsByReport.length > 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">ID</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Items</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Total</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Remaining Balance</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {totalsByReport.map((r) => (
                  <Fragment key={r.id}>
                    <tr className="hover:bg-slate-900 transition">
                      <td className="px-6 py-4 text-sm text-slate-400">#{r.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{r.itemCount}</td>
                      <td className="px-6 py-4 text-sm font-medium text-red-400">-{formatCurrency(r.total)}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{formatCurrency(r.remaining)}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(r.generatedAt)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                          className="text-xs text-gold-400 hover:text-gold-300 font-medium"
                        >
                          {expanded === r.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {expanded === r.id && (
                      <tr className="bg-slate-900">
                        <td colSpan={6} className="px-6 py-4">
                          {r.parameters && Array.isArray(r.parameters.Items) && r.parameters.Items.length > 0 && (
                            <>
                              <p className="text-xs font-medium text-slate-400 mb-2">Items Purchased</p>
                              <table className="w-full mb-4">
                                <thead className="bg-slate-950">
                                  <tr>
                                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-400">Item</th>
                                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-400">Qty</th>
                                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-400">Unit Price</th>
                                    <th className="text-left px-3 py-2 text-xs font-medium text-slate-400">Line Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                  {r.parameters.Items.map((it, idx) => (
                                    <tr key={idx}>
                                      <td className="px-3 py-2 text-sm text-slate-200">{it.Name || `Item ${it.ItemId}`}</td>
                                      <td className="px-3 py-2 text-sm text-slate-300">{it.Quantity}</td>
                                      <td className="px-3 py-2 text-sm text-slate-300">{formatCurrency(Number(it.UnitPrice ?? 0))}</td>
                                      <td className="px-3 py-2 text-sm font-medium text-gold-400">{formatCurrency(Number(it.LineTotal ?? 0))}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </>
                          )}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
                              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Order Summary</p>
                              <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-slate-400">Order ID</dt>
                                  <dd className="text-slate-200 font-medium">#{r.id}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-400">Cart ID</dt>
                                  <dd className="text-slate-200 font-medium">#{r.parameters?.CartId ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-400">Items Purchased</dt>
                                  <dd className="text-slate-200 font-medium">{r.itemCount}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-400">Date</dt>
                                  <dd className="text-slate-200 font-medium">{formatDate(r.generatedAt)}</dd>
                                </div>
                              </dl>
                            </div>
                            <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
                              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Payment Result</p>
                              <dl className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <dt className="text-slate-400">Status</dt>
                                  <dd>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                                      ✓ {r.resultSnapshot?.Status === 'completed' ? 'Completed' : (r.resultSnapshot?.Status ?? 'Completed')}
                                    </span>
                                  </dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-400">Total Charged</dt>
                                  <dd className="text-red-400 font-medium">-{formatCurrency(r.total)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-400">Remaining Balance</dt>
                                  <dd className="text-gold-400 font-medium">{formatCurrency(r.remaining)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-400">Transactions</dt>
                                  <dd className="text-slate-200 font-medium">
                                    {Array.isArray(r.resultSnapshot?.TransactionIds) && r.resultSnapshot.TransactionIds.length > 0
                                      ? r.resultSnapshot.TransactionIds.map((tid) => `#${tid}`).join(', ')
                                      : '—'}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-semibold text-slate-200">No checkouts yet</h3>
          <p className="text-slate-400 mt-1">Complete a cart checkout to generate a report</p>
          <Link to="/marketplace" className="text-gold-400 hover:underline mt-2 inline-block">Browse Marketplace</Link>
        </div>
      )}
    </div>
  )
}

export default CheckoutReport
