import wsClient from './wsClient'
import { CATEGORY_NAMES } from '../lib/constants'

const parsePayload = (envelope) => {
  try {
    return JSON.parse(envelope.Payload)
  } catch {
    return {}
  }
}

const mapItem = (item) => ({
  id: item.ItemId,
  storeId: item.StoreId,
  storeName: item.StoreName || '',
  sellerId: item.SellerId,
  sellerName: item.StoreName || '',
  categoryId: item.CategoryId,
  category: CATEGORY_NAMES[item.CategoryId] || 'Unknown',
  name: item.Name,
  brand: item.Brand || '',
  description: item.Description || '',
  price: Number(item.Price),
  quantity: item.StockQuantity,
  image: item.ImageUrl || '',
  status: item.Status,
  createdAt: item.CreatedAt,
  updatedAt: item.UpdatedAt,
})

export const productsApi = {
  getAllItems: async () => {
    const envelope = await wsClient.send('GET_ALL_ITEMS', {})
    const data = parsePayload(envelope)
    if (envelope.Command === 'GET_ALL_ITEMS_SUCCESS') {
      const items = Array.isArray(data.Items) ? data.Items.map(mapItem) : []
      return { success: true, items }
    }
    return { success: false, error: data.Message || 'Failed to load items', items: [] }
  },

  getItemById: async (itemId) => {
    const envelope = await wsClient.send('GET_ITEM_BY_ID', { ItemId: parseInt(itemId) })
    const data = parsePayload(envelope)
    if (envelope.Command === 'GET_ITEM_SUCCESS') {
      return { success: true, item: mapItem(data) }
    }
    return { success: false, error: data.Message || 'Item not found' }
  },

  searchItems: async (searchTerm) => {
    const envelope = await wsClient.send('SEARCH_ITEMS', { SearchTerm: searchTerm })
    const data = parsePayload(envelope)
    if (envelope.Command === 'SEARCH_ITEMS_SUCCESS') {
      const items = Array.isArray(data.Items) ? data.Items.map(mapItem) : []
      return { success: true, items }
    }
    return { success: false, error: data.Message || 'Search failed', items: [] }
  },
}
