import { useState, useEffect, useCallback } from 'react'
import transactionsData from '../mocks/transactions.json'

const STORAGE_KEY = 'marketplace_transactions'

const getInitialTransactions = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading transactions from localStorage:', error)
  }
  return transactionsData
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState(getInitialTransactions)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error)
    }
  }, [transactions])

  const addTransaction = useCallback((transaction) => {
    const maxId = transactions.reduce((max, t) => Math.max(max, t.id), 0)
    const newTransaction = {
      ...transaction,
      id: maxId + 1,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    }
    setTransactions((prev) => [newTransaction, ...prev])
    return newTransaction
  }, [transactions])

  const getTransactionsByUser = useCallback((userId) => {
    return transactions.filter(
      (t) =>
        t.buyerId === userId ||
        t.sellerId === userId ||
        t.userId === userId
    )
  }, [transactions])

  const getPurchasesByUser = useCallback((userId) => {
    return transactions.filter(
      (t) => t.type === 'PURCHASE' && t.buyerId === userId
    )
  }, [transactions])

  const getSalesByUser = useCallback((userId) => {
    return transactions.filter(
      (t) => t.type === 'PURCHASE' && t.sellerId === userId
    )
  }, [transactions])

  const getDepositsByUser = useCallback((userId) => {
    return transactions.filter(
      (t) => t.type === 'DEPOSIT' && t.userId === userId
    )
  }, [transactions])

  const resetTransactions = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setTransactions(transactionsData)
  }, [])

  return {
    transactions,
    addTransaction,
    getTransactionsByUser,
    getPurchasesByUser,
    getSalesByUser,
    getDepositsByUser,
    resetTransactions,
  }
}
