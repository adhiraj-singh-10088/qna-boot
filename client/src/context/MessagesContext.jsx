import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { fetchConversations, fetchThread, sendMessage as sendMessageApi } from "../api/messages"
import { useAuth } from "./AuthContext"

/*
 * Messages are backed by the server (messages table):
 *   GET  /api/messages/conversations
 *   GET  /api/messages/:username   (marks incoming as read)
 *   POST /api/messages/:username   { content, postId? }
 *
 * Exposed shape (consumed by Sidebar/BottomNav/MessagesPage/ShareModal):
 *   conversations: [{ id: username, peer: { name, username, avatarUrl },
 *                     unread, lastMessage: { text, at, from } | null,
 *                     messages: [{ id, from: 'me'|'them', text, at, postId }] }]
 */

const MessagesContext = createContext(null)

const normalizeMessage = (m) => ({
  id: m.id,
  from: m.mine ? "me" : "them",
  text: m.content,
  at: m.createdAt,
  postId: m.postId || null,
})

export function MessagesProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [conversations, setConversations] = useState([])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) { setConversations([]); return }
    try {
      const res = await fetchConversations()
      const list = res?.conversations || []
      setConversations((prev) =>
        list.map((c) => {
          const existing = prev.find((p) => p.id === c.user.username)
          return {
            id: c.user.username,
            peer: { name: c.user.name, username: c.user.username, avatarUrl: c.user.avatarUrl || null },
            unread: c.unread || 0,
            lastMessage: c.lastMessage
              ? { text: c.lastMessage.content, at: c.lastMessage.createdAt, from: c.lastMessage.mine ? "me" : "them" }
              : null,
            messages: existing?.messages || [],
          }
        })
      )
    } catch {
      /* offline or logged out — keep the previous state */
    }
  }, [isAuthenticated])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const onFocus = () => refresh()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refresh])

  /** Loads a full thread (and marks incoming messages as read server-side). */
  const loadThread = useCallback(async (username) => {
    const res = await fetchThread(username)
    const messages = (res?.messages || []).map(normalizeMessage)
    const last = messages[messages.length - 1]
    setConversations((prev) => {
      const peer = { name: res.user.name, username: res.user.username, avatarUrl: res.user.avatarUrl || null }
      if (prev.some((c) => c.id === username)) {
        return prev.map((c) => (c.id === username ? { ...c, peer, unread: 0, messages } : c))
      }
      return [
        {
          id: username,
          peer,
          unread: 0,
          lastMessage: last ? { text: last.text, at: last.at, from: last.from } : null,
          messages,
        },
        ...prev,
      ]
    })
    return res
  }, [])

  const markRead = useCallback((username) => {
    setConversations((prev) => prev.map((c) => (c.id === username ? { ...c, unread: 0 } : c)))
  }, [])

  const sendMessage = useCallback(async (username, text, postId) => {
    const trimmed = String(text || "").trim()
    if (!trimmed) return null
    const res = await sendMessageApi(username, { content: trimmed, postId })
    const msg = normalizeMessage(res.message)
    setConversations((prev) => {
      if (prev.some((c) => c.id === username)) {
        return prev.map((c) =>
          c.id === username
            ? { ...c, unread: 0, messages: [...c.messages, msg], lastMessage: { text: msg.text, at: msg.at, from: "me" } }
            : c
        )
      }
      return [
        {
          id: username,
          peer: { name: username, username, avatarUrl: null },
          unread: 0,
          messages: [msg],
          lastMessage: { text: msg.text, at: msg.at, from: "me" },
        },
        ...prev,
      ]
    })
    return msg
  }, [])

  const unreadCount = useMemo(
    () => conversations.reduce((sum, conv) => sum + (conv.unread || 0), 0),
    [conversations]
  )

  const value = { conversations, unreadCount, refresh, loadThread, markRead, sendMessage }

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
