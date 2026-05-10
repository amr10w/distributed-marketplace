import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { storeApi } from '../../api/storeApi'

const StoreSettingsPage = () => {
  const { user, updateUserStore } = useAuth()
  const toast = useToast()

  const [storeName, setStoreName] = useState(user?.storeName || '')
  const [storeDescription, setStoreDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to manage your store</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!storeName.trim()) {
      setError('Store name is required')
      return
    }

    if (user.storeId) {
      setError('You already have a store. Editing an existing store is not yet supported.')
      return
    }

    setSaving(true)
    try {
      const result = await storeApi.createStore({
        requestingUserId: user.id,
        storeName: storeName.trim(),
        description: storeDescription.trim() || null,
        logoUrl: logoUrl.trim() || null,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      updateUserStore({ storeId: result.storeId, storeName: result.storeName })
      setSuccess('Store created successfully!')
      toast.success('Store created!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Store Settings</h1>
        <p className="text-slate-400 mt-1">Configure your marketplace store</p>
      </div>

      <div className="max-w-3xl">
        <div>
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
                  Logo URL
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-slate-900 text-slate-100 placeholder:text-slate-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || Boolean(user.storeId)}
                  className="bg-gold-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-gold-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : user.storeId ? 'Store Already Created' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreSettingsPage
