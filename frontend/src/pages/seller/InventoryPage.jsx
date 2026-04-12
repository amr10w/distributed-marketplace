import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { formatCurrency } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const InventoryPage = () => {
  const { user } = useAuth()
  const { products, loading, updateProduct } = useProducts()
  const toast = useToast()
  const [editingId, setEditingId] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editPrice, setEditPrice] = useState('')

  if (loading) return <LoadingSpinner />

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to manage inventory</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const myItems = products.filter((p) => p.sellerId === user.id)

  const totalValue = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalUnits = myItems.reduce((sum, item) => sum + item.quantity, 0)
  const lowStock = myItems.filter((p) => p.quantity > 0 && p.quantity <= 5)

  const startEditing = (item) => {
    setEditingId(item.id)
    setEditQuantity(item.quantity.toString())
    setEditPrice(item.price.toString())
  }

  const saveEdit = (id) => {
    updateProduct(id, {
      quantity: parseInt(editQuantity),
      price: parseFloat(editPrice),
      status: parseInt(editQuantity) > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
    })
    setEditingId(null)
    toast.success('Inventory updated successfully!')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditQuantity('')
    setEditPrice('')
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-100">Inventory Management</h1>
        <p className="text-slate-400 mt-1">Track and update your stock levels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Products</p>
          <p className="text-2xl font-bold text-slate-100">{myItems.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Units</p>
          <p className="text-2xl font-bold text-gold-400">{totalUnits}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Inventory Value</p>
          <p className="text-2xl font-bold text-gold-400">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-gold-400">{lowStock.length}</p>
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStock.length > 0 && (
        <div className="bg-amber-900/30 border border-gold-600 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gold-400 mb-2">⚠️ Low Stock Warning</h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item) => (
              <span key={item.id} className="bg-amber-900/40 text-gold-400 px-3 py-1 rounded-full text-sm border border-gold-600">
                {item.name} ({item.quantity} left)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {myItems.length > 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Category</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Price</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Quantity</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Value</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {myItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=No+Img' }}
                        />
                        <div>
                          <p className="font-medium text-slate-100">{item.name}</p>
                          <p className="text-sm text-slate-400">{item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{item.category}</td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 px-2 py-1 border border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-900 text-slate-100"
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gold-400">
                          {formatCurrency(item.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="w-20 px-2 py-1 border border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 bg-slate-900 text-slate-100"
                          min="0"
                        />
                      ) : (
                        <span className={
                          'text-sm font-medium ' +
                          (item.quantity === 0
                            ? 'text-red-400'
                            : item.quantity <= 5
                            ? 'text-gold-400'
                            : 'text-slate-100')
                        }>
                          {item.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          'text-xs px-2 py-1 rounded-full font-medium border ' +
                          (item.quantity === 0
                            ? 'bg-red-900/30 text-red-400 border-red-800'
                            : item.quantity <= 5
                            ? 'bg-amber-900/30 text-gold-400 border-gold-700'
                            : 'bg-emerald-900/30 text-emerald-400 border-emerald-800')
                        }
                      >
                        {item.quantity === 0
                          ? 'Out of Stock'
                          : item.quantity <= 5
                          ? 'Low Stock'
                          : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === item.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="text-emerald-400 hover:text-emerald-400 text-sm font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-slate-400 hover:text-slate-200 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(item)}
                          className="text-gold-400 hover:text-gold-300 text-sm font-medium"
                        >
                          Edit Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">No inventory to manage</h3>
          <p className="text-slate-400 mb-4">Add some products first</p>
          <Link
            to="/seller/items/new"
            className="bg-gold-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gold-600 transition shadow-md"
          >
            Add Your First Item
          </Link>
        </div>
      )}
    </div>
  )
}

export default InventoryPage
