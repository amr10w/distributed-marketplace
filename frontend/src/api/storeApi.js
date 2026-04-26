import wsClient from './wsClient'

const parsePayload = (envelope) => {
  try {
    return JSON.parse(envelope.Payload)
  } catch {
    return {}
  }
}

export const storeApi = {
  createStore: async ({ requestingUserId, storeName, description, logoUrl }) => {
    const envelope = await wsClient.send('CREATE_STORE', {
      RequestingUserId: requestingUserId,
      StoreName: storeName,
      Description: description ?? null,
      LogoUrl: logoUrl ?? null,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'CREATE_STORE_SUCCESS' && data.Success) {
      return {
        success: true,
        storeId: data.StoreId,
        storeName: data.StoreName,
      }
    }
    return {
      success: false,
      error: data.Message || 'Failed to create store',
    }
  },
}
