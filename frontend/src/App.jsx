import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

import LandingPage from './pages/home/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import BrowsePage from './pages/marketplace/BrowsePage'
import SearchResultsPage from './pages/marketplace/SearchResultsPage'
import ProductDetailPage from './pages/marketplace/ProductDetailPage'
import CartCheckoutPage from './pages/marketplace/CartCheckoutPage'

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

import SettingsPage from './pages/settings/SettingsPage'
import NotFoundPage from './pages/error/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<MainLayout />}>
                <Route path="/marketplace" element={<BrowsePage />} />
                <Route path="/marketplace/search" element={<SearchResultsPage />} />
                <Route path="/marketplace/:id" element={<ProductDetailPage />} />
                <Route path="/store/:storeId" element={<PublicStorePage />} />

                <Route path="/cart/checkout" element={
                  <ProtectedRoute><CartCheckoutPage /></ProtectedRoute>
                } />

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

                <Route path="/store/settings" element={
                  <ProtectedRoute><StoreSettingsPage /></ProtectedRoute>
                } />

                <Route path="/account" element={
                  <ProtectedRoute><AccountOverviewPage /></ProtectedRoute>
                } />
                <Route path="/account/deposit" element={
                  <ProtectedRoute><DepositPage /></ProtectedRoute>
                } />
                <Route path="/account/transactions" element={
                  <ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>
                } />

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

                <Route path="/settings" element={
                  <ProtectedRoute><SettingsPage /></ProtectedRoute>
                } />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App