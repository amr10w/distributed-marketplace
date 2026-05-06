import { useEffect, useState, Fragment } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { reportsApi } from '../../api/reportsApi'
import { formatCurrency, formatDate } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const TYPE_LABEL = {
  checkout: 'Checkout',
  deposit_cash: 'Deposit',
}

const TYPE_BADGE = {
  checkout: 'bg-lapis-900/30 text-lapis-300 border-lapis-800',
  deposit_cash: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
}

const ActivityLogPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
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
      const reportType = filter === 'all' ? undefined : filter
      const res = await reportsApi.getActivityLog(user.id, reportType)
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
  }, [user, filter, refreshKey])

  const refresh = () => setRefreshKey((k) => k + 1)

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to view activity log</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const checkoutCount = reports.filter((r) => r.reportType === 'checkout').length
  const depositCount = reports.filter((r) => r.reportType === 'deposit_cash').length

  const summarizeResult = (r) => {
    const snap = r.resultSnapshot
    if (!snap || typeof snap !== 'object') return '—'
    if (r.reportType === 'checkout') {
      return formatCurrency(Number(snap.TotalAmount ?? 0))
    }
    if (r.reportType === 'deposit_cash') {
      const params = r.parameters
      const amount = params && typeof params === 'object' ? Number(params.Amount ?? 0) : 0
      return formatCurrency(amount)
    }
    return '—'
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/reports')}
        className="text-gold-400 hover:text-gold-300 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to Reports
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Activity Log</h1>
        <p className="text-slate-400 mt-1">Per-event audit log of your checkouts and deposits</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Events</p>
          <p className="text-2xl font-bold text-slate-100">{reports.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Checkouts</p>
          <p className="text-2xl font-bold text-lapis-300">{checkoutCount}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Deposits</p>
          <p className="text-2xl font-bold text-emerald-400">{depositCount}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Filter</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-800 text-slate-100"
            >
              <option value="all">All Events</option>
              <option value="checkout">Checkouts</option>
              <option value="deposit_cash">Deposits</option>
            </select>
          </div>
          <button
            onClick={refresh}
            className="self-end px-4 py-2 rounded-lg text-sm font-medium bg-gold-500 hover:bg-gold-400 text-slate-900 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-800 text-red-300 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : reports.length > 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">ID</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Type</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {reports.map((r) => (
                  <Fragment key={r.id}>
                    <tr className="hover:bg-slate-900 transition">
                      <td className="px-6 py-4 text-sm text-slate-400">#{r.id}</td>
                      <td className="px-6 py-4">
                        <span className={'text-xs px-2 py-1 rounded-full font-medium border ' + (TYPE_BADGE[r.reportType] || 'bg-slate-700 text-slate-300 border-slate-600')}>
                          {TYPE_LABEL[r.reportType] || r.reportType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gold-400">{summarizeResult(r)}</td>
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
                        <td colSpan={5} className="px-6 py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-slate-400 mb-1">Parameters</p>
                              <pre className="text-xs bg-slate-950 border border-slate-700 rounded p-3 overflow-x-auto text-slate-200">
{JSON.stringify(r.parameters, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-400 mb-1">Result Snapshot</p>
                              <pre className="text-xs bg-slate-950 border border-slate-700 rounded p-3 overflow-x-auto text-slate-200">
{JSON.stringify(r.resultSnapshot, null, 2)}
                              </pre>
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
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-slate-200">No activity yet</h3>
          <p className="text-slate-400 mt-1">Make a checkout or deposit to generate audit log entries</p>
        </div>
      )}
    </div>
  )
}

export default ActivityLogPage
