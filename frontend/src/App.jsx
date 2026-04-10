import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import BrowsePage from './pages/marketplace/BrowsePage'
import SearchResultsPage from './pages/marketplace/SearchResultsPage'
import ProductDetailPage from './pages/marketplace/ProductDetailPage'

import MyItemsPage from './pages/seller/MyItemsPage'
import AddEditItemPage from './pages/seller/AddEditItemPage'
import InventoryPage from './pages/seller/InventoryPage'

import StoreSettingsPage from './pages/store/StoreSettingsPage'
import PublicStorePage from './pages/store/PublicStorePage'

import AccountOverviewPage from './pages/account/AccountOverviewPage'
import DepositPage from './pages/account/DepositPage'
import TransactionHistoryPage from './pages/account/TransactionHistoryPage'

import ReportsPage from './pages/reports/ReportsPage'
import TransactionReport from './pages/reports/TransactionReport'
import SalesReport from './pages/reports/SalesReport'
import PurchaseReport from './pages/reports/PurchaseReport'

import NotFoundPage from './pages/error/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main Layout Routes */}
            <Route element={<MainLayout />}>
              {/* Public */}
              <Route path="/" element={<Navigate to="/marketplace" />} />
              <Route path="/marketplace" element={<BrowsePage />} />
              <Route path="/marketplace/search" element={<SearchResultsPage />} />
              <Route path="/marketplace/:id" element={<ProductDetailPage />} />
              <Route path="/store/:storeId" element={<PublicStorePage />} />

              {/* Protected - Seller */}
              <Route path="/seller/items" element={
                <ProtectedRoute><MyItemsPage /></ProtectedRoute>
              } />
              <Route path="/seller/items/new" element={
                <ProtectedRoute><AddEditItemPage /></ProtectedRoute>
              } />
              <Route path="/seller/items/:id/edit" element={
                <ProtectedRoute><AddEditItemPage /></ProtectedRoute>
              } />
              <Route path="/seller/inventory" element={
                <ProtectedRoute><InventoryPage /></ProtectedRoute>
              } />

              {/* Protected - Store */}
              <Route path="/store/settings" element={
                <ProtectedRoute><StoreSettingsPage /></ProtectedRoute>
              } />

              {/* Protected - Account */}
              <Route path="/account" element={
                <ProtectedRoute><AccountOverviewPage /></ProtectedRoute>
              } />
              <Route path="/account/deposit" element={
                <ProtectedRoute><DepositPage /></ProtectedRoute>
              } />
              <Route path="/account/transactions" element={
                <ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>
              } />

              {/* Protected - Reports */}
              <Route path="/reports" element={
                <ProtectedRoute><ReportsPage /></ProtectedRoute>
              } />
              <Route path="/reports/transactions" element={
                <ProtectedRoute><TransactionReport /></ProtectedRoute>
              } />
              <Route path="/reports/sales" element={
                <ProtectedRoute><SalesReport /></ProtectedRoute>
              } />
              <Route path="/reports/purchases" element={
                <ProtectedRoute><PurchaseReport /></ProtectedRoute>
              } />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
