import { createContext, useState, useEffect } from 'react'
import usersData from '../mocks/users.json'
import { authApi } from '../api/authApi'
import { walletApi } from '../api/walletApi'
import wsClient from '../api/wsClient'

const AuthContext = createContext(null)

const USERS_KEY = 'marketplace_all_users'
const USER_KEY = 'marketplace_user'

const getStoredUsers = () => {
  try {
    const stored = localStorage.getItem(USERS_KEY)
    if (stored) return JSON.parse(stored)
  } catch (error) {
    console.error('Error reading users:', error)
  }
  return usersData
}

const AuthProvider = ({ children }) => {
  const [allUsers, setAllUsers] = useState(getStoredUsers)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        const hydrated = {
          id: parsed.id,
          username: parsed.username || '',
          fullName: parsed.fullName || parsed.username || '',
          email: parsed.email || '',
          balance: typeof parsed.balance === 'number' ? parsed.balance : 0,
          storeId: parsed.storeId,
          storeName: parsed.storeName || '',
          createdAt: parsed.createdAt || new Date().toISOString(),
        }
        setUser(hydrated)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem(USER_KEY)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user) {
      wsClient.setHandshake(null)
      return
    }
    wsClient.setHandshake((ws) => {
      ws.send('REGISTER_SOCKET', { UserId: user.id }).catch(() => {})
    })
  }, [user])

  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(allUsers))
    } catch (error) {
      console.error('Error saving users:', error)
    }
  }, [allUsers])

  const login = async (username, password) => {
    let result
    try {
      result = await authApi.login(username, password)
    } catch (error) {
      return { success: false, error: error.message || 'Network error' }
    }
    if (!result.success) {
      return { success: false, error: result.error }
    }

    const walletResult = await walletApi.getBalance(result.userId)
    const userData = {
      id: result.userId,
      username: result.username,
      fullName: result.username,
      email: '',
      balance: walletResult.success ? walletResult.balance : (result.balance ?? 0),
      storeId: result.storeId || null,
      storeName: result.storeName || '',
      createdAt: new Date().toISOString(),
    }
    setUser(userData)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    return { success: true, user: userData }
  }

  const register = async (userData) => {
    let result
    try {
      result = await authApi.register(userData)
    } catch (error) {
      return { success: false, error: error.message || 'Network error' }
    }
    if (!result.success) {
      return { success: false, error: result.error }
    }

    const newUser = {
      id: result.userId,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      balance: 0,
      storeName: '',
      createdAt: new Date().toISOString(),
    }
    setAllUsers((prev) => [...prev, newUser])
    setUser(newUser)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    return { success: true, user: newUser }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(USER_KEY)
  }

  const updateBalance = (amount) => {
    if (user) {
      const newBalance = user.balance + amount
      const updatedUser = { ...user, balance: newBalance }
      setUser(updatedUser)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, balance: newBalance } : u
        )
      )
    }
  }

  const setBalance = (newBalance) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance }
      setUser(updatedUser)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
    }
  }

  const updateSellerBalance = (sellerId, amount) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === sellerId ? { ...u, balance: u.balance + amount } : u
      )
    )
  }

  const updateUserStore = ({ storeId, storeName }) => {
    if (user) {
      const updatedUser = { ...user, storeId, storeName }
      setUser(updatedUser)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, storeId, storeName } : u
        )
      )
    }
  }

  const getUserById = (id) => {
    const found = allUsers.find((u) => u.id === parseInt(id))
    if (found) {
      const safe = { ...found }
      delete safe.password
      return safe
    }
    return null
  }

  const resetUsers = () => {
    localStorage.removeItem(USERS_KEY)
    localStorage.removeItem(USER_KEY)
    setAllUsers(usersData)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        allUsers,
        login,
        register,
        logout,
        updateBalance,
        setBalance,
        updateSellerBalance,
        updateUserStore,
        getUserById,
        resetUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
