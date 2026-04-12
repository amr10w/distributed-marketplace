import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { formatCurrency } from '../../lib/utils'

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    clearCart,
  } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    closeCart()
    navigate('/cart/checkout')
  }

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={
          'fixed top-0 right-0 h-full w-full max-w-md bg-slate-800 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-slate-700 ' +
          (isCartOpen ? 'translate-x-0' : 'translate-x-full')
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900">
          <h2 className="text-lg font-bold text-slate-100">
            🛒 Cart ({cartItems.length} item
            {cartItems.length !== 1 ? 's' : ''})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-slate-200 mb-1">
                Your cart is empty
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Browse products and add items to your cart
              </p>
              <button
                onClick={() => {
                  closeCart()
                  navigate('/marketplace')
                }}
                className="text-gold-400 hover:underline text-sm font-medium"
              >
                Browse Marketplace →
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 bg-slate-900 rounded-lg p-3 border border-slate-700"
              >
                {/* Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    e.target.src =
                      'https://via.placeholder.com/80x80?text=No+Image'
                  }}
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-100 text-sm truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.brand}</p>
                  <p className="text-sm font-bold text-gold-400 mt-1">
                    {formatCurrency(item.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-slate-600 rounded-md">
                      <button
                        onClick={() =>
                          updateCartQuantity(item.id, item.cartQuantity - 1)
                        }
                        className="px-2 py-0.5 hover:bg-slate-700 text-sm font-medium text-slate-200"
                      >
                        −
                      </button>
                      <span className="px-2 py-0.5 text-sm font-medium border-x border-slate-600 min-w-[30px] text-center text-slate-100">
                        {item.cartQuantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartQuantity(item.id, item.cartQuantity + 1)
                        }
                        disabled={item.cartQuantity >= item.quantity}
                        className="px-2 py-0.5 hover:bg-slate-700 text-sm font-medium text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs text-slate-500">
                      max {item.quantity}
                    </span>
                  </div>
                </div>

                {/* Subtotal & Remove */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-400 text-xs hover:bg-red-900/30 p-1 rounded transition"
                  >
                    🗑️
                  </button>
                  <p className="text-sm font-bold text-slate-100">
                    {formatCurrency(item.price * item.cartQuantity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-700 p-4 space-y-3 bg-slate-900">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Total</span>
              <span className="text-xl font-bold text-slate-100">
                {formatCurrency(getCartTotal())}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-gold-500 text-white py-3 rounded-lg font-medium hover:bg-gold-600 transition shadow-md"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={clearCart}
              className="w-full text-red-400 hover:text-red-400 text-sm font-medium py-2 hover:bg-red-900/30 rounded-lg transition"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer
