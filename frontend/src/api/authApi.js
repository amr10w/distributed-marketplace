import axiosInstance from './axiosInstance'

export const authApi = {
  login: async (username, password) => {
    try {
      // 1. Send standard HTTP POST to the new REST endpoint
      const response = await axiosInstance.post('/auth/login', {
        username,
        password
      });
      
      const data = response.data;
      
      // 2. Return the exact shape AuthContext expects
      return {
        success: true,
        userId: data.userId,
        username: data.username,
        storeId: data.storeId ?? null,
        storeName: data.storeName ?? '',
      }
    } catch (error) {
      // 3. Axios automatically throws an error for 401 Unauthorized or 400 Bad Request
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to login',
      }
    }
  },
  
  register: async ({ username, email, password }) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        username,
        password,
        email,
      });
      
      const data = response.data;
      
      return { 
        success: true, 
        userId: data.userId 
      }
    } catch (error) {
      // Handles 409 Conflict (username/email taken) or 400 Bad Request
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create account',
      }
    }
  },
  
  logout: async () => {
    return true
  },
}