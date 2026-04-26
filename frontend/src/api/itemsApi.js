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

export const itemsApi = {
  addItem: async ({
    requestingUserId,
    storeId,
    categoryId,
    name,
    brand,
    description,
    price,
    stockQuantity,
    imageUrl,
  }) => {
    const envelope = await wsClient.send('ADD_ITEM', {
      RequestingUserId: requestingUserId,
      StoreId: storeId,
      CategoryId: categoryId,
      Name: name,
      Brand: brand ?? null,
      Description: description ?? null,
      Price: price,
      StockQuantity: stockQuantity,
      ImageUrl: imageUrl ?? null,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'ITEM_ADDED' && data.Success) {
      return { success: true, itemId: data.ItemId }
    }
    return {
      success: false,
      error: data.Message || 'Failed to add item',
    }
  },

  getUserInventory: async ({ ownerId }) => {
    const envelope = await wsClient.send('GET_USER_INVENTORY', {
      OwnerId: ownerId,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'GET_INVENTORY_SUCCESS') {
      const items = Array.isArray(data.Items)
        ? data.Items.filter((i) => i.Status !== 2).map(mapItem)
        : []
      return { success: true, items }
    }
    return {
      success: false,
      error: data.Message || 'Failed to load inventory',
      items: [],
    }
  },

  editItem: async ({
    requestingUserId,
    itemId,
    name,
    description,
    price,
    status,
  }) => {
    const envelope = await wsClient.send('EDIT_ITEM', {
      ItemId: itemId,
      RequestingUserId: requestingUserId,
      Name: name ?? null,
      Description: description ?? null,
      Price: price ?? null,
      Status: status ?? null,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'EDIT_ITEM_SUCCESS' && data.Success) {
      return { success: true, itemId: data.ItemId }
    }
    return {
      success: false,
      error: data.Message || 'Failed to update item',
    }
  },

  deleteItem: async ({ requestingUserId, itemId }) => {
    const envelope = await wsClient.send('DELETE_ITEM', {
      ItemId: itemId,
      RequestingUserId: requestingUserId,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'DELETE_ITEM_SUCCESS' && data.Success) {
      return { success: true, itemId: data.ItemId }
    }
    return {
      success: false,
      error: data.Message || 'Failed to delete item',
    }
  },
}
