import wsClient from './wsClient'

const parsePayload = (envelope) => {
  try {
    return JSON.parse(envelope.Payload)
  } catch {
    return null
  }
}

const normalizeMessage = (raw) => {
  if (!raw) return null
  return {
    id: raw.Id ?? raw.id,
    senderId: raw.SenderId ?? raw.senderId,
    receiverId: raw.ReceiverId ?? raw.receiverId,
    content: raw.Content ?? raw.content ?? '',
    sentAt: raw.SentAt ?? raw.sentAt,
    isRead: raw.IsRead ?? raw.isRead ?? false,
  }
}

export const chatApi = {
  registerSocket: async (userId) => {
    try {
      const envelope = await wsClient.send('REGISTER_SOCKET', { UserId: userId })
      const data = parsePayload(envelope) || {}
      return { success: !!data.Success, message: data.Message }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to register socket' }
    }
  },

  sendMessage: async (receiverId, content) => {
    try {
      const envelope = await wsClient.send('SEND_CHAT', {
        ReceiverId: receiverId,
        Content: content,
      })
      const data = parsePayload(envelope) || {}
      if (!data.Success) {
        return { success: false, error: data.Message || 'Failed to send message' }
      }
      return { success: true, messageId: data.MessageId }
    } catch (error) {
      return { success: false, error: error.message || 'Network error' }
    }
  },

  getHistory: async (userAId, userBId) => {
    try {
      const envelope = await wsClient.send('GET_CHAT_HISTORY', {
        UserAId: userAId,
        UserBId: userBId,
      })
      const data = parsePayload(envelope)
      const list = Array.isArray(data) ? data : []
      return { success: true, messages: list.map(normalizeMessage).filter(Boolean) }
    } catch (error) {
      return { success: false, error: error.message || 'Failed to load history', messages: [] }
    }
  },

  onReceiveChat: (callback) => {
    wsClient.connect().catch(() => {})
    return wsClient.subscribe('RECEIVE_CHAT', (envelope) => {
      const message = normalizeMessage(parsePayload(envelope))
      if (message) callback(message)
    })
  },
}
