import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useAuth } from '../../hooks/useAuth'
import { useTransactions } from '../../hooks/useTransactions'
import { useToast } from '../../hooks/useToast'
import { formatCurrency } from '../../lib/utils'
import ConfirmModal from '../../components/common/ConfirmModal'
import SkeletonDetail from '../../components/common/SkeletonDetail'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProductById, reduceStock, loading } = useProducts()
  const { user, updateBalance, updateSellerBalance } = useAuth()
  const { addTransaction } = useTransactions()
  const toast = useToast()
  const [quantity, setQuantity] = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <SkeletonDetail />

  const product = getProductById(id)

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Product not found</h3>
        <Link to="/marketplace" className="text-blue-600 hover:underline">Back to Marketplace</Link>
      </div>
    )
  }

  const isOwnProduct = user && user.id === product.sellerId
  const totalPrice = product.price * quantity

  const handlePurchase = () => {
    setError('')

    if (!user) {
      toast.warning('Please login to purchase items')
      navigate('/login')
      return
    }

    if (isOwnProduct) {
      toast.error('You cannot buy your own product')
      return
    }

    if (product.quantity === 0) {
      toast.error('This product is out of stock')
      return
    }

    if (quantity > product.quantity) {
      setError('Not enough stock. Only ' + product.quantity + ' available.')
      return
    }

    if (user.balance < totalPrice) {
      setError('Insufficient balance. You need ' + formatCurrency(totalPrice) + ' but only have ' + formatCurrency(user.balance))
      return
    }

    setShowConfirm(true)
  }

  const confirmPurchase = () => {
    updateBalance(-totalPrice)
    updateSellerBalance(product.sellerId, totalPrice)
    reduceStock(product.id, quantity)

    addTransaction({
      type: 'PURCHASE',
      buyerId: user.id,
      buyerName: user.fullName,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      amount: totalPrice,
    })

    setPurchaseSuccess(true)
    setShowConfirm(false)
    toast.success('Successfully purchased ' + quantity + 'x ' + product.name + '!')
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:text-blue-800 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to products
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="bg-gray-100 relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full min-h-[300px] object-cover"
            />
            {isOwnProduct && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Your Product
              </div>
            )}
            {product.quantity === 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

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

            <div className="flex items-center gap-2 mb-6">
              <span
                className={
                  'px-3 py-1 rounded-full text-sm font-medium ' +
                  (product.quantity > 0
                    ? product.quantity <= 5
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700')
                }
              >
                {product.quantity > 0 ? product.quantity + ' in stock' : 'Out of Stock'}
              </span>
              {product.quantity > 0 && product.quantity <= 5 && (
                <span className="text-orange-600 text-sm font-medium">Low stock!</span>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Sold by</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {product.sellerName ? product.sellerName.charAt(0) : 'S'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.storeName}</p>
                  <Link to={'/store/' + product.sellerId} className="text-sm text-blue-600 hover:underline">
                    Visit Store →
                  </Link>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {purchaseSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 text-lg">✅</span>
                  <p className="font-medium text-green-800">Purchase Successful!</p>
                </div>
                <p className="text-sm text-green-700 mb-1">
                  You bought {quantity}x {product.name} for {formatCurrency(totalPrice)}
                </p>
                <p className="text-sm text-green-600">New balance: {formatCurrency(user.balance)}</p>
                <div className="flex gap-2 mt-3">
                  <Link to="/account" className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    View Account
                  </Link>
                  <Link to="/marketplace" className="text-sm border border-green-300 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}

            {isOwnProduct && !purchaseSuccess && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium mb-2">This is your product</p>
                <p className="text-sm text-blue-600 mb-3">You can edit or manage this item from your seller dashboard</p>
                <div className="flex gap-2">
                  <Link to={'/seller/items/' + product.id + '/edit'} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Edit Item
                  </Link>
                  <Link to="/seller/inventory" className="text-sm border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50">
                    Manage Inventory
                  </Link>
                </div>
              </div>
            )}

            {!isOwnProduct && !purchaseSuccess && product.quantity > 0 && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100 text-lg font-medium">-</button>
                    <span className="px-4 py-2 font-medium border-x border-gray-300 min-w-[50px] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))} className="px-3 py-2 hover:bg-gray-100 text-lg font-medium">+</button>
                  </div>
                  <span className="text-sm text-gray-500">Max: {product.quantity}</span>
                </div>

                {quantity > 1 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{quantity} x {formatCurrency(product.price)}</span>
                      <span className="font-bold text-gray-900">Total: {formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePurchase}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Buy Now - {formatCurrency(totalPrice)}
                </button>

                {user && (
                  <p className={
                    'text-center text-sm mt-3 ' +
                    (user.balance >= totalPrice ? 'text-gray-500' : 'text-red-500 font-medium')
                  }>
                    {user.balance >= totalPrice
                      ? 'Your balance: ' + formatCurrency(user.balance)
                      : 'Insufficient balance: ' + formatCurrency(user.balance)}
                  </p>
                )}

                {user && user.balance < totalPrice && (
                  <Link to="/account/deposit" className="block text-center text-blue-600 hover:underline text-sm mt-2">
                    Deposit funds →
                  </Link>
                )}

                {!user && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    <Link to="/login" className="text-blue-600 hover:underline">Login</Link> to purchase
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Purchase"
        message={'Buy ' + quantity + 'x ' + product.name + ' for ' + formatCurrency(totalPrice) + '?'}
        onConfirm={confirmPurchase}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default ProductDetailPage
