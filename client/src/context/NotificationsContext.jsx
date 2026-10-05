import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { fetchUnreadCount, markAllNotificationsRead } from '../api/notifications'

/*
 * Tracks the count of unread notifications for the signed-in user.
 * Polls every 30s and on window focus so the sidebar badge stays fresh.
 */
const NotificationsContext = createContext(null)

const POLL_MS = 30000

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [unread, setUnread] = useState(0)
  const timerRef = useRef(null)

  const refresh = useCallback(async () => {
    if (!localStorage.getItem('inkspace_token')) {
      setUnread(0)
      return
    }
    try {
      const data = await fetchUnreadCount()
      setUnread(data?.unreadCount || 0)
    } catch {
      /* offline / logged out — keep the last known value */
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0)
      return undefined
    }

    refresh()
    timerRef.current = setInterval(refresh, POLL_MS)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(timerRef.current)
      window.removeEventListener('focus', onFocus)
    }
  }, [isAuthenticated, refresh])

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead()
    } catch {
      /* non-fatal */
    }
    setUnread(0)
  }, [])

  const value = { unread, refresh, setUnread, markAllRead }

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>')
  return ctx
}
