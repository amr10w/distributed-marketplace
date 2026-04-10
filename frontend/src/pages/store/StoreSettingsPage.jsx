import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProducts } from '../../hooks/useProducts'
import { formatCurrency } from '../../lib/utils'

const StoreSettingsPage = () => {
  const { user } = useAuth()
  const { products } = useProducts()

  const [storeName, setStoreName] = useState(user?.storeName || '')
  const [storeDescription, setStoreDescription] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-700">Please login to manage your store</h3>
        <Link to="/login" className="text-blue-600 hover:underline mt-2 inline-block">Go to Login</Link>
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
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-500 mt-1">Configure your marketplace store</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Store Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Store Information</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="My Awesome Store"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Description
                </label>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Tell buyers about your store..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Owner
                </label>
                <input
                  type="text"
                  value={user.fullName}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Visibility
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="visibility" defaultChecked className="text-blue-600" />
                    <span className="text-sm text-gray-700">Public - Anyone can see your store</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="visibility" className="text-blue-600" />
                    <span className="text-sm text-gray-700">Private - Only via direct link</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>

          {/* Store Link */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Your Store</h2>
            <p className="text-gray-500 text-sm mb-4">
              Share this link with others so they can browse and buy from your store
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={window.location.origin + '/store/' + user.id}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/store/' + user.id)
                  setSuccess('Store link copied to clipboard!')
                  setTimeout(() => setSuccess(''), 3000)
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Right: Store Preview */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Preview</h2>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-4">
              <h3 className="text-xl font-bold">{storeName || 'Your Store Name'}</h3>
              <p className="text-blue-100 text-sm mt-1">by {user.fullName}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Products Listed</span>
                <span className="text-sm font-medium text-gray-900">{myProducts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">In Stock</span>
                <span className="text-sm font-medium text-green-600">
                  {myProducts.filter((p) => p.quantity > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Inventory Value</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Items Sold</span>
                <span className="text-sm font-medium text-gray-900">{totalSold}</span>
              </div>
            </div>

            <Link
              to={'/store/' + user.id}
              className="block mt-4 text-center bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
            >
              View Public Store Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreSettingsPage
