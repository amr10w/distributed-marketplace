import { useState, useEffect } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { useAuth } from '../../hooks/useAuth'
import ProductCard from '../../components/common/ProductCard'
import SkeletonCard from '../../components/common/SkeletonCard'
import Pagination from '../../components/common/Pagination'
import SearchFilters from '../../components/common/SearchFilters'

const ITEMS_PER_PAGE = 8

const BrowsePage = () => {
  const { products } = useProducts()
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [advancedFilters, setAdvancedFilters] = useState({
    category: 'All',
    minPrice: '',
    maxPrice: '',
    inStockOnly: false,
    seller: '',
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  let availableProducts = products.filter(
    (p) => (p.status === 'AVAILABLE' || p.quantity > 0)
  )

  if (user) {
    availableProducts = availableProducts.filter((p) => p.sellerId !== user.id)
  }

  const categories = ['All', ...new Set(products.map((p) => p.category))]

  let filtered = activeCategory === 'All'
    ? availableProducts
    : availableProducts.filter((p) => p.category === activeCategory)

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

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return 0
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setCurrentPage(1)
  }

  const handleFiltersChange = (filters) => {
    setAdvancedFilters(filters)
    setCurrentPage(1)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Browse Products</h1>
          <p className="text-slate-400 mt-1">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} available
            {user ? ' from other sellers' : ''}
          </p>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-800 text-slate-100"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={
              'px-4 py-2 rounded-full text-sm font-medium transition ' +
              (activeCategory === cat
                ? 'bg-gold-500 text-white shadow-md'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-amber-900/30 hover:text-gold-300 hover:border-gold-500')
            }
          >
            {cat}
          </button>
        ))}
      </div>

      <SearchFilters
        onApplyFilters={handleFiltersChange}
        totalResults={filtered.length}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
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
            Try adjusting your filters or search criteria
          </p>
          <button
            onClick={() => {
              setActiveCategory('All')
              setAdvancedFilters({
                category: 'All',
                minPrice: '',
                maxPrice: '',
                inStockOnly: false,
                seller: '',
              })
            }}
            className="mt-4 text-gold-400 hover:underline font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}

export default BrowsePage
