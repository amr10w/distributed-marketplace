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
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-1">Manage app settings and data</p>
      </div>

      {/* App Info */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Application Info</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">App Name</span>
            <span className="font-medium text-slate-100">MarketPlace</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Version</span>
            <span className="font-medium text-slate-100">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Data Storage</span>
            <span className="font-medium text-slate-100">localStorage</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">Storage Used</span>
            <span className="font-medium text-slate-100">{storageInfo()}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Logged In As</span>
            <span className="font-medium text-slate-100">{user ? user.fullName : 'Not logged in'}</span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">Data Management</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-amber-900/30 rounded-lg border border-gold-700">
            <div>
              <p className="font-medium text-gold-400">Clear Cache</p>
              <p className="text-sm text-gold-400">Remove cached products and transactions</p>
            </div>
            <button
              onClick={handleClearCache}
              className="bg-gold-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gold-600 transition text-sm"
            >
              Clear Cache
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-900/30 rounded-lg border border-red-800">
            <div>
              <p className="font-medium text-red-400">Reset All Data</p>
              <p className="text-sm text-red-400">Delete all data and restore defaults. You will be logged out.</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="bg-red-900/300 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition text-sm"
            >
              Reset Everything
            </button>
          </div>
        </div>
      </div>

      {/* Demo Info */}
      <div className="bg-amber-900/30 rounded-2xl border border-gold-600 p-6">
        <h2 className="text-lg font-semibold text-gold-200 mb-3">Demo Test Accounts</h2>
        <p className="text-sm text-gold-400 mb-4">All passwords: password123</p>
        <div className="space-y-2">
          {[
            { email: 'john@example.com', name: 'John Doe', role: 'Seller - Electronics' },
            { email: 'jane@example.com', name: 'Jane Smith', role: 'Seller - Books' },
            { email: 'bob@example.com', name: 'Bob Wilson', role: 'Seller - Sports' },
            { email: 'sarah@example.com', name: 'Sarah Johnson', role: 'Customer' },
            { email: 'mike@example.com', name: 'Mike Chen', role: 'Customer' },
          ].map((acc) => (
            <div key={acc.email} className="flex items-center justify-between bg-slate-800/60 px-3 py-2 rounded-lg text-sm border border-gold-700">
              <div>
                <span className="font-medium text-gold-200">{acc.name}</span>
                <span className="text-gold-400 ml-2">{acc.email}</span>
              </div>
              <span className={
                'text-xs px-2 py-0.5 rounded-full font-medium border ' +
                (acc.role.includes('Customer')
                  ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800'
                  : 'bg-lapis-50 text-lapis-700 border-lapis-100')
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
