export const authApi = {
  login: async (username, password) => {
    const envelope = await wsClient.send('LOGIN', {
      Username: username,
      Password: password,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'LOGIN_SUCCESS' && data.Success) {
      return {
        success: true,
        userId: data.UserId,
        username: data.Username,
        storeId: data.StoreId ?? null,
        storeName: data.StoreName ?? '',
      }
    }
    return {
      success: false,
      error: data.Message || 'Failed to login',
    }
  },


  register: async ({ username, email, password }) => {
    const envelope = await wsClient.send('CREATE_ACCOUNT', {
      Username: username,
      Password: password,
      Email: email,
    })
    const data = parsePayload(envelope)
    if (envelope.Command === 'CREATE_ACCOUNT_SUCCESS' && data.Success) {
      return { success: true, userId: data.UserId }
    }
    return {
      success: false,
      error: data.Message || 'Failed to create account',
    }
  },
  
  logout: async () => {
    return true
  },
}