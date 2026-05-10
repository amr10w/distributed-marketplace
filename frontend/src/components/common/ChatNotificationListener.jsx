import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { chatApi } from '../../api/chatApi'

const ChatNotificationListener = () => {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!user) return

    chatApi.registerSocket(user.id).catch(() => {})

    const unsubscribe = chatApi.onReceiveChat((message) => {
      if (message.senderId === user.id) return

      const onChatWithSender = location.pathname === '/chat/' + message.senderId
      if (onChatWithSender) return

      const preview =
        message.content.length > 60
          ? message.content.slice(0, 60) + '…'
          : message.content

      toast.info(
        '💬 New message from User #' + message.senderId + ': ' + preview,
        {
          onClick: () => navigate('/chat/' + message.senderId),
        }
      )
    })

    return unsubscribe
  }, [user, location.pathname, toast, navigate])

  return null
}

export default ChatNotificationListener
