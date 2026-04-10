import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { PRODUCT_CATEGORIES } from '../../lib/constants'

const AddEditItemPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getProductById, addProduct, updateProduct } = useProducts()
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

  useEffect(() => {
    if (isEditing) {
      const product = getProductById(id)
      if (product) {
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
      }
    }
  }, [id, isEditing, getProductById])

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-700">Please login first</h3>
        <Link to="/login" className="text-blue-600 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (e.target.name === 'image') {
      setImagePreview(e.target.value)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.brand || !formData.price || !formData.quantity) {
      setError('Please fill in all required fields')
      toast.error('Please fill in all required fields')
      return
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0')
      return
    }

    if (parseInt(formData.quantity) < 0) {
      setError('Quantity cannot be negative')
      return
    }

    const productData = {
      name: formData.name,
      brand: formData.brand,
      description: formData.description,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      category: formData.category,
      image: formData.image || 'https://picsum.photos/seed/' + formData.name.replace(/\s/g, '') + '/400/300',
      sellerId: user.id,
      sellerName: user.fullName,
      storeName: user.storeName || user.fullName + "'s Store",
    }

    if (isEditing) {
      updateProduct(id, productData)
      toast.success('Product updated successfully!')
      navigate('/seller/items')
    } else {
      addProduct(productData)
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
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate('/seller/items')}
        className="text-blue-600 hover:text-blue-800 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to My Items
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Item' : 'Add New Item'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. iPhone 15 Pro"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. Apple"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty for auto-generated image</p>

            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {isEditing ? 'Update Item' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/seller/items')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
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
