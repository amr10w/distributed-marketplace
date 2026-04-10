import { Link } from 'react-router-dom'
import { formatCurrency } from '../../lib/utils'

const ProductCard = ({ product }) => {
  return (
    <Link
      to={'/marketplace/' + product.id}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
          {product.category}
        </span>
        {/* Stock Badge */}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5">{product.brand}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(product.price)}
          </span>
          <span
            className={
              'text-xs px-2.5 py-1 rounded-full font-medium ' +
              (product.quantity > 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700')
            }
          >
            {product.quantity > 0 ? product.quantity + ' left' : 'Sold Out'}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
            {product.sellerName ? product.sellerName.charAt(0) : 'S'}
          </div>
          <p className="text-xs text-gray-400">{product.storeName}</p>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
