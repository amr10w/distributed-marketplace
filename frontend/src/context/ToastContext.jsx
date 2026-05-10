import { createContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 4000, options = {}) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type, onClick: options.onClick || null }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const success = useCallback((message) => addToast(message, 'success'), [addToast])
  const error = useCallback((message) => addToast(message, 'error'), [addToast])
  const info = useCallback((message, options) => addToast(message, 'info', 4000, options), [addToast])
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast])

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => {
          const clickable = typeof toast.onClick === 'function'
          const handleClick = () => {
            if (!clickable) return
            toast.onClick()
            removeToast(toast.id)
          }
          return (
            <div
              key={toast.id}
              onClick={clickable ? handleClick : undefined}
              role={clickable ? 'button' : undefined}
              className={
                'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-slide-in ' +
                (clickable ? 'cursor-pointer hover:brightness-110 transition ' : '') +
                (toast.type === 'success'
                  ? 'bg-emerald-900/30 border-emerald-800 text-emerald-300'
                  : toast.type === 'error'
                  ? 'bg-red-900/30 border-red-800 text-red-400'
                  : toast.type === 'warning'
                  ? 'bg-amber-900/30 border-gold-600 text-gold-400'
                  : 'bg-lapis-50 border-lapis-200 text-lapis-800')
              }
            >
              <span className="text-lg">
                {toast.type === 'success' && '✅'}
                {toast.type === 'error' && '❌'}
                {toast.type === 'warning' && '⚠️'}
                {toast.type === 'info' && 'ℹ️'}
              </span>
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeToast(toast.id)
                }}
                className="text-current opacity-50 hover:opacity-100 text-lg leading-none"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export { ToastContext, ToastProvider }
