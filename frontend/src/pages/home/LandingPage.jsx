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
    <div className="min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-2xl font-bold text-gold-400"> MarketPlace</span>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/marketplace"
                className="bg-gold-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gold-600 transition shadow-md"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-gold-300 font-medium px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gold-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gold-600 transition shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gold-600 via-gold-500 to-gold-700 text-white overflow-hidden">
        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 islamic-pattern opacity-30"></div>

        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300"></div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-block bg-slate-800/10 backdrop-blur-sm text-gold-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-400/30">
              🎓 CSE352s - Distributed Systems Project
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The Distributed
              <br />
              <span className="text-gold-300">Online Marketplace</span>
            </h1>
            <p className="text-xl text-gold-200 mb-8 max-w-2xl">
              Buy and sell products in a peer-to-peer marketplace powered by distributed systems. 
              Create your store, list products, and trade with other users securely.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={user ? '/marketplace' : '/register'}
                className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-500 transition shadow-lg shadow-primary-900/40"
              >
                {user ? 'Browse Marketplace' : 'Create Free Account'}
              </Link>
              <Link
                to={user ? '/seller/items' : '/login'}
                className="bg-slate-800/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-800/20 transition border border-amber-400/30"
              >
                {user ? 'Start Selling' : 'Login to Account'}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gold accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300"></div>
      </section>

      {/* Stats */}
      <section className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gold-400">{stat.value}</p>
                <p className="text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            {/* Decorative element */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-px bg-amber-400"></div>
              <div className="w-2 h-2 bg-amber-400 rotate-45"></div>
              <div className="w-12 h-px bg-amber-400"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              Everything You Need to Trade
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our marketplace provides all the tools for buyers and sellers to trade efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:shadow-lg hover:border-gold-500 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-amber-900/30 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:bg-amber-900/50 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-px bg-amber-400"></div>
              <div className="w-2 h-2 bg-amber-400 rotate-45"></div>
              <div className="w-12 h-px bg-amber-400"></div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-400">Get started in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up with your email and set up your profile', icon: '👤' },
              { step: '2', title: 'Deposit Funds', desc: 'Add money to your account to start buying', icon: '💳' },
              { step: '3', title: 'Browse & Buy', desc: 'Search products and purchase from other sellers', icon: '🛒' },
              { step: '4', title: 'List & Sell', desc: 'Create your store and list products to sell', icon: '📦' },
            ].map((item, index) => (
              <div key={item.step} className="text-center relative">
                {/* Connector line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-gold-300 to-gold-100"></div>
                )}
                <div className="w-16 h-16 bg-amber-900/30 border-2 border-gold-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 relative z-10">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-gold-400 mb-1">STEP {item.step}</div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-r from-gold-600 to-gold-700 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-20"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300"></div>

        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-gold-200 mb-8 max-w-2xl mx-auto">
            Join our marketplace today and start buying and selling products with other users.
          </p>
          <Link
            to={user ? '/marketplace' : '/register'}
            className="inline-block bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-500 transition shadow-lg shadow-primary-900/40"
          >
            {user ? 'Go to Marketplace' : 'Create Your Account'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-xl font-bold text-white"> MarketPlace</span>
              <p className="text-sm mt-1 text-slate-500">Distributed Online Marketplace System</p>
            </div>
            <div className="text-sm text-center md:text-right text-slate-500">
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
