import { createContext, useState, useCallback, useEffect, useContext } from 'react'
import { AuthContext } from './AuthContext'
import { cartApi } from '../api/cartApi'

export const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)

  // Load cart from backend whenever the logged-in user changes
  useEffect(() => {
    if (!user) {
      setCartItems([])
      return
    }
    let cancelled = false
    setCartLoading(true)
    cartApi.getCart(user.id).then((result) => {
      if (cancelled) return
      if (result.success) setCartItems(result.items)
      setCartLoading(false)
    })
    return () => { cancelled = true }
  }, [user?.id])

  const addToCart = useCallback((product, quantity = 1) => {
    if (!user) return
    // Optimistic update
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === product.id)
      if (exists) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, cartQuantity: Math.min(i.cartQuantity + quantity, product.quantity) }
            : i
        )
      }
      return [...prev, { ...product, cartQuantity: Math.min(quantity, product.quantity) }]
    })
    // Persist to backend (fire-and-forget; backend validates stock)
    cartApi.addToCart(user.id, product.id, quantity).then((result) => {
      if (!result.success) {
        // Revert optimistic add
        setCartItems((prev) => {
          const item = prev.find((i) => i.id === product.id)
          if (!item) return prev
          if (item.cartQuantity <= quantity) return prev.filter((i) => i.id !== product.id)
          return prev.map((i) =>
            i.id === product.id ? { ...i, cartQuantity: i.cartQuantity - quantity } : i
          )
        })
      }
    })
  }, [user])

  const removeFromCart = useCallback((productId) => {
    if (!user) return
    // Optimistic update
    setCartItems((prev) => prev.filter((i) => i.id !== productId))
    // Persist
    cartApi.removeFromCart(user.id, productId).then((result) => {
      if (!result.success) {
        // Reload cart from server to restore correct state
        cartApi.getCart(user.id).then((r) => { if (r.success) setCartItems(r.items) })
      }
    })
  }, [user])

  const updateCartQuantity = useCallback((productId, newQuantity) => {
    if (!user) return
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    // Optimistic update
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === productId ? { ...i, cartQuantity: Math.min(newQuantity, i.quantity) } : i
      )
    )
    // Persist
    cartApi.updateQuantity(user.id, productId, newQuantity).then((result) => {
      if (!result.success) {
        cartApi.getCart(user.id).then((r) => { if (r.success) setCartItems(r.items) })
      }
    })
  }, [user, removeFromCart])

  // Called after successful checkout — cart already cleared on server
  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0)
  }, [cartItems])

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.cartQuantity, 0)
  }, [cartItems])

  const isInCart = useCallback(
    (productId) => cartItems.some((i) => i.id === productId),
    [cartItems]
  )

  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), [])
  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isInCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
