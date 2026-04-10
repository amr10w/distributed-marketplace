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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600">🛒 MarketPlace</h1>
          <p className="text-gray-500 mt-2">Welcome back! Login to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs font-medium text-gray-500 mb-3">Quick Login (click to fill):</p>
            <div className="space-y-2">
              {testAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc.email)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg text-left transition text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-900">{acc.name}</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-gray-500">{acc.email}</span>
                  </div>
                  <span className={
                    'text-xs px-2 py-0.5 rounded-full font-medium ' +
                    (acc.role.includes('Customer')
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700')
                  }>
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Password for all: password123</p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Do not have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
