export const authApi = {
  login: async (email, password) => {
    return { email, password }
  },
  register: async (userData) => {
    return userData
  },
  logout: async () => {
    return true
  },
}
