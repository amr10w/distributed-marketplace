import { useState, useEffect } from 'react'
import productsData from '../mocks/products.json'

export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setProducts(productsData)
    setLoading(false)
  }, [])

  const searchProducts = (query) => {
    const lower = query.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower)
    )
  }

  const getProductById = (id) => {
    return products.find((p) => p.id === parseInt(id))
  }

  const getProductsBySeller = (sellerId) => {
    return products.filter((p) => p.sellerId === parseInt(sellerId))
  }

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: products.length + 1,
      createdAt: new Date().toISOString(),
      status: 'AVAILABLE',
    }
    setProducts((prev) => [...prev, newProduct])
    return newProduct
  }

  const updateProduct = (id, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === parseInt(id) ? { ...p, ...updates } : p))
    )
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== parseInt(id)))
  }

  return {
    products,
    loading,
    searchProducts,
    getProductById,
    getProductsBySeller,
    addProduct,
    updateProduct,
    deleteProduct,
  }
}
