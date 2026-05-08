import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { walletApi } from '../../api/walletApi'
import { formatCurrency } from '../../lib/utils'

const DepositPage = () => {
  const { user, setBalance } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [newBalance, setNewBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  const quickAmounts = [50, 100, 250, 500, 1000, 2500]

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to deposit</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const handleDeposit = async (e) => {
    e.preventDefault()
    setError('')
    const depositAmount = parseFloat(amount)

    if (!amount || depositAmount <= 0) {
      setError('Please enter a valid amount')
      toast.error('Please enter a valid amount')
      return
    }

    if (depositAmount > 100000) {
      setError('Maximum deposit amount is $100,000')
      return
    }

    setLoading(true)
    try {
      const result = await walletApi.deposit(user.id, depositAmount)
      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      setBalance(result.newBalance)
      setNewBalance(result.newBalance)
      setSuccess(true)
      toast.success('Successfully deposited ' + formatCurrency(depositAmount))
    } catch (err) {
      setError(err.message || 'Network error')
      toast.error('Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 animate-fade-in">
        <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-800">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Deposit Successful!</h2>
          <p className="text-slate-400 mb-4">
            {formatCurrency(parseFloat(amount))} has been added to your wallet
          </p>
          <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
            <p className="text-sm text-slate-400">New Balance</p>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(newBalance)}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSuccess(false); setAmount('') }}
              className="flex-1 bg-gold-500 text-white py-3 rounded-lg font-medium hover:bg-gold-600 transition shadow-md"
            >
              Deposit More
            </button>
            <button
              onClick={() => navigate('/account')}
              className="flex-1 border border-slate-600 py-3 rounded-lg font-medium hover:bg-slate-900 transition text-slate-200"
            >
              Back to Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <button
        onClick={() => navigate('/account')}
        className="text-gold-400 hover:text-gold-300 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to Account
      </button>

      <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Deposit Cash</h1>
        <p className="text-slate-400 mb-6">Add funds to your marketplace wallet</p>

        <div className="relative bg-gradient-to-r from-gold-400 to-amber-600 rounded-lg p-4 mb-6 overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-10"></div>
          <div className="relative">
            <p className="text-sm text-gold-200">Current Balance</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(user.balance)}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium text-slate-200 mb-2">Quick Select</p>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                type="button"
                onClick={() => setAmount(qa.toString())}
                className={
                  'py-2 rounded-lg text-sm font-medium border transition ' +
                  (amount === qa.toString()
                    ? 'bg-gold-500 text-white border-gold-400 shadow-md'
                    : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-amber-900/30 hover:border-gold-500 hover:text-gold-300')
                }
              >
                {formatCurrency(qa)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleDeposit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Amount ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full pl-8 pr-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition text-lg bg-slate-900 text-slate-100"
              />
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Current Balance</span>
                <span className="text-slate-200">{formatCurrency(user.balance)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Deposit Amount</span>
                <span className="text-emerald-400">+{formatCurrency(parseFloat(amount))}</span>
              </div>
              <div className="border-t border-slate-700 mt-2 pt-2 flex justify-between">
                <span className="font-medium text-slate-200">New Balance</span>
                <span className="font-bold text-slate-100">
                  {formatCurrency(user.balance + parseFloat(amount))}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 text-white py-3 rounded-lg font-medium hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Processing...' : 'Deposit Funds'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DepositPage
