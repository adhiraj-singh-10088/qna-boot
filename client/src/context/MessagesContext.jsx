import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "inkspace_inbox"
const MessagesContext = createContext(null)

const DEMO_CONVERSATION_IDS = new Set(["c-meera", "c-james", "c-aisha"])

function loadInbox() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((conv) => conv?.id && !DEMO_CONVERSATION_IDS.has(conv.id))
  } catch {
    return []
  }
}

export function MessagesProvider({ children }) {
  const [conversations, setConversations] = useState(loadInbox)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }, [conversations])

  useEffect(() => {
    function onStorage(event) {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      try {
        const parsed = JSON.parse(event.newValue)
        if (Array.isArray(parsed)) {
          setConversations(parsed.filter((conv) => conv?.id && !DEMO_CONVERSATION_IDS.has(conv.id)))
        }
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const unreadCount = useMemo(
    () => conversations.reduce((sum, conv) => sum + (conv.unread || 0), 0),
    [conversations]
  )

  const markRead = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread: 0 } : conv
      )
    )
  }, [])

  const sendMessage = useCallback((conversationId, text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) return conv
        return {
          ...conv,
          unread: 0,
          messages: [
            ...conv.messages,
            {
              id: `m-${Date.now()}`,
              from: "me",
              text: trimmed,
              at: new Date().toISOString(),
            },
          ],
        }
      })
    )
  }, [])

  const value = { conversations, unreadCount, markRead, sendMessage }

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error("useMessages must be used inside <MessagesProvider>")
  return ctx
}
