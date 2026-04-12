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
        <h3 className="text-xl font-semibold text-slate-200">Store not found</h3>
        <p className="text-slate-400 mt-2">This store does not exist or has been removed</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Store Header */}
      <div className="relative bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl p-8 text-white mb-8 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-20"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300"></div>

        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-slate-800/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl border border-amber-400/30">
              🏪
            </div>
            <div>
              <h1 className="text-3xl font-bold">{store.storeName}</h1>
              <p className="text-gold-200">by {store.ownerName}</p>
            </div>
          </div>
          <p className="text-gold-200 mb-4">{store.description}</p>
          <div className="flex gap-6">
            <div className="bg-slate-800/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
              <p className="text-gold-300 text-xs">Products</p>
              <p className="text-xl font-bold">{storeProducts.length}</p>
            </div>
            <div className="bg-slate-800/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
              <p className="text-gold-300 text-xs">Available</p>
              <p className="text-xl font-bold">{availableProducts.length}</p>
            </div>
            <div className="bg-slate-800/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
              <p className="text-gold-300 text-xs">Member Since</p>
              <p className="text-xl font-bold">
                {new Date(store.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300"></div>
      </div>

      {/* Products */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-100">Products from {store.storeName}</h2>
        <p className="text-slate-400 mt-1">{availableProducts.length} products available</p>
      </div>

      {availableProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">No products available</h3>
          <p className="text-slate-400">This store has no products for sale right now</p>
        </div>
      )}
    </div>
  )
}

export default PublicStorePage
