import { useState, useEffect, useCallback } from 'react'
import productsData from '../mocks/products.json'

const STORAGE_KEY = 'marketplace_products'

const getInitialProducts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading products from localStorage:', error)
  }
  return productsData
}

export const useProducts = () => {
  const [products, setProducts] = useState(getInitialProducts)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch (error) {
      console.error('Error saving products to localStorage:', error)
    }
  }, [products])

  const searchProducts = useCallback((query) => {
    const lower = query.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower)
    )
  }, [products])

  const getProductById = useCallback((id) => {
    return products.find((p) => p.id === parseInt(id))
  }, [products])

  const getProductsBySeller = useCallback((sellerId) => {
    return products.filter((p) => p.sellerId === parseInt(sellerId))
  }, [products])

  const getProductsExcludingSeller = useCallback((sellerId) => {
    return products.filter((p) => p.sellerId !== parseInt(sellerId) && p.quantity > 0)
  }, [products])

  const addProduct = useCallback((product) => {
    const maxId = products.reduce((max, p) => Math.max(max, p.id), 0)
    const newProduct = {
      ...product,
      id: maxId + 1,
      createdAt: new Date().toISOString(),
      status: product.quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
    }
    setProducts((prev) => [...prev, newProduct])
    return newProduct
  }, [products])

  const updateProduct = useCallback((id, updates) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === parseInt(id)) {
          const updated = { ...p, ...updates }
          if (updates.quantity !== undefined) {
            updated.status = updates.quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'
          }
          return updated
        }
        return p
      })
    )
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== parseInt(id)))
  }, [])

  const reduceStock = useCallback((id, quantity) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === parseInt(id)) {
          const newQuantity = Math.max(0, p.quantity - quantity)
          return {
            ...p,
            quantity: newQuantity,
            status: newQuantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
          }
        }
        return p
      })
    )
  }, [])

  const resetProducts = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setProducts(productsData)
  }, [])

  return {
    products,
    loading,
    searchProducts,
    getProductById,
    getProductsBySeller,
    getProductsExcludingSeller,
    addProduct,
    updateProduct,
    deleteProduct,
    reduceStock,
    resetProducts,
  }
}
