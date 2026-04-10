import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmModal from '../../components/common/ConfirmModal'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProductById } = useProducts()
  const { user, updateBalance } = useAuth()
  const [showConfirm, setShowConfirm] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [error, setError] = useState('')

  const product = getProductById(id)

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-semibold text-gray-700">Product not found</h3>
      </div>
    )
  }

  const handlePurchase = () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.id === product.sellerId) {
      setError('You cannot buy your own product')
      return
    }

    if (user.balance < product.price) {
      setError('Insufficient balance. Please deposit funds first.')
      return
    }

    setShowConfirm(true)
  }

  const confirmPurchase = () => {
    updateBalance(-product.price)
    setPurchaseSuccess(true)
    setShowConfirm(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:text-blue-800 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to products
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full min-h-[300px] object-cover"
            />
          </div>

          {/* Details */}
          <div className="p-8">
            <div className="mb-2">
              <span className="text-sm text-blue-600 font-medium">{product.category}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-500 mb-4">by {product.brand}</p>

            <div className="text-3xl font-bold text-blue-600 mb-4">
              {formatCurrency(product.price)}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-6">
              <span
                className={
                  'px-3 py-1 rounded-full text-sm font-medium ' +
                  (product.quantity > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700')
                }
              >
                {product.quantity > 0
                  ? product.quantity + ' in stock'
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Sold by</p>
              <p className="font-medium text-gray-900">{product.storeName}</p>
              <p className="text-sm text-gray-500">{product.sellerName}</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {/* Success */}
            {purchaseSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                Purchase successful! The item has been added to your account.
              </div>
            )}

            {/* Purchase Button */}
            {!purchaseSuccess && (
              <button
                onClick={handlePurchase}
                disabled={product.quantity === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.quantity === 0 ? 'Out of Stock' : 'Buy Now - ' + formatCurrency(product.price)}
              </button>
            )}

            {/* Balance Info */}
            {user && !purchaseSuccess && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Your balance: {formatCurrency(user.balance)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Purchase"
        message={'Are you sure you want to buy ' + product.name + ' for ' + formatCurrency(product.price) + '?'}
        onConfirm={confirmPurchase}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default ProductDetailPage
