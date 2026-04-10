import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import ProductCard from '../../components/common/ProductCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { searchProducts, loading } = useProducts()

  if (loading) return <LoadingSpinner />

  const results = searchProducts(query)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-500 mt-1">
          {results.length} result{results.length !== 1 ? 's' : ''} for "<span className="font-medium text-gray-700">{query}</span>"
        </p>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">
            Try searching with different keywords like product name or brand
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchResultsPage
