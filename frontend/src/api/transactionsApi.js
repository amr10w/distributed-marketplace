import wsClient from './wsClient'

const parsePayload = (envelope) => {
  try {
    return JSON.parse(envelope.Payload)
  } catch {
    return {}
  }
}

const mapTransaction = (t) => ({
  id: t.TransactionId,
  buyerId: t.BuyerId,
  buyerName: t.BuyerName || '',
  sellerId: t.SellerId ?? null,
  sellerName: t.SellerName || '',
  itemId: t.ItemId ?? null,
  productName: t.ItemName || '',
  amount: Number(t.Amount),
  type: t.TransactionType?.toUpperCase() || 'PURCHASE',
  status: t.Status?.toUpperCase() || 'COMPLETED',
  createdAt: t.CreatedAt,
})

export const transactionsApi = {
  getByUser: async (userId) => {
    const envelope = await wsClient.send('GET_USER_TRANSACTIONS', { UserId: userId })
    const data = parsePayload(envelope)
    if (envelope.Command === 'GET_USER_TRANSACTIONS_SUCCESS') {
      const transactions = Array.isArray(data.Transactions)
        ? data.Transactions.map(mapTransaction)
        : []
      return { success: true, transactions }
    }
    return { success: false, error: data.Message || 'Failed to load transactions', transactions: [] }
  },
}
