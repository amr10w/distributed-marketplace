import wsClient from './wsClient'

const parsePayload = (envelope) => {
  try {
    return JSON.parse(envelope.Payload)
  } catch {
    return {}
  }
}

export const walletApi = {
  getBalance: async (userId) => {
    const envelope = await wsClient.send('GET_WALLET', { UserId: userId })
    const data = parsePayload(envelope)
    if (envelope.Command === 'GET_WALLET_SUCCESS') {
      return { success: true, balance: Number(data.Balance) }
    }
    return { success: false, error: data.Message || 'Failed to get balance', balance: 0 }
  },

  deposit: async (userId, amount) => {
    const envelope = await wsClient.send('DEPOSIT_CASH', {
      UserId: userId,
      Amount: amount,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'DEPOSIT_SUCCESS') {
      return { success: true, newBalance: Number(data.NewBalance) }
    }
    return { success: false, error: data.Message || 'Deposit failed' }
  },
}
