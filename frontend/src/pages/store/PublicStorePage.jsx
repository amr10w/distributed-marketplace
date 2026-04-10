import { useParams } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import ProductCard from '../../components/common/ProductCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import storesData from '../../mocks/stores.json'

const PublicStorePage = () => {
  const { storeId } = useParams()
  const { products, loading } = useProducts()

  if (loading) return <LoadingSpinner />

  const store = storesData.find((s) => s.ownerId === parseInt(storeId))
  const storeProducts = products.filter((p) => p.sellerId === parseInt(storeId))
  const availableProducts = storeProducts.filter((p) => p.quantity > 0)

  if (!store) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏪</div>
        <h3 className="text-xl font-semibold text-gray-700">Store not found</h3>
        <p className="text-gray-500 mt-2">This store does not exist or has been removed</p>
      </div>
    )
  }

  return (
    <div>
      {/* Store Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
            🏪
          </div>
          <div>
            <h1 className="text-3xl font-bold">{store.storeName}</h1>
            <p className="text-blue-100">by {store.ownerName}</p>
          </div>
        </div>
        <p className="text-blue-100 mb-4">{store.description}</p>
        <div className="flex gap-6">
          <div>
            <p className="text-blue-200 text-xs">Products</p>
            <p className="text-xl font-bold">{storeProducts.length}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Available</p>
            <p className="text-xl font-bold">{availableProducts.length}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Member Since</p>
            <p className="text-xl font-bold">
              {new Date(store.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Products from {store.storeName}</h2>
        <p className="text-gray-500 mt-1">{availableProducts.length} products available</p>
      </div>

      {availableProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
          <p className="text-gray-500">This store has no products for sale right now</p>
        </div>
      )}
    </div>
  )
}

export default PublicStorePage
