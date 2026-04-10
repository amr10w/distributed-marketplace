import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTransactions } from '../../hooks/useTransactions'
import { useToast } from '../../hooks/useToast'
import { formatCurrency } from '../../lib/utils'

const DepositPage = () => {
  const { user, updateBalance } = useAuth()
  const { addTransaction } = useTransactions()
  const toast = useToast()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const quickAmounts = [50, 100, 250, 500, 1000, 2500]

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-700">Please login to deposit</h3>
        <Link to="/login" className="text-blue-600 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const handleDeposit = (e) => {
    e.preventDefault()
    setError('')
    const depositAmount = parseFloat(amount)

    if (!amount || depositAmount <= 0) {
      setError('Please enter a valid amount')
      toast.error('Please enter a valid amount')
      return
    }

    if (depositAmount > 100000) {
      setError('Maximum deposit amount is \$100,000')
      return
    }

    setLoading(true)
    setTimeout(() => {
      updateBalance(depositAmount)
      addTransaction({
        type: 'DEPOSIT',
        userId: user.id,
        userName: user.fullName,
        amount: depositAmount,
      })
      setSuccess(true)
      setLoading(false)
      toast.success('Successfully deposited ' + formatCurrency(depositAmount))
    }, 1500)
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Deposit Successful!</h2>
          <p className="text-gray-500 mb-4">{formatCurrency(parseFloat(amount))} has been added to your account</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">New Balance</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(user.balance)}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSuccess(false); setAmount('') }}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Deposit More
            </button>
            <button
              onClick={() => navigate('/account')}
              className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
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
      <button onClick={() => navigate('/account')} className="text-blue-600 hover:text-blue-800 font-medium mb-6 flex items-center gap-1">
        ← Back to Account
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Deposit Cash</h1>
        <p className="text-gray-500 mb-6">Add funds to your marketplace account</p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-600">Current Balance</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(user.balance)}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Select</p>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                type="button"
                onClick={() => setAmount(qa.toString())}
                className={
                  'py-2 rounded-lg text-sm font-medium border transition ' +
                  (amount === qa.toString()
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50')
                }
              >
                {formatCurrency(qa)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleDeposit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-lg"
              />
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Current Balance</span>
                <span className="text-gray-700">{formatCurrency(user.balance)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Deposit Amount</span>
                <span className="text-green-600">+{formatCurrency(parseFloat(amount))}</span>
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                <span className="font-medium text-gray-700">New Balance</span>
                <span className="font-bold text-gray-900">{formatCurrency(user.balance + parseFloat(amount))}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Deposit Funds'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DepositPage
