import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { formatCurrency, formatDate } from '../../lib/utils'
import ConfirmModal from '../../components/common/ConfirmModal'
import SkeletonTable from '../../components/common/SkeletonTable'

const MyItemsPage = () => {
  const { user } = useAuth()
  const { products, loading, deleteProduct } = useProducts()
  const toast = useToast()
  const [deleteId, setDeleteId] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  if (loading) return <SkeletonTable rows={5} cols={6} />

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to view your items</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">Go to Login</Link>
      </div>
    )
  }

  const myItems = products.filter((p) => p.sellerId === user.id)

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setShowConfirm(true)
  }

  const confirmDelete = () => {
    if (deleteId) {
      const item = products.find((p) => p.id === deleteId)
      deleteProduct(deleteId)
      toast.success('Deleted "' + (item ? item.name : 'item') + '" successfully')
    }
    setShowConfirm(false)
    setDeleteId(null)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">My Items</h1>
          <p className="text-slate-400 mt-1">Manage your listed products</p>
        </div>
        <Link
          to="/seller/items/new"
          className="bg-gold-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-600 transition flex items-center gap-2 shadow-md"
        >
          + Add New Item
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Items</p>
          <p className="text-2xl font-bold text-slate-100">{myItems.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">In Stock</p>
          <p className="text-2xl font-bold text-emerald-400">{myItems.filter((p) => p.quantity > 0).length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Out of Stock</p>
          <p className="text-2xl font-bold text-red-400">{myItems.filter((p) => p.quantity === 0).length}</p>
        </div>
      </div>

      {myItems.length > 0 ? (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Product</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Category</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Price</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Stock</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">Listed</th>
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
                    <td className="px-6 py-4 text-sm font-medium text-gold-400">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{item.quantity}</td>
                    <td className="px-6 py-4">
                      <span className={
                        'text-xs px-2 py-1 rounded-full font-medium border ' +
                        (item.quantity > 0
                          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800'
                          : 'bg-red-900/30 text-red-400 border-red-800')
                      }>
                        {item.quantity > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={'/seller/items/' + item.id + '/edit'} className="text-gold-400 hover:text-gold-300 text-sm font-medium">
                          Edit
                        </Link>
                        <button onClick={() => handleDeleteClick(item.id)} className="text-red-400 hover:text-red-400 text-sm font-medium">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">No items yet</h3>
          <p className="text-slate-400 mb-4">Start selling by adding your first product</p>
          <Link to="/seller/items/new" className="bg-gold-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gold-600 transition shadow-md">
            Add Your First Item
          </Link>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => { setShowConfirm(false); setDeleteId(null) }}
      />
    </div>
  )
}

export default MyItemsPage
