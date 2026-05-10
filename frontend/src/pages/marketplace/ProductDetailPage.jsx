import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useToast } from '../../hooks/useToast'
import { productsApi } from '../../api/productsApi'
import { formatCurrency } from '../../lib/utils'
import ConfirmModal from '../../components/common/ConfirmModal'
import SkeletonDetail from '../../components/common/SkeletonDetail'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, updateBalance } = useAuth()
  const { addToCart, isInCart, openCart } = useCart()
  const toast = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    productsApi.getItemById(id).then((result) => {
      if (cancelled) return
      if (result.success) {
        setProduct(result.item)
      } else {
        setError(result.error)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <SkeletonDetail />

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">
          {error || 'Product not found'}
        </h3>
        <Link to="/marketplace" className="text-gold-400 hover:underline">
          Back to Marketplace
        </Link>
      </div>
    )
  }

  const isOwnProduct = user && user.id === product.sellerId
  const totalPrice = product.price * quantity
  const inCart = isInCart(product.id)

  const handleAddToCart = () => {
    if (!user) {
      toast.warning('Please login to add items to cart')
      navigate('/login')
      return
    }
    if (isOwnProduct) {
      toast.error("You can't add your own product to cart")
      return
    }
    addToCart(product, quantity)
    toast.success(quantity + 'x ' + product.name + ' added to cart!')
  }

  const handlePurchase = () => {
    setPurchaseError('')
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
      setPurchaseError('Not enough stock. Only ' + product.quantity + ' available.')
      return
    }
    if (user.balance < totalPrice) {
      setPurchaseError(
        'Insufficient balance. You need ' +
          formatCurrency(totalPrice) +
          ' but only have ' +
          formatCurrency(user.balance)
      )
      return
    }
    setShowConfirm(true)
  }

  const confirmPurchase = () => {
    updateBalance(-totalPrice)
    setProduct((prev) => ({ ...prev, quantity: prev.quantity - quantity }))
    setPurchaseSuccess(true)
    setShowConfirm(false)
    toast.success('Successfully purchased ' + quantity + 'x ' + product.name + '!')
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="text-gold-400 hover:text-gold-300 font-medium mb-6 flex items-center gap-1"
      >
        ← Back to products
      </button>

      <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="bg-slate-800 relative">
            {product.image && !imgError ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full min-h-[300px] object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-800 text-slate-500">
                <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">No image available</p>
              </div>
            )}
            {isOwnProduct && (
              <div className="absolute top-4 left-4 bg-gold-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Your Product
              </div>
            )}
            {product.quantity === 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-lg">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="mb-2">
              <span className="text-sm text-gold-400 font-medium">{product.category}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">{product.name}</h1>
            <p className="text-slate-400 mb-4">by {product.brand}</p>

            <div className="text-3xl font-bold text-gold-400 mb-4">
              {formatCurrency(product.price)}
            </div>

            <p className="text-slate-300 mb-6">{product.description}</p>

            <div className="flex items-center gap-2 mb-6">
              <span
                className={
                  'px-3 py-1 rounded-full text-sm font-medium border ' +
                  (product.quantity > 0
                    ? product.quantity <= 5
                      ? 'bg-amber-900/30 text-gold-400 border-gold-700'
                      : 'bg-emerald-900/30 text-emerald-400 border-emerald-800'
                    : 'bg-red-900/30 text-red-400 border-red-800')
                }
              >
                {product.quantity > 0 ? product.quantity + ' in stock' : 'Out of Stock'}
              </span>
              {product.quantity > 0 && product.quantity <= 5 && (
                <span className="text-gold-400 text-sm font-medium">Low stock!</span>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-slate-900 rounded-lg p-4 mb-6 border border-slate-700">
              <p className="text-sm text-slate-400">Sold by</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-10 h-10 bg-gold-600 rounded-full flex items-center justify-center text-white font-bold">
                  {product.storeName ? product.storeName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-100">{product.storeName}</p>
                  <Link
                    to={'/store/' + product.storeId}
                    className="text-sm text-gold-400 hover:underline"
                  >
                    Visit Store →
                  </Link>
                </div>
                {!isOwnProduct && product.sellerId && (
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.warning('Please login to message the seller')
                        navigate('/login')
                        return
                      }
                      const name = encodeURIComponent(product.storeName || 'Seller')
                      navigate('/chat/' + product.sellerId + '?name=' + name)
                    }}
                    className="text-sm bg-slate-800 text-gold-400 border border-gold-500 px-3 py-2 rounded-lg hover:bg-amber-900/30 transition flex items-center gap-1"
                  >
                    💬 Message Seller
                  </button>
                )}
              </div>
            </div>

            {purchaseError && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {purchaseError}
              </div>
            )}

            {purchaseSuccess && (
              <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-emerald-400 text-lg">✅</span>
                  <p className="font-medium text-emerald-300">Purchase Successful!</p>
                </div>
                <p className="text-sm text-emerald-400 mb-1">
                  You bought {quantity}x {product.name} for {formatCurrency(totalPrice)}
                </p>
                <p className="text-sm text-emerald-400">
                  New balance: {formatCurrency(user.balance)}
                </p>
                <div className="flex gap-2 mt-3">
                  <Link
                    to="/account"
                    className="text-sm bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800"
                  >
                    View Account
                  </Link>
                  <Link
                    to="/marketplace"
                    className="text-sm border border-emerald-700 text-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-900/30"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}

            {isOwnProduct && !purchaseSuccess && (
              <div className="bg-amber-900/30 border border-gold-600 rounded-lg p-4 mb-4">
                <p className="text-gold-200 font-medium mb-2">This is your product</p>
                <p className="text-sm text-gold-400 mb-3">
                  You can edit or manage this item from your seller dashboard
                </p>
                <div className="flex gap-2">
                  <Link
                    to={'/seller/items/' + product.id + '/edit'}
                    className="text-sm bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700"
                  >
                    Edit Item
                  </Link>
                  <Link
                    to="/seller/inventory"
                    className="text-sm border border-gold-500 text-gold-300 px-4 py-2 rounded-lg hover:bg-amber-900/30"
                  >
                    Manage Inventory
                  </Link>
                </div>
              </div>
            )}

            {!isOwnProduct && !purchaseSuccess && product.quantity > 0 && (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-medium text-slate-200">Quantity:</label>
                  <div className="flex items-center border border-slate-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-slate-900 text-lg font-medium text-slate-200"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium border-x border-slate-600 min-w-[50px] text-center text-slate-100">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      className="px-3 py-2 hover:bg-slate-900 text-lg font-medium text-slate-200"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-slate-400">Max: {product.quantity}</span>
                </div>

                {quantity > 1 && (
                  <div className="bg-slate-900 rounded-lg p-3 mb-4 border border-slate-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        {quantity} x {formatCurrency(product.price)}
                      </span>
                      <span className="font-bold text-slate-100">
                        Total: {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mb-3">
                  <button
                    onClick={handleAddToCart}
                    className={
                      'flex-1 py-3 rounded-lg font-medium transition border ' +
                      (inCart
                        ? 'bg-slate-900 text-slate-400 border-slate-700 cursor-default'
                        : 'bg-slate-800 text-gold-400 border-gold-500 hover:bg-amber-900/30')
                    }
                  >
                    {inCart ? '✓ In Cart' : '🛒 Add to Cart'}
                  </button>

                  <button
                    onClick={handlePurchase}
                    className="flex-1 bg-gold-500 text-white py-3 rounded-lg font-medium hover:bg-gold-600 transition shadow-md"
                  >
                    Buy Now - {formatCurrency(totalPrice)}
                  </button>
                </div>

                {inCart && (
                  <button
                    onClick={openCart}
                    className="w-full text-gold-400 hover:underline text-sm font-medium mb-3"
                  >
                    View Cart →
                  </button>
                )}

                {user && (
                  <p
                    className={
                      'text-center text-sm mt-3 ' +
                      (user.balance >= totalPrice
                        ? 'text-slate-400'
                        : 'text-red-400 font-medium')
                    }
                  >
                    {user.balance >= totalPrice
                      ? 'Your balance: ' + formatCurrency(user.balance)
                      : 'Insufficient balance: ' + formatCurrency(user.balance)}
                  </p>
                )}

                {user && user.balance < totalPrice && (
                  <Link
                    to="/account/deposit"
                    className="block text-center text-gold-400 hover:underline text-sm mt-2"
                  >
                    Deposit funds →
                  </Link>
                )}

                {!user && (
                  <p className="text-center text-sm text-slate-400 mt-3">
                    <Link to="/login" className="text-gold-400 hover:underline">
                      Login
                    </Link>{' '}
                    to purchase
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
        message={
          'Buy ' + quantity + 'x ' + product.name + ' for ' + formatCurrency(totalPrice) + '?'
        }
        onConfirm={confirmPurchase}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default ProductDetailPage
