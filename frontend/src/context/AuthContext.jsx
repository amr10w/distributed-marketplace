import { createContext, useState, useEffect } from 'react'
import usersData from '../mocks/users.json'

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
      const parsed = JSON.parse(savedUser)
      const fresh = allUsers.find((u) => u.id === parsed.id)
      if (fresh) {
        const userData = { ...fresh }
        delete userData.password
        setUser(userData)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(allUsers))
    } catch (error) {
      console.error('Error saving users:', error)
    }
  }, [allUsers])

  const login = (email, password) => {
    const foundUser = allUsers.find(
      (u) => u.email === email && u.password === password
    )
    if (foundUser) {
      const userData = { ...foundUser }
      delete userData.password
      setUser(userData)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      return { success: true, user: userData }
    }
    return { success: false, error: 'Invalid email or password' }
  }

  const register = (userData) => {
    const exists = allUsers.find(
      (u) => u.email === userData.email || u.username === userData.username
    )
    if (exists) {
      return { success: false, error: 'User already exists' }
    }
    const maxId = allUsers.reduce((max, u) => Math.max(max, u.id), 0)
    const newUser = {
      id: maxId + 1,
      ...userData,
      balance: 0,
      storeName: '',
      createdAt: new Date().toISOString(),
    }
    setAllUsers((prev) => [...prev, newUser])

    const safeUser = { ...newUser }
    delete safeUser.password
    setUser(safeUser)
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser))
    return { success: true, user: safeUser }
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

  const updateSellerBalance = (sellerId, amount) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === sellerId ? { ...u, balance: u.balance + amount } : u
      )
    )
  }

  const updateUserStore = (storeName) => {
    if (user) {
      const updatedUser = { ...user, storeName }
      setUser(updatedUser)
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, storeName } : u
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
