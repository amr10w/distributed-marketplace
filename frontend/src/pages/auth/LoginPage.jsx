import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const testAccounts = [
    { email: 'john@example.com', role: 'Seller - Electronics', name: 'John Doe' },
    { email: 'jane@example.com', role: 'Seller - Books', name: 'Jane Smith' },
    { email: 'bob@example.com', role: 'Seller - Sports', name: 'Bob Wilson' },
    { email: 'sarah@example.com', role: 'Customer', name: 'Sarah Johnson' },
    { email: 'mike@example.com', role: 'Customer', name: 'Mike Chen' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    const result = login(email, password)

    if (result.success) {
      navigate('/marketplace')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const quickLogin = (testEmail) => {
    setEmail(testEmail)
    setPassword('password123')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 islamic-pattern opacity-40"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold-400">🕌 MarketPlace</h1>
          <p className="text-slate-400 mt-2">Welcome back! Login to your account</p>
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
          {/* Gold accent top */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold-200"></div>
            <h2 className="text-2xl font-bold text-slate-100">Login</h2>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold-200"></div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-slate-900 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-slate-900 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 text-white py-3 rounded-lg font-medium hover:bg-gold-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs font-medium text-slate-400 mb-3">Quick Login (click to fill):</p>
            <div className="space-y-2">
              {testAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc.email)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-900 hover:bg-amber-900/30 rounded-lg text-left transition text-sm border border-transparent hover:border-gold-700"
                >
                  <div>
                    <span className="font-medium text-slate-100">{acc.name}</span>
                    <span className="text-slate-500 mx-2">·</span>
                    <span className="text-slate-400">{acc.email}</span>
                  </div>
                  <span className={
                    'text-xs px-2 py-0.5 rounded-full font-medium ' +
                    (acc.role.includes('Customer')
                      ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-900/30 text-gold-300 border border-gold-700')
                  }>
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Password for all: password123</p>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Do not have an account?{' '}
            <Link to="/register" className="text-gold-400 font-medium hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
