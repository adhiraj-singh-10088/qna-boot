import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import AppLayout from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { useMessages } from "../context/MessagesContext"
import { fetchFollowing } from "../api/users"

function formatTime(iso) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function lastMessage(conv) {
  return conv.lastMessage || (conv.messages && conv.messages[conv.messages.length - 1]) || null
}

function Avatar({ peer, size = "w-11 h-11", text = "text-base" }) {
  if (peer?.avatarUrl) {
    return <img src={peer.avatarUrl} alt={peer.name} className={`${size} rounded-full object-cover flex-shrink-0 ring-1 ring-[#3a3329]`} />
  }
  return (
    <span className={`${size} rounded-full bg-[#2a2a2a] flex-shrink-0 flex items-center justify-center text-[#c9a84c] font-bold ring-1 ring-[#3a3329] ${text}`}>
      {(peer?.name || "?").charAt(0)}
    </span>
  )
}

export default function MessagesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { conversations, loadThread, markRead, sendMessage } = useMessages()
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState("")
  const [contacts, setContacts] = useState([])
  const threadEndRef = useRef(null)

  /* People the viewer follows — they show up in the inbox even before any
     message exists, so anyone you follow can be messaged directly. */
  useEffect(() => {
    if (!user?.username) return undefined
    let cancelled = false
    fetchFollowing(user.username)
      .then((res) => {
        if (cancelled) return
        setContacts(
          (res?.users || []).map((u) => ({
            id: u.username,
            peer: { name: u.name || u.username, username: u.username, avatarUrl: u.avatarUrl || null },
          }))
        )
      })
      .catch(() => { if (!cancelled) setContacts([]) })
    return () => { cancelled = true }
  }, [user?.username])

  /* Conversations + followed users, deduped (real history wins) */
  const merged = useMemo(() => {
    const byId = new Map()
    for (const conv of conversations) byId.set(conv.id, conv)
    for (const contact of contacts) {
      if (!byId.has(contact.id)) {
        byId.set(contact.id, {
          id: contact.id,
          peer: contact.peer,
          unread: 0,
          lastMessage: null,
          messages: [],
        })
      }
    }
    return [...byId.values()]
  }, [conversations, contacts])

  const sorted = useMemo(() => {
    return [...merged].sort((a, b) => {
      const aAt = lastMessage(a)?.at
      const bAt = lastMessage(b)?.at
      if (aAt && bAt) return new Date(bAt) - new Date(aAt)
      if (aAt) return -1 /* conversations with history come first */
      if (bAt) return 1
      return (a.peer?.name || a.id).localeCompare(b.peer?.name || b.id)
    })
  }, [merged])

  /* Search box filter: peer name, @username, or the last message text */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((conv) => {
      const peer = conv.peer || {}
      const last = lastMessage(conv)
      return (
        (peer.name || "").toLowerCase().includes(q) ||
        (peer.username || "").toLowerCase().includes(q) ||
        (last?.text || "").toLowerCase().includes(q)
      )
    })
  }, [sorted, search])

  const active = sorted.find((conv) => conv.id === activeId) || null

  useEffect(() => {
    if (!activeId) return
    markRead(activeId)
  }, [activeId, markRead])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [active?.messages.length, activeId])

  function openThread(id) {
    setActiveId(id)
    setDraft("")
    /* Always (re)load — also when re-clicking the open thread — so new
       incoming messages show up without switching conversations. */
    loadThread(id).catch(() => { /* keep the list usable on failure */ })
  }

  async function handleSend(event) {
    event.preventDefault()
    if (!activeId || !draft.trim() || sending) return
    const text = draft
    setDraft("")
    setSending(true)
    try {
      await sendMessage(activeId, text)
    } catch (err) {
      window.alert(err.message || t('messages.sendFailed'))
      setDraft(text)
    } finally {
      setSending(false)
    }
  }

  if (sorted.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
          <span className="w-16 h-16 rounded-2xl border border-[#2a2a2a] flex items-center justify-center text-[#c9a84c] mb-6">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7A2.5 2.5 0 0117.5 16H9l-5 4V6.5z" />
            </svg>
          </span>
          <h1
            className="text-2xl font-semibold text-[#e8e0d4] mb-3"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {t('messages.emptyTitle')}
          </h1>
          <p className="text-[#7a7060] text-[15px] leading-relaxed max-w-sm font-sans-ui">
            {t('messages.emptyText')}
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout wide>
      <div className="h-[calc(100dvh-5.5rem)] md:h-[calc(100vh-3rem)] flex rounded-none md:rounded-2xl overflow-hidden border-y md:border border-[#1f1f1f] bg-[#111111]">

        {/* Conversation list */}
        <aside
          className={`${active ? "hidden md:flex" : "flex"} w-full md:w-72 xl:w-80 flex-col border-r border-[#1f1f1f] bg-[#0e0e0e]`}
        >
          <header className="px-5 py-4 border-b border-[#1f1f1f]">
            <h1
              className="text-[#e8e0d4] text-xl font-bold"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {t('messages.title')}
            </h1>
            <p className="text-[#7a7060] text-xs font-sans-ui mt-0.5">
              {t('messages.subtitle')}
            </p>
          </header>

          {/* Conversation search */}
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#161616] border border-[#2a2a2a] rounded-xl focus-within:border-[#c9a84c33] transition-colors duration-200">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#7a7060] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="M16.5 16.5L21 21" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('messages.searchPlaceholder')}
                aria-label={t('messages.searchPlaceholder')}
                className="flex-1 bg-transparent text-[#e8e0d4] text-sm placeholder:text-[#5c564c] outline-none font-sans-ui"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-[#7a7060] hover:text-[#e8e0d4] transition-colors"
                  aria-label={t('messages.clearSearch')}
                >
                  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#7a7060] font-sans-ui text-center">
              {t('messages.noResults')}
            </p>
          ) : (
          <ul className="flex-1 overflow-y-auto scrollbar-thin">
            {filtered.map((conv) => {
              const last = lastMessage(conv)
              const isActive = conv.id === activeId
              return (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => openThread(conv.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors duration-200
                      ${isActive ? "bg-[#1f1c16]" : "hover:bg-[#161616]"}`}
                  >
                    <Avatar peer={conv.peer} />
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-sans-ui truncate ${conv.unread ? "text-[#e8e0d4] font-semibold" : "text-[#e8e0d4]"}`}>
                          {conv.peer.name}
                        </span>
                        <span className="text-[11px] text-[#7a7060] font-sans-ui flex-shrink-0">
                          {last ? formatTime(last.at) : ""}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-sans-ui truncate ${conv.unread ? "text-[#c9a84c]" : "text-[#7a7060]"}`}>
                          {last ? (
                            <>
                              {last.from === "me" ? t('messages.youPrefix') : ""}
                              {last.text}
                            </>
                          ) : (
                            t('messages.newConversation')
                          )}
                        </span>
                        {conv.unread > 0 && (
                          <span className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c9a84c] text-[#0e0e0e] text-[10px] font-bold flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          )}
        </aside>

        {/* Thread */}
        <section className={`${active ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0 bg-[#111111]`}>
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <span className="w-14 h-14 rounded-2xl border border-[#2a2a2a] flex items-center justify-center text-[#c9a84c] mb-4">
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7A2.5 2.5 0 0117.5 16H9l-5 4V6.5z" />
                </svg>
              </span>
              <p className="text-[#e8e0d4] font-medium font-sans-ui">{t('messages.inboxTitle')}</p>
              <p className="text-[#7a7060] text-sm font-sans-ui mt-1 max-w-xs">
                {t('messages.inboxText')}
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 px-4 py-3 border-b border-[#1f1f1f]">
                <button
                  type="button"
                  className="md:hidden text-[#7a7060] hover:text-[#e8e0d4] p-1"
                  onClick={() => setActiveId(null)}
                  aria-label={t('messages.back')}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <Avatar peer={active.peer} size="w-9 h-9" text="text-sm" />
                <div className="min-w-0">
                  <p className="text-[#e8e0d4] text-sm font-semibold font-sans-ui truncate">
                    {active.peer.name}
                  </p>
                  <p className="text-[#7a7060] text-xs font-sans-ui">@{active.peer.username}</p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3">
                {active.messages.length === 0 && (
                  <div className="h-full min-h-[40vh] flex flex-col items-center justify-center text-center px-6">
                    <span className="w-12 h-12 rounded-2xl border border-[#2a2a2a] flex items-center justify-center text-[#c9a84c] mb-4">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.6}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7A2.5 2.5 0 0117.5 16H9l-5 4V6.5z" />
                      </svg>
                    </span>
                    <p className="text-[#7a7060] text-sm font-sans-ui max-w-xs">
                      {t('messages.threadStart', { name: active.peer.name.split(" ")[0] })}
                    </p>
                  </div>
                )}
                {active.messages.map((msg) => {
                  const mine = msg.from === "me"
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                          mine
                            ? "bg-[#c9a84c] text-[#0e0e0e] rounded-br-md"
                            : "bg-[#1a1a1a] text-[#e8e0d4] border border-[#2a2a2a] rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm font-sans-ui leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        {msg.postId && (
                          <Link
                            to={`/post/${msg.postId}`}
                            className={`inline-flex items-center gap-1 text-xs font-sans-ui mt-1.5 underline underline-offset-2 ${mine ? "text-[#0e0e0e]/80 hover:text-[#0e0e0e]" : "text-[#c9a84c] hover:text-[#e2c97e]"}`}
                          >
                            {t('messages.openStory')}
                          </Link>
                        )}
                        <p className={`text-[10px] mt-1 font-sans-ui ${mine ? "text-[#0e0e0e]/60" : "text-[#7a7060]"}`}>
                          {formatTime(msg.at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={threadEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-[#1f1f1f] flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend(e)
                    }
                  }}
                  rows={1}
                  placeholder={t('messages.placeholder', { name: active.peer.name.split(" ")[0] })}
                  className="flex-1 resize-none rounded-xl bg-[#161616] border border-[#2a2a2a]
                             px-3 py-2.5 text-sm font-sans-ui text-[#e8e0d4] placeholder:text-[#5c564c]
                             focus:outline-none focus:border-[#c9a84c]/50 max-h-32"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="px-4 py-2.5 rounded-xl bg-[#c9a84c] text-[#0e0e0e] text-sm font-semibold font-sans-ui
                             disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                >
                  {t('messages.send')}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
