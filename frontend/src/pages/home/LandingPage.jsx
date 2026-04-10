import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const LandingPage = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: '🛒',
      title: 'Buy & Sell',
      description: 'List your products and purchase from other sellers in our distributed marketplace',
    },
    {
      icon: '💰',
      title: 'Secure Transactions',
      description: 'Safe money transfers between buyers and sellers with full transaction history',
    },
    {
      icon: '📊',
      title: 'Detailed Reports',
      description: 'Track your sales, purchases, and financial performance with comprehensive reports',
    },
    {
      icon: '🏪',
      title: 'Your Own Store',
      description: 'Create and customize your own store to showcase your products to buyers',
    },
    {
      icon: '🔍',
      title: 'Smart Search',
      description: 'Find products quickly by name, brand, or category with powerful search',
    },
    {
      icon: '📦',
      title: 'Inventory Management',
      description: 'Track stock levels, get low-stock alerts, and manage your product catalog',
    },
  ]

  const stats = [
    { value: '1000+', label: 'Products' },
    { value: '500+', label: 'Sellers' },
    { value: '10K+', label: 'Transactions' },
    { value: '99.9%', label: 'Uptime' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">🛒 MarketPlace</span>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/marketplace"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm text-blue-100 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              🎓 CSE352s - Distributed Systems Project
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The Distributed
              <br />
              Online Marketplace
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              Buy and sell products in a peer-to-peer marketplace powered by distributed systems. 
              Create your store, list products, and trade with other users securely.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={user ? '/marketplace' : '/register'}
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition shadow-lg"
              >
                {user ? 'Browse Marketplace' : 'Create Free Account'}
              </Link>
              <Link
                to={user ? '/seller/items' : '/login'}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition border border-white/20"
              >
                {user ? 'Start Selling' : 'Login to Account'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Trade
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Our marketplace provides all the tools for buyers and sellers to trade efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-500">Get started in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up with your email and set up your profile', icon: '👤' },
              { step: '2', title: 'Deposit Funds', desc: 'Add money to your account to start buying', icon: '💳' },
              { step: '3', title: 'Browse & Buy', desc: 'Search products and purchase from other sellers', icon: '🛒' },
              { step: '4', title: 'List & Sell', desc: 'Create your store and list products to sell', icon: '📦' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-blue-600 mb-1">STEP {item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join our marketplace today and start buying and selling products with other users.
          </p>
          <Link
            to={user ? '/marketplace' : '/register'}
            className="inline-block bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition shadow-lg"
          >
            {user ? 'Go to Marketplace' : 'Create Your Account'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xl font-bold text-white">🛒 MarketPlace</span>
              <p className="text-sm mt-1">Distributed Online Marketplace System</p>
            </div>
            <div className="text-sm text-center md:text-right">
              <p>Ain Shams University - Faculty of Engineering</p>
              <p>CSE352s: Parallel and Distributed Systems - Spring 2026</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
