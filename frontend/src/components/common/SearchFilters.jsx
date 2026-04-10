import { useState } from 'react'
import { PRODUCT_CATEGORIES } from '../../lib/constants'

const SearchFilters = ({ onApplyFilters, totalResults }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: 'All',
    minPrice: '',
    maxPrice: '',
    inStockOnly: false,
    seller: '',
  })

  const handleChange = (field, value) => {
    const updated = { ...filters, [field]: value }
    setFilters(updated)
    onApplyFilters(updated)
  }

  const resetFilters = () => {
    const defaults = {
      category: 'All',
      minPrice: '',
      maxPrice: '',
      inStockOnly: false,
      seller: '',
    }
    setFilters(defaults)
    onApplyFilters(defaults)
  }

  const hasActiveFilters = filters.category !== 'All' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.inStockOnly ||
    filters.seller !== ''

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <span>🔍</span>
          <span>Advanced Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
              Active
            </span>
          )}
        </div>
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Price ($)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Price ($)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                placeholder="Any"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Seller Name</label>
              <input
                type="text"
                value={filters.seller}
                onChange={(e) => handleChange('seller', e.target.value)}
                placeholder="Any seller"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => handleChange('inStockOnly', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchFilters
