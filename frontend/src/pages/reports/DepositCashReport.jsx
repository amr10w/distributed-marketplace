import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { reportsApi } from '../../api/reportsApi'
import { formatCurrency, formatDate } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const DepositCashReport = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    Promise.resolve().then(async () => {
      if (cancelled) return
      setLoading(true)
      setError('')
      const res = await reportsApi.getActivityLog(user.id, 'deposit_cash')
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

  const enriched = reports.map((r) => {
    const params = r.parameters && typeof r.parameters === 'object' ? r.parameters : {}
    const snap = r.resultSnapshot && typeof r.resultSnapshot === 'object' ? r.resultSnapshot : {}
    return {
      ...r,
      amount: Number(params.Amount ?? 0),
      newBalance: Number(snap.NewBalance ?? 0),
    }
  })

  const totalDeposited = enriched.reduce((s, t) => s + t.amount, 0)
  const avg = enriched.length > 0 ? totalDeposited / enriched.length : 0
  const highest = enriched.length > 0 ? Math.max(...enriched.map((t) => t.amount)) : 0

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate('/reports')}
        className="text-gold-400 hover:text-gold-300 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to Reports
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Deposit Cash Report</h1>
        <p className="text-slate-400 mt-1">Audit log of every cash deposit to your wallet</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Deposits</p>
          <p className="text-2xl font-bold text-slate-100">{enriched.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Deposited</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalDeposited)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Average Deposit</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(avg)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Largest Deposit</p>
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
      ) : enriched.length > 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">ID</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">New Balance</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {enriched.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900 transition">
                    <td className="px-6 py-4 text-sm text-slate-400">#{r.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-emerald-400">+{formatCurrency(r.amount)}</td>
                    <td className="px-6 py-4 text-sm text-slate-200">{formatCurrency(r.newBalance)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{formatDate(r.generatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-6xl mb-4">💵</div>
          <h3 className="text-xl font-semibold text-slate-200">No deposits yet</h3>
          <p className="text-slate-400 mt-1">Deposit cash to your wallet to generate a report</p>
          <Link to="/account/deposit" className="text-gold-400 hover:underline mt-2 inline-block">Make a Deposit</Link>
        </div>
      )}
    </div>
  )
}

export default DepositCashReport
