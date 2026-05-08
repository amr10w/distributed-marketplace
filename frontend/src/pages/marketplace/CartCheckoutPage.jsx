import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { cartApi } from '../../api/cartApi'
import { formatCurrency } from '../../lib/utils'
import ConfirmModal from '../../components/common/ConfirmModal'

const CartCheckoutPage = () => {
  const { cartItems, getCartTotal, removeFromCart, updateCartQuantity, clearCart } = useCart()
  const { user, setBalance } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [showConfirm, setShowConfirm] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [purchasedItems, setPurchasedItems] = useState([])
  const [purchasedTotal, setPurchasedTotal] = useState(0)
  const [remainingBalance, setRemainingBalance] = useState(0)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const total = getCartTotal()

  if (!user) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">Please login to checkout</h3>
        <Link to="/login" className="text-gold-400 hover:underline">Go to Login</Link>
      </div>
    )
  }

  if (purchaseSuccess) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Purchase Successful!</h2>
          <p className="text-slate-400 mb-6">
            You purchased {purchasedItems.length} item{purchasedItems.length !== 1 ? 's' : ''} for{' '}
            {formatCurrency(purchasedTotal)}
          </p>

          <div className="bg-slate-900 rounded-lg p-4 mb-6 text-left space-y-3 border border-slate-700">
            {purchasedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=No+Image' }}
                  />
                  <div>
                    <p className="font-medium text-slate-100">{item.name}</p>
                    <p className="text-slate-400">{item.cartQuantity}x {formatCurrency(item.price)}</p>
                  </div>
                </div>
                <p className="font-bold text-slate-100">{formatCurrency(item.price * item.cartQuantity)}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-400 mb-6">
            New balance:{' '}
            <span className="font-bold text-emerald-400">{formatCurrency(remainingBalance)}</span>
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              to="/marketplace"
              className="bg-gold-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gold-600 transition shadow-md"
            >
              Continue Shopping
            </Link>
            <Link
              to="/account"
              className="border border-slate-600 text-slate-200 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-900 transition"
            >
              View Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">Your cart is empty</h3>
        <p className="text-slate-400 mb-4">Add some products before checking out</p>
        <Link to="/marketplace" className="text-gold-400 hover:underline font-medium">
          Browse Marketplace →
        </Link>
      </div>
    )
  }

  const insufficientBalance = user.balance < total

  const handleCheckout = () => {
    if (insufficientBalance) {
      toast.error(
        'Insufficient balance. You need ' +
          formatCurrency(total) +
          ' but only have ' +
          formatCurrency(user.balance)
      )
      return
    }
    setCheckoutError('')
    setShowConfirm(true)
  }

  const confirmPurchase = async () => {
    setShowConfirm(false)
    setCheckoutLoading(true)
    setCheckoutError('')
    try {
      const result = await cartApi.checkout(user.id)
      if (!result.success) {
        setCheckoutError(result.error)
        toast.error(result.error)
        return
      }
      const snapshot = [...cartItems]
      clearCart()
      setBalance(result.remainingBalance)
      setPurchasedItems(snapshot)
      setPurchasedTotal(result.totalAmount)
      setRemainingBalance(result.remainingBalance)
      setPurchaseSuccess(true)
      toast.success('Successfully purchased ' + snapshot.length + ' item' + (snapshot.length !== 1 ? 's' : '') + '!')
    } catch (err) {
      setCheckoutError(err.message || 'Network error during checkout')
      toast.error('Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const sellerGroups = cartItems.reduce((groups, item) => {
    const key = item.storeId
    if (!groups[key]) {
      groups[key] = { sellerName: item.sellerName, storeName: item.storeName, items: [] }
    }
    groups[key].items.push(item)
    return groups
  }, {})

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="text-gold-400 hover:text-gold-300 font-medium mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-slate-100 mb-6">Checkout</h1>

      {checkoutError && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
          {checkoutError}
        </div>
      )}

      <div className="space-y-6">
        {/* Items grouped by seller */}
        {Object.entries(sellerGroups).map(([storeId, group]) => (
          <div key={storeId} className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
            <div className="bg-slate-900 px-5 py-3 border-b border-slate-700 flex items-center gap-2">
              <div className="w-7 h-7 bg-gold-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {group.storeName ? group.storeName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-100">{group.storeName}</p>
                <p className="text-xs text-slate-400">Sold by {group.sellerName}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-700">
              {group.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=No+Image' }}
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={'/marketplace/' + item.id}
                      className="font-medium text-slate-100 hover:text-gold-300 truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-slate-400">{item.brand}</p>
                    <p className="text-sm font-bold text-gold-400 mt-1">
                      {formatCurrency(item.price)} each
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-slate-600 rounded-md">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1)}
                          className="px-2.5 py-1 hover:bg-slate-900 text-sm font-medium text-slate-200"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-sm font-medium border-x border-slate-600 min-w-[36px] text-center text-slate-100">
                          {item.cartQuantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}
                          disabled={item.cartQuantity >= item.quantity}
                          className="px-2.5 py-1 hover:bg-slate-900 text-sm font-medium text-slate-200 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">{item.quantity} available</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 text-sm p-1 hover:bg-red-900/30 rounded transition"
                    >
                      ✕
                    </button>
                    <p className="text-lg font-bold text-slate-100">
                      {formatCurrency(item.price * item.cartQuantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Order Summary */}
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-slate-300">
                <span>{item.name} × {item.cartQuantity}</span>
                <span>{formatCurrency(item.price * item.cartQuantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
            <span className="text-lg font-bold text-slate-100">Total</span>
            <span className="text-2xl font-bold text-gold-400">{formatCurrency(total)}</span>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Balance</span>
              <span className={'font-medium ' + (insufficientBalance ? 'text-red-400' : 'text-emerald-400')}>
                {formatCurrency(user.balance)}
              </span>
            </div>
            {!insufficientBalance && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-slate-400">After Purchase</span>
                <span className="font-medium text-slate-200">
                  {formatCurrency(user.balance - total)}
                </span>
              </div>
            )}
          </div>

          {insufficientBalance && (
            <div className="mt-3 bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium">Insufficient balance</p>
              <p>
                You need {formatCurrency(total - user.balance)} more.{' '}
                <Link to="/account/deposit" className="text-gold-400 hover:underline font-medium">
                  Deposit funds →
                </Link>
              </p>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={insufficientBalance || checkoutLoading}
            className={
              'w-full mt-4 py-3 rounded-lg font-medium transition ' +
              (insufficientBalance || checkoutLoading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gold-500 text-white hover:bg-gold-600 shadow-md')
            }
          >
            {checkoutLoading
              ? 'Processing...'
              : insufficientBalance
              ? 'Insufficient Balance'
              : 'Confirm Purchase — ' + formatCurrency(total)}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Purchase"
        message={
          'Buy ' +
          cartItems.length +
          ' item' +
          (cartItems.length !== 1 ? 's' : '') +
          ' for ' +
          formatCurrency(total) +
          '?'
        }
        onConfirm={confirmPurchase}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default CartCheckoutPage
