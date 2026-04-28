import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { PRODUCT_CATEGORIES, CATEGORY_IDS } from '../../lib/constants'
import { itemsApi } from '../../api/itemsApi'

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=300&fit=crop',
]

const CATEGORY_IMAGES = {
  Electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
  Fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
  'Home & Garden': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=300&fit=crop',
  Sports: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=400&h=300&fit=crop',
  Books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop',
  Toys: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop',
  Automotive: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop',
  Health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop',
}

const AddEditItemPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    quantity: '',
    category: 'Electronics',
    image: '',
  })
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [imageMethod, setImageMethod] = useState('url')
  const [previewError, setPreviewError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingItem, setLoadingItem] = useState(false)

  useEffect(() => {
    if (!isEditing || !user) return
    let cancelled = false
    setLoadingItem(true)
    setError('')
    itemsApi
      .getUserInventory({ ownerId: user.id })
      .then((result) => {
        if (cancelled) return
        if (!result.success) {
          setError(result.error)
          return
        }
        const product = result.items.find((p) => p.id === parseInt(id))
        if (!product) {
          setError('Item not found')
          return
        }
        setFormData({
          name: product.name,
          brand: product.brand,
          description: product.description,
          price: product.price.toString(),
          quantity: product.quantity.toString(),
          category: product.category,
          image: product.image,
        })
        setImagePreview(product.image)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Network error')
      })
      .finally(() => {
        if (!cancelled) setLoadingItem(false)
      })
    return () => { cancelled = true }
  }, [id, isEditing, user])

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-100">Please login first</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  if (!isEditing && !user.storeId) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏪</div>
        <h3 className="text-xl font-semibold text-slate-100">Create your store first</h3>
        <p className="text-slate-400 mt-2">You need a store before you can list items.</p>
        <Link to="/store/settings" className="text-gold-400 hover:underline mt-2 inline-block">
          Go to Store Settings
        </Link>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (name === 'image') {
      setImagePreview(value)
      setPreviewError(false)
    }
  }

  const selectGalleryImage = (url) => {
    setFormData({ ...formData, image: url })
    setImagePreview(url)
    setPreviewError(false)
  }

  const generateCategoryImage = () => {
    const catImage = CATEGORY_IMAGES[formData.category]
    if (catImage) {
      setFormData({ ...formData, image: catImage })
      setImagePreview(catImage)
      setPreviewError(false)
    }
  }

  const getDefaultImage = () => {
    if (formData.category && CATEGORY_IMAGES[formData.category]) {
      return CATEGORY_IMAGES[formData.category]
    }
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.price || !formData.quantity) {
      setError('Please fill in all required fields')
      toast.error('Please fill in all required fields')
      return
    }

    const price = parseFloat(formData.price)
    const quantity = parseInt(formData.quantity)

    if (price <= 0) {
      setError('Price must be greater than 0')
      return
    }

    if (quantity < 0) {
      setError('Quantity cannot be negative')
      return
    }

    const finalImage = formData.image || getDefaultImage()

    if (isEditing) {
      setSubmitting(true)
      try {
        const result = await itemsApi.editItem({
          requestingUserId: user.id,
          itemId: parseInt(id),
          name: formData.name,
          description: formData.description || null,
          price,
          imageUrl: formData.image || null,
        })
        if (!result.success) {
          setError(result.error)
          toast.error(result.error)
          return
        }
        toast.success('Product updated successfully!')
        navigate('/seller/items')
      } catch (err) {
        setError(err.message || 'Network error')
      } finally {
        setSubmitting(false)
      }
      return
    }

    const categoryId = CATEGORY_IDS[formData.category]
    if (!categoryId) {
      setError('Unknown category')
      return
    }

    setSubmitting(true)
    try {
      const result = await itemsApi.addItem({
        requestingUserId: user.id,
        storeId: user.storeId,
        categoryId,
        name: formData.name,
        brand: formData.brand || null,
        description: formData.description || null,
        price,
        stockQuantity: quantity,
        imageUrl: finalImage || null,
      })

      if (!result.success) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      toast.success('Product added successfully!')
      setFormData({
        name: '',
        brand: '',
        description: '',
        price: '',
        quantity: '',
        category: 'Electronics',
        image: '',
      })
      setImagePreview('')
      setPreviewError(false)
    } catch (err) {
      setError(err.message || 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate('/seller/items')}
        className="text-gold-400 hover:text-gold-300 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to My Items
      </button>

      <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-6">
          {isEditing ? 'Edit Item' : 'Add New Item'}
        </h1>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {isEditing && (
          <div className="bg-slate-900/60 border border-slate-700 text-slate-300 px-4 py-3 rounded-lg mb-4 text-xs">
            You can update name, description, price, and image. Brand, category, and quantity are locked once listed.
          </div>
        )}

        {loadingItem && (
          <div className="text-slate-400 text-sm mb-4">Loading item…</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Product Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. iPhone 15 Pro"
              className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-slate-800 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Brand <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. Apple"
              disabled={isEditing}
              className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-slate-800 text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isEditing}
              className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-slate-800 text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-slate-800 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Quantity <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                disabled={isEditing}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-slate-800 text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product..."
              rows="4"
              className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition resize-none bg-slate-800 text-slate-100"
            />
          </div>

          {/* Image Section */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Product Image</label>

            {/* Image Method Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageMethod('url')}
                className={
                  'px-4 py-2 rounded-lg text-sm font-medium transition ' +
                  (imageMethod === 'url'
                    ? 'bg-gold-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-600')
                }
              >
                🔗 Image URL
              </button>
              <button
                type="button"
                onClick={() => setImageMethod('gallery')}
                className={
                  'px-4 py-2 rounded-lg text-sm font-medium transition ' +
                  (imageMethod === 'gallery'
                    ? 'bg-gold-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-600')
                }
              >
                🖼️ Pick from Gallery
              </button>
            </div>

            {imageMethod === 'url' && (
              <div>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition bg-slate-800 text-slate-100"
                />
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-slate-500">Leave empty for auto-generated image</p>
                  <button
                    type="button"
                    onClick={generateCategoryImage}
                    className="text-xs text-gold-400 hover:underline font-medium"
                  >
                    Use category image
                  </button>
                </div>
              </div>
            )}

            {imageMethod === 'gallery' && (
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_IMAGES.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectGalleryImage(url)}
                    className={
                      'relative rounded-lg overflow-hidden border-2 transition ' +
                      (formData.image === url
                        ? 'border-gold-400 ring-2 ring-gold-700'
                        : 'border-slate-700 hover:border-gold-500')
                    }
                  >
                    <img
                      src={url}
                      alt={'Sample ' + (index + 1)}
                      className="w-full h-24 object-cover"
                    />
                    {formData.image === url && (
                      <div className="absolute inset-0 bg-gold-500/20 flex items-center justify-center">
                        <span className="bg-gold-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          ✓ Selected
                        </span>
                      </div>
                    )}
                  </button>
                ))}

                {/* Category-based images */}
                {CATEGORY_IMAGES[formData.category] && (
                  <button
                    type="button"
                    onClick={() => selectGalleryImage(CATEGORY_IMAGES[formData.category])}
                    className={
                      'relative rounded-lg overflow-hidden border-2 transition ' +
                      (formData.image === CATEGORY_IMAGES[formData.category]
                        ? 'border-gold-400 ring-2 ring-gold-700'
                        : 'border-slate-700 hover:border-gold-500')
                    }
                  >
                    <img
                      src={CATEGORY_IMAGES[formData.category]}
                      alt={formData.category}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 text-center">
                      {formData.category}
                    </div>
                    {formData.image === CATEGORY_IMAGES[formData.category] && (
                      <div className="absolute inset-0 bg-gold-500/20 flex items-center justify-center">
                        <span className="bg-gold-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          ✓ Selected
                        </span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Image Preview */}
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-200 mb-2">Preview:</p>
              <div className="relative w-full h-48 rounded-lg border border-slate-700 overflow-hidden bg-slate-900">
                {(imagePreview || getDefaultImage()) && !previewError ? (
                  <img
                    src={imagePreview || getDefaultImage()}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No valid image</p>
                    <button
                      type="button"
                      onClick={() => {
                        const fallback = getDefaultImage()
                        setFormData({ ...formData, image: fallback })
                        setImagePreview(fallback)
                        setPreviewError(false)
                      }}
                      className="text-gold-400 hover:underline text-xs mt-1 font-medium"
                    >
                      Use default image
                    </button>
                  </div>
                )}
                {imagePreview && !previewError && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, image: '' })
                      setImagePreview('')
                      setPreviewError(false)
                    }}
                    className="absolute top-2 right-2 bg-red-900/300 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-700 transition"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gold-500 text-white py-3 rounded-lg font-medium hover:bg-gold-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/seller/items')}
              className="px-6 py-3 border border-slate-600 rounded-lg font-medium hover:bg-slate-900 transition text-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditItemPage