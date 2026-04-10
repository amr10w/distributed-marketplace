import { createContext, useState, useEffect } from 'react'
import usersData from '../mocks/users.json'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('marketplace_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const foundUser = usersData.find(
      (u) => u.email === email && u.password === password
    )
    if (foundUser) {
      const userData = { ...foundUser }
      delete userData.password
      setUser(userData)
      localStorage.setItem('marketplace_user', JSON.stringify(userData))
      return { success: true, user: userData }
    }
    return { success: false, error: 'Invalid email or password' }
  }

  const register = (userData) => {
    const exists = usersData.find(
      (u) => u.email === userData.email || u.username === userData.username
    )
    if (exists) {
      return { success: false, error: 'User already exists' }
    }
    const newUser = {
      id: usersData.length + 1,
      ...userData,
      balance: 0,
      storeName: '',
      createdAt: new Date().toISOString(),
    }
    delete newUser.password
    setUser(newUser)
    localStorage.setItem('marketplace_user', JSON.stringify(newUser))
    return { success: true, user: newUser }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('marketplace_user')
  }

  const updateBalance = (amount) => {
    if (user) {
      const updatedUser = { ...user, balance: user.balance + amount }
      setUser(updatedUser)
      localStorage.setItem('marketplace_user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateBalance }}>
      {children}
    </AuthContext.Provider>
  )
}
