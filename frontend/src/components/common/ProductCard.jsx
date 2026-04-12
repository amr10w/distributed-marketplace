import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { formatCurrency } from '../../lib/utils'

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart()
  const { user } = useAuth()
  const toast = useToast()

  const alreadyInCart = isInCart(product.id)
  const isOwnProduct = user && user.id === product.sellerId
  const isOutOfStock = product.quantity === 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.warning('Please login to add items to cart')
      return
    }

    if (isOwnProduct) {
      toast.error("You can't add your own product to cart")
      return
    }

    if (alreadyInCart) {
      toast.info('Item is already in your cart')
      return
    }

    addToCart(product, 1)
    toast.success(product.name + ' added to cart!')
  }

  return (
    <div className="group bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden hover:shadow-lg hover:border-gold-500 transition-all duration-300 flex flex-col">
      {/* Image — clickable link */}
      <Link to={'/marketplace/' + product.id} className="relative overflow-hidden block">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              'https://via.placeholder.com/400x300?text=' +
              encodeURIComponent(product.name)
          }}
        />
        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-slate-800/90 backdrop-blur-sm text-slate-200 text-xs px-2.5 py-1 rounded-full font-medium border border-slate-700">
          {product.category}
        </span>
        {/* Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm">
              OUT OF STOCK
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={'/marketplace/' + product.id}>
          <h3 className="font-semibold text-slate-100 truncate group-hover:text-gold-300 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-slate-400 mt-0.5">{product.brand}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-gold-400">
            {formatCurrency(product.price)}
          </span>
          <span
            className={
              'text-xs px-2.5 py-1 rounded-full font-medium border ' +
              (product.quantity > 0
                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800'
                : 'bg-red-900/30 text-red-400 border-red-800')
            }
          >
            {product.quantity > 0 ? product.quantity + ' left' : 'Sold Out'}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
          <div className="w-6 h-6 bg-amber-900/30 rounded-full flex items-center justify-center text-xs font-bold text-gold-400 border border-gold-700">
            {product.sellerName ? product.sellerName.charAt(0) : 'S'}
          </div>
          <p className="text-xs text-slate-400">{product.storeName}</p>
        </div>

        {/* Add to Cart Button */}
        {!isOwnProduct && !isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className={
              'mt-3 w-full py-2 rounded-lg text-sm font-medium transition border ' +
              (alreadyInCart
                ? 'bg-slate-900 text-slate-400 border-slate-700 cursor-default'
                : 'bg-amber-900/30 text-gold-400 hover:bg-amber-900/50 border-gold-600')
            }
          >
            {alreadyInCart ? '✓ In Cart' : '🛒 Add to Cart'}
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductCard
