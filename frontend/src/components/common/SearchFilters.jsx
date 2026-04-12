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
    <div className="bg-slate-800 rounded-lg border border-slate-700 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-900 transition rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span>🔍</span>
          <span>Advanced Filters</span>
          {hasActiveFilters && (
            <span className="bg-amber-900/30 text-gold-300 text-xs px-2 py-0.5 rounded-full font-medium border border-gold-700">
              Active
            </span>
          )}
        </div>
        <span className="text-slate-500">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-700 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-slate-800 text-slate-100"
              >
                <option value="All">All Categories</option>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Min Price ($)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Max Price ($)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                placeholder="Any"
                min="0"
                className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Seller Name</label>
              <input
                type="text"
                value={filters.seller}
                onChange={(e) => handleChange('seller', e.target.value)}
                placeholder="Any seller"
                className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-slate-100"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) => handleChange('inStockOnly', e.target.checked)}
                  className="w-4 h-4 text-gold-400 rounded focus:ring-gold-500 border-slate-600"
                />
                <span className="text-sm text-slate-200">In Stock Only</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-sm text-red-400 hover:text-red-400 font-medium"
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
