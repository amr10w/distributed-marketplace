import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SearchBar = ({ className }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate('/marketplace/search?q=' + encodeURIComponent(query.trim()))
    }
  }

  return (
    <form onSubmit={handleSearch} className={className}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products by name or brand..."
          className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-slate-100 bg-slate-800 placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gold-600 font-medium transition"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar
