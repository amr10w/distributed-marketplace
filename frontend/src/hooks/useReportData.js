import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { itemsApi } from '../api/itemsApi'
import { transactionsApi } from '../api/transactionsApi'

export const useReportData = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    Promise.all([
      itemsApi.getUserInventory({ ownerId: user.id }),
      transactionsApi.getByUser(user.id),
    ]).then(([itemsResult, txResult]) => {
      if (cancelled) return
      if (itemsResult.success) setItems(itemsResult.items)
      if (txResult.success) setTransactions(txResult.transactions)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [user?.id])

  const sales = transactions.filter(
    (t) => t.type === 'PURCHASE' && t.sellerId === user?.id
  )
  const purchases = transactions.filter(
    (t) => t.type === 'PURCHASE' && t.buyerId === user?.id
  )

  return { items, transactions, sales, purchases, loading }
}
