import wsClient from './wsClient'
import axiosInstance from './axiosInstance' // Added for the REST call

const parsePayload = (envelope) => {
  try {
    return JSON.parse(envelope.Payload)
  } catch {
    return {}
  }
}

export const walletApi = {
  // WEBSOCKET: Left completely untouched as requested!
  getBalance: async (userId) => {
    const envelope = await wsClient.send('GET_WALLET', { UserId: userId })
    const data = parsePayload(envelope)
    if (envelope.Command === 'GET_WALLET_SUCCESS') {
      return { success: true, balance: Number(data.Balance) }
    }
    return { success: false, error: data.Message || 'Failed to get balance', balance: 0 }
  },

  // REST API: Updated to route to the new DepositController
  deposit: async (userId, amount) => {
    try {
      const response = await axiosInstance.post('/wallet/deposit', {
        userId: userId,
        amount: amount
      })
      
      return { 
        success: true, 
        newBalance: Number(response.data.newBalance) 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Deposit failed' 
      }
    }
  },
}
