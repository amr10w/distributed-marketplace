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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar
