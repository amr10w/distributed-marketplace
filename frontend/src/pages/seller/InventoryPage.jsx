import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/utils'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const InventoryPage = () => {
  const { user } = useAuth()
  const { products, loading, updateProduct } = useProducts()
  const [editingId, setEditingId] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (loading) return <LoadingSpinner />

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-700">Please login to manage inventory</h3>
        <Link to="/login" className="text-blue-600 hover:underline mt-2 inline-block">Go to Login</Link>
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
    setSuccessMsg('Inventory updated successfully!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditQuantity('')
    setEditPrice('')
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-500 mt-1">Track and update your stock levels</p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{myItems.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Units</p>
          <p className="text-2xl font-bold text-blue-600">{totalUnits}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Inventory Value</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-orange-600">{lowStock.length}</p>
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-orange-800 mb-2">Low Stock Warning</h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item) => (
              <span key={item.id} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                {item.name} ({item.quantity} left)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {myItems.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Price</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Quantity</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Value</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
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
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    ) : (
                      <span className={
                        'text-sm font-medium ' +
                        (item.quantity === 0
                          ? 'text-red-600'
                          : item.quantity <= 5
                          ? 'text-orange-600'
                          : 'text-gray-900')
                      }>
                        {item.quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        'text-xs px-2 py-1 rounded-full font-medium ' +
                        (item.quantity === 0
                          ? 'bg-red-100 text-red-700'
                          : item.quantity <= 5
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700')
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
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No inventory to manage</h3>
          <p className="text-gray-500 mb-4">Add some products first</p>
          <Link
            to="/seller/items/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Add Your First Item
          </Link>
        </div>
      )}
    </div>
  )
}

export default InventoryPage
