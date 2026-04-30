import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productsApi } from '../../api/productsApi'
import ProductCard from '../../components/common/ProductCard'
import SkeletonCard from '../../components/common/SkeletonCard'
import Pagination from '../../components/common/Pagination'
import SearchFilters from '../../components/common/SearchFilters'

const ITEMS_PER_PAGE = 8

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
    if (!query) {
      setResults([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    setCurrentPage(1)
    productsApi.searchItems(query).then((result) => {
      if (cancelled) return
      if (result.success) {
        setResults(result.items)
      } else {
        setError(result.error)
        setResults([])
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [query])

  let filtered = [...results]

  if (advancedFilters.category !== 'All') {
    filtered = filtered.filter((p) => p.category === advancedFilters.category)
  }
  if (advancedFilters.minPrice !== '') {
    filtered = filtered.filter((p) => p.price >= parseFloat(advancedFilters.minPrice))
  }
  if (advancedFilters.maxPrice !== '') {
    filtered = filtered.filter((p) => p.price <= parseFloat(advancedFilters.maxPrice))
  }
  if (advancedFilters.inStockOnly) {
    filtered = filtered.filter((p) => p.quantity > 0)
  }
  if (advancedFilters.seller !== '') {
    const sellerLower = advancedFilters.seller.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.sellerName.toLowerCase().includes(sellerLower) ||
        p.storeName.toLowerCase().includes(sellerLower)
    )
  }

  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price)
  else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price)
  else if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name))
  else if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedResults = filtered.slice(
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
          <h1 className="text-3xl font-bold text-slate-100">Search Results</h1>
          <p className="text-slate-400 mt-1">
            {loading
              ? 'Searching...'
              : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "`}
            {!loading && <span className="font-medium text-slate-200">{query}</span>}
            {!loading && '"'}
          </p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-800 text-slate-100"
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
        totalResults={filtered.length}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-red-800">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">Search failed</h3>
          <p className="text-slate-400">{error}</p>
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
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">No products found</h3>
          <p className="text-slate-400">
            Try different keywords or adjust your filters
          </p>
        </div>
      )}
    </div>
  )
}

export default SearchResultsPage
