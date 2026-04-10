import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import ProductCard from '../../components/common/ProductCard'
import SkeletonCard from '../../components/common/SkeletonCard'
import Pagination from '../../components/common/Pagination'
import SearchFilters from '../../components/common/SearchFilters'

const ITEMS_PER_PAGE = 8

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { searchProducts } = useProducts()
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('relevance')
  const [advancedFilters, setAdvancedFilters] = useState({
    category: 'All',
    minPrice: '',
    maxPrice: '',
    inStockOnly: false,
    seller: '',
  })

  useEffect(() => {
    setLoading(true)
    setCurrentPage(1)
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [query])

  let results = searchProducts(query)

  if (advancedFilters.category !== 'All') {
    results = results.filter((p) => p.category === advancedFilters.category)
  }
  if (advancedFilters.minPrice !== '') {
    results = results.filter((p) => p.price >= parseFloat(advancedFilters.minPrice))
  }
  if (advancedFilters.maxPrice !== '') {
    results = results.filter((p) => p.price <= parseFloat(advancedFilters.maxPrice))
  }
  if (advancedFilters.inStockOnly) {
    results = results.filter((p) => p.quantity > 0)
  }
  if (advancedFilters.seller !== '') {
    const sellerLower = advancedFilters.seller.toLowerCase()
    results = results.filter(
      (p) =>
        p.sellerName.toLowerCase().includes(sellerLower) ||
        p.storeName.toLowerCase().includes(sellerLower)
    )
  }

  if (sortBy === 'price-low') results.sort((a, b) => a.price - b.price)
  else if (sortBy === 'price-high') results.sort((a, b) => b.price - a.price)
  else if (sortBy === 'name') results.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortBy === 'newest') results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE)
  const paginatedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
          <p className="text-gray-500 mt-1">
            {results.length} result{results.length !== 1 ? 's' : ''} for "<span className="font-medium text-gray-700">{query}</span>"
          </p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="relevance">Most Relevant</option>
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      <SearchFilters
        onApplyFilters={(filters) => {
          setAdvancedFilters(filters)
          setCurrentPage(1)
        }}
        totalResults={results.length}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : paginatedResults.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">
            Try different keywords or adjust your filters
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchResultsPage
