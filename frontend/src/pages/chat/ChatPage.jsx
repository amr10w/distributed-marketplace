import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { chatApi } from '../../api/chatApi'

const formatTime = (iso) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const ChatPage = () => {
  const { userId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const otherUserId = useMemo(() => parseInt(userId, 10), [userId])
  const otherName = searchParams.get('name') || `User #${otherUserId}`

  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)

  const isSelfChat = user && user.id === otherUserId

  useEffect(() => {
    if (!user || !Number.isFinite(otherUserId) || isSelfChat) return
    let cancelled = false
    setLoading(true)
    setError('')

    const unsubscribe = chatApi.onReceiveChat((message) => {
      if (
        (message.senderId === otherUserId && message.receiverId === user.id) ||
        (message.senderId === user.id && message.receiverId === otherUserId)
      ) {
        setMessages((prev) => {
          if (message.id && prev.some((m) => m.id === message.id)) return prev
          return [...prev, message]
        })
      }
    })

    chatApi.registerSocket(user.id).then(() => {
      if (cancelled) return
      chatApi.getHistory(user.id, otherUserId).then((res) => {
        if (cancelled) return
        if (res.success) {
          setMessages(res.messages)
        } else {
          setError(res.error || 'Failed to load chat history')
        }
        setLoading(false)
      })
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [user, otherUserId, isSelfChat])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-slate-200">Please login to chat</h3>
        <Link to="/login" className="text-gold-400 hover:underline mt-2 inline-block">
          Go to Login
        </Link>
      </div>
    )
  }

  if (!Number.isFinite(otherUserId)) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-semibold text-slate-200">Invalid user</h3>
        <Link to="/marketplace" className="text-gold-400 hover:underline mt-2 inline-block">
          Back to Marketplace
        </Link>
      </div>
    )
  }

  if (isSelfChat) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🪞</div>
        <h3 className="text-xl font-semibold text-slate-200">You can't chat with yourself</h3>
        <Link to="/marketplace" className="text-gold-400 hover:underline mt-2 inline-block">
          Back to Marketplace
        </Link>
      </div>
    )
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const content = draft.trim()
    if (!content || sending) return

    setSending(true)
    setError('')
    const optimistic = {
      id: `tmp-${Date.now()}`,
      senderId: user.id,
      receiverId: otherUserId,
      content,
      sentAt: new Date().toISOString(),
      isRead: false,
      _pending: true,
    }
    setMessages((prev) => [...prev, optimistic])
    setDraft('')

    try {
      const res = await chatApi.sendMessage(otherUserId, content)
      if (!res.success) {
        setError(res.error || 'Failed to send')
        toast.error(res.error || 'Failed to send message')
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
        setDraft(content)
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimistic.id ? { ...m, id: res.messageId, _pending: false } : m
          )
        )
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="text-gold-400 hover:text-gold-300 font-medium mb-4 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 flex flex-col h-[70vh]">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-600 rounded-full flex items-center justify-center text-white font-bold">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">{otherName}</h1>
            <p className="text-xs text-slate-400">Real-time chat</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading ? (
            <p className="text-center text-slate-400 mt-8">Loading conversation...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-slate-400 mt-8">
              No messages yet. Say hello 👋
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === user.id
              return (
                <div
                  key={m.id}
                  className={'flex ' + (mine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={
                      'max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ' +
                      (mine
                        ? 'bg-gold-600 text-white rounded-br-sm'
                        : 'bg-slate-900 text-slate-100 border border-slate-700 rounded-bl-sm') +
                      (m._pending ? ' opacity-60' : '')
                    }
                  >
                    <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
                    <p
                      className={
                        'text-[10px] mt-1 ' +
                        (mine ? 'text-gold-100/80 text-right' : 'text-slate-500')
                      }
                    >
                      {formatTime(m.sentAt)}
                      {m._pending ? ' • sending…' : ''}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border-t border-red-800 text-red-400 px-6 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSend} className="border-t border-slate-700 px-4 py-3 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="bg-gold-500 text-white px-5 py-2 rounded-lg font-medium hover:bg-gold-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {sending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage
