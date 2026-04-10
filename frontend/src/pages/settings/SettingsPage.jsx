import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProducts } from '../../hooks/useProducts'
import { useTransactions } from '../../hooks/useTransactions'
import { useToast } from '../../hooks/useToast'
import ConfirmModal from '../../components/common/ConfirmModal'

const SettingsPage = () => {
  const { user, resetUsers, logout } = useAuth()
  const { resetProducts } = useProducts()
  const { resetTransactions } = useTransactions()
  const toast = useToast()
  const navigate = useNavigate()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleResetAll = () => {
    resetProducts()
    resetTransactions()
    resetUsers()
    logout()
    toast.success('All data has been reset to defaults')
    navigate('/login')
  }

  const handleClearCache = () => {
    localStorage.removeItem('marketplace_products')
    localStorage.removeItem('marketplace_transactions')
    toast.success('Cache cleared! Refresh to see changes.')
  }

  const storageInfo = () => {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('marketplace_')) {
        total += localStorage.getItem(key).length
      }
    }
    return (total / 1024).toFixed(2) + ' KB'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage app settings and data</p>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Info</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">App Name</span>
            <span className="font-medium text-gray-900">MarketPlace</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Version</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Data Storage</span>
            <span className="font-medium text-gray-900">localStorage</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Storage Used</span>
            <span className="font-medium text-gray-900">{storageInfo()}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Logged In As</span>
            <span className="font-medium text-gray-900">{user ? user.fullName : 'Not logged in'}</span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Clear Cache</p>
              <p className="text-sm text-gray-500">Remove cached products and transactions</p>
            </div>
            <button
              onClick={handleClearCache}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition text-sm"
            >
              Clear Cache
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
            <div>
              <p className="font-medium text-red-900">Reset All Data</p>
              <p className="text-sm text-red-600">Delete all data and restore defaults. You will be logged out.</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition text-sm"
            >
              Reset Everything
            </button>
          </div>
        </div>
      </div>

      {/* Demo Info */}
      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Demo Test Accounts</h2>
        <p className="text-sm text-blue-700 mb-4">All passwords: password123</p>
        <div className="space-y-2">
          {[
            { email: 'john@example.com', name: 'John Doe', role: 'Seller - Electronics' },
            { email: 'jane@example.com', name: 'Jane Smith', role: 'Seller - Books' },
            { email: 'bob@example.com', name: 'Bob Wilson', role: 'Seller - Sports' },
            { email: 'sarah@example.com', name: 'Sarah Johnson', role: 'Customer' },
            { email: 'mike@example.com', name: 'Mike Chen', role: 'Customer' },
          ].map((acc) => (
            <div key={acc.email} className="flex items-center justify-between bg-white/50 px-3 py-2 rounded-lg text-sm">
              <div>
                <span className="font-medium text-blue-900">{acc.name}</span>
                <span className="text-blue-600 ml-2">{acc.email}</span>
              </div>
              <span className={
                'text-xs px-2 py-0.5 rounded-full font-medium ' +
                (acc.role.includes('Customer') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')
              }>
                {acc.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset All Data"
        message="This will delete ALL data (products, transactions, users) and restore the original defaults. You will be logged out. Are you sure?"
        onConfirm={handleResetAll}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  )
}

export default SettingsPage
