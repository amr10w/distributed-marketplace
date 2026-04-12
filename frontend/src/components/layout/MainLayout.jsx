import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'
import Breadcrumbs from '../common/Breadcrumbs'
import CartDrawer from '../common/CartDrawer'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />
      <CartDrawer />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default MainLayout