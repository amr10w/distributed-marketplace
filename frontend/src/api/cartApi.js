import wsClient from './wsClient'
import { CATEGORY_NAMES } from '../lib/constants'

const parsePayload = (envelope) => {
  try {
    return JSON.parse(envelope.Payload)
  } catch {
    return {}
  }
}

const mapCartItem = (item) => ({
  id: item.ItemId,
  cartItemId: item.CartItemId,
  storeId: item.StoreId,
  storeName: item.StoreName || '',
  sellerId: item.SellerId,
  sellerName: item.StoreName || '',
  categoryId: item.CategoryId,
  category: CATEGORY_NAMES[item.CategoryId] || 'Unknown',
  name: item.Name,
  brand: item.Brand || '',
  image: item.ImageUrl || '',
  price: Number(item.Price),
  cartQuantity: item.Quantity,
  quantity: item.StockQuantity,
  lineTotal: Number(item.LineTotal),
  isAvailable: item.IsAvailable,
  status: item.Status,
})

export const cartApi = {
  getCart: async (userId) => {
    const envelope = await wsClient.send('GET_USER_CART', { UserId: userId })
    const data = parsePayload(envelope)
    if (envelope.Command === 'GET_USER_CART_SUCCESS') {
      const items = Array.isArray(data.Items) ? data.Items.map(mapCartItem) : []
      return { success: true, items, totalAmount: Number(data.TotalAmount || 0) }
    }
    return { success: false, error: data.Message || 'Failed to load cart', items: [] }
  },

  addToCart: async (userId, itemId, quantity) => {
    const envelope = await wsClient.send('ADD_TO_CART', {
      UserId: userId,
      ItemId: itemId,
      Quantity: quantity,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'ADD_TO_CART_SUCCESS') {
      return { success: true }
    }
    return { success: false, error: data.Message || 'Failed to add to cart' }
  },

  removeFromCart: async (userId, itemId) => {
    const envelope = await wsClient.send('REMOVE_FROM_CART', {
      UserId: userId,
      ItemId: itemId,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'REMOVE_FROM_CART_SUCCESS') {
      return { success: true }
    }
    return { success: false, error: data.Message || 'Failed to remove from cart' }
  },

  updateQuantity: async (userId, itemId, quantity) => {
    const envelope = await wsClient.send('UPDATE_CART_ITEM_QUANTITY', {
      UserId: userId,
      ItemId: itemId,
      Quantity: quantity,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'UPDATE_CART_ITEM_QUANTITY_SUCCESS') {
      return { success: true }
    }
    return { success: false, error: data.Message || 'Failed to update quantity' }
  },

  checkout: async (userId) => {
    const envelope = await wsClient.send('CHECKOUT_CART', { UserId: userId })
    const data = parsePayload(envelope)
    if (envelope.Command === 'CHECKOUT_CART_SUCCESS') {
      return {
        success: true,
        totalAmount: Number(data.TotalAmount),
        remainingBalance: Number(data.RemainingBalance),
      }
    }
    return { success: false, error: data.Message || 'Checkout failed' }
  },
}
