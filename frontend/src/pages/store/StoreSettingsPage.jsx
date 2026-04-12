import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProducts } from '../../hooks/useProducts'
import { useToast } from '../../hooks/useToast'
import { formatCurrency } from '../../lib/utils'

const StoreSettingsPage = () => {
  const { user } = useAuth()
  const { products } = useProducts()
  const toast = useToast()

  const [storeName, setStoreName] = useState(user?.storeName || '')
  const [storeDescription, setStoreDescription] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to manage your store</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const myProducts = products.filter((p) => p.sellerId === user.id)
  const totalValue = myProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const totalSold = myProducts.reduce((sum, p) => sum + (p.soldCount || 0), 0)

  const handleSave = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!storeName.trim()) {
      setError('Store name is required')
      return
    }

    setSuccess('Store settings updated successfully!')
    toast.success('Store settings saved!')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Store Settings</h1>
        <p className="text-slate-400 mt-1">Configure your marketplace store</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Store Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Store Information</h2>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Store Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="My Awesome Store"
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-slate-900 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Store Description
                </label>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Tell buyers about your store..."
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition resize-none bg-slate-900 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Store Owner
                </label>
                <input
                  type="text"
                  value={user.fullName}
                  disabled
                  className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Store Visibility
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="visibility" defaultChecked className="text-gold-400 focus:ring-gold-500" />
                    <span className="text-sm text-slate-200">Public - Anyone can see your store</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="visibility" className="text-gold-400 focus:ring-gold-500" />
                    <span className="text-sm text-slate-200">Private - Only via direct link</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-gold-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gold-600 transition shadow-md"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>

          {/* Store Link */}
          <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-8 mt-6">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Share Your Store</h2>
            <p className="text-slate-400 text-sm mb-4">
              Share this link with others so they can browse and buy from your store
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={window.location.origin + '/store/' + user.id}
                readOnly
                className="flex-1 px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-sm text-slate-200"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/store/' + user.id)
                  toast.success('Store link copied to clipboard!')
                }}
                className="bg-gold-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-600 transition text-sm shadow-md"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Right: Store Preview */}
        <div>
          <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Store Preview</h2>

            <div className="relative bg-gradient-to-r from-gold-500 to-gold-600 rounded-xl p-6 text-white mb-4 overflow-hidden">
              <div className="absolute inset-0 islamic-pattern opacity-15"></div>
              <div className="relative">
                <h3 className="text-xl font-bold">{storeName || 'Your Store Name'}</h3>
                <p className="text-gold-200 text-sm mt-1">by {user.fullName}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-sm text-slate-400">Products Listed</span>
                <span className="text-sm font-medium text-slate-100">{myProducts.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-sm text-slate-400">In Stock</span>
                <span className="text-sm font-medium text-emerald-400">
                  {myProducts.filter((p) => p.quantity > 0).length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700">
                <span className="text-sm text-slate-400">Total Inventory Value</span>
                <span className="text-sm font-medium text-gold-400">{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-400">Total Items Sold</span>
                <span className="text-sm font-medium text-slate-100">{totalSold}</span>
              </div>
            </div>

            <Link
              to={'/store/' + user.id}
              className="block mt-4 text-center bg-slate-800 text-slate-200 py-2.5 rounded-lg font-medium hover:bg-amber-900/30 hover:text-gold-300 transition text-sm border border-slate-700"
            >
              View Public Store Page →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreSettingsPage
