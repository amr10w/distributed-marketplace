import { createContext, useState, useCallback } from 'react'

export const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                cartQuantity: Math.min(
                  item.cartQuantity + quantity,
                  product.quantity
                ),
              }
            : item
        )
      }
      return [
        ...prev,
        { ...product, cartQuantity: Math.min(quantity, product.quantity) },
      ]
    })
  }, [])

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const updateCartQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId))
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, cartQuantity: Math.min(newQuantity, item.quantity) }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const getCartTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.cartQuantity,
      0
    )
  }, [cartItems])

  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.cartQuantity, 0)
  }, [cartItems])

  const isInCart = useCallback(
    (productId) => {
      return cartItems.some((item) => item.id === productId)
    },
    [cartItems]
  )

  const toggleCart = useCallback(() => {
    setIsCartOpen((prev) => !prev)
  }, [])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  return (
    <CartContext.Provider
      value={{
        cartItems,
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