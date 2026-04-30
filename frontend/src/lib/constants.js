export const API_BASE_URL = 'http://localhost:8080/api'
export const WS_URL = 'ws://localhost:5100/ws'

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Home',
  'Fashion',
]

export const CATEGORY_IDS = {
  Electronics: 1,
  Home: 2,
  Fashion: 3,
}

export const CATEGORY_NAMES = Object.fromEntries(
  Object.entries(CATEGORY_IDS).map(([name, id]) => [id, name])
)

export const TRANSACTION_TYPES = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  DEPOSIT: 'DEPOSIT',
}

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}
