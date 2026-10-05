import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/AuthContext"
import { fetchFollowing } from "../../api/users"
import { sendMessage } from "../../api/messages"

/**
 * <ShareModal />
 * Modal overlay for sharing an article: copy the permalink, use the native
 * share sheet, or send it to someone you follow (real message, shows up in
 * their Messages inbox with a link back to the story).
 *
 * Props:
 *  isOpen:  boolean  — controls visibility
 *  onClose: () => void
 *  article: { id, title }  — article being shared
 */
export default function ShareModal({ isOpen, onClose, article }) {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const [query,   setQuery]   = useState("")
  const [contacts, setContacts] = useState([])
  const [sending, setSending] = useState({})   // { [userId]: true }
  const [sent,    setSent]    = useState({})   // { [userId]: true }
  const [error,   setError]   = useState("")
  const [copied,  setCopied]  = useState(false)
  const searchRef             = useRef(null)

  /* The public permalink to copy/share for this article */
  const permalink = article?.id
    ? `${window.location.origin}/post/${article.id}`
    : window.location.href

  /* Reset transient state when the modal opens */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 80)
      setQuery("")
      setSent({})
      setSending({})
      setError("")
      setCopied(false)
    }
  }, [isOpen])

  /* Load the people the viewer follows (the Send targets) */
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !user?.username) return undefined
    let cancelled = false
    fetchFollowing(user.username)
      .then((res) => {
        if (cancelled) return
        setContacts(
          (res?.users || []).map((u) => ({
            id: u.id,
            name: u.name || u.username,
            username: u.username,
            avatarUrl: u.avatarUrl || null,
          })),
        )
      })
      .catch(() => { if (!cancelled) setContacts([]) })
    return () => { cancelled = true }
  }, [isOpen, isAuthenticated, user?.username])

  /* Close on Escape key */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    if (isOpen) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  /* Filter contacts by search query */
  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.username.toLowerCase().includes(query.toLowerCase())
  )

  /* Send the story to a contact as a real message */
  const handleSend = async (contact) => {
    if (sending[contact.id] || sent[contact.id]) return
    setError("")
    setSending((prev) => ({ ...prev, [contact.id]: true }))
    try {
      await sendMessage(contact.username, {
        content: article?.title ? `Shared a story: ${article.title}` : "Shared a story with you",
        postId: article?.id,
      })
      setSent((prev) => ({ ...prev, [contact.id]: true }))
    } catch (err) {
      setError(err.message || "Could not send the story.")
    } finally {
      setSending((prev) => ({ ...prev, [contact.id]: false }))
    }
  }

  /* Copy the article permalink (clipboard API with a legacy fallback) */
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(permalink)
    } catch {
      const el = document.createElement("textarea")
      el.value = permalink
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* Native share sheet where available (mobile), copy otherwise */
  async function nativeShare() {
    if (!navigator.share) { copyLink(); return }
    try {
      await navigator.share({
        title: article?.title || "Inkspace",
        url: permalink,
      })
    } catch {
      /* user cancelled the share sheet */
    }
  }

  return (
    /* ── Backdrop ──────────────────────────────────────────────────── */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share article"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* ── Modal panel ────────────────────────────────────────────── */}
      <div
        className="w-full max-w-md bg-[#161616] border border-[#2a2a2a] rounded-2xl
                   overflow-hidden shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
          <h2 className="text-[#e8e0d4] font-semibold text-base font-sans-ui">
            Share
          </h2>
          <button
            onClick={onClose}
            aria-label="Close share modal"
            className="w-8 h-8 flex items-center justify-center rounded-full
                       text-[#7a7060] hover:text-[#e8e0d4] hover:bg-[#2a2a2a]
                       transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Article preview pill */}
        {article?.title && (
          <div className="mx-5 mt-4 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a]
                          rounded-xl flex items-center gap-2">
            <svg viewBox="0 0 20 20" className="w-4 h-4 text-[#c9a84c] flex-shrink-0"
                 fill="currentColor">
              <path d="M4 4h12v2H4V4zm0 4h12v2H4V8zm0 4h7v2H4v-2z"/>
            </svg>
            <p className="text-[#9a9080] text-xs font-sans-ui truncate">{article.title}</p>
          </div>
        )}

        {/* Search input */}
        <div className="px-5 mt-4">
          <div className="flex items-center gap-2 px-3 py-2.5
                          bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl
                          focus-within:border-[#c9a84c30] transition-colors duration-200">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#7a7060] flex-shrink-0"
                 fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7"/>
              <path strokeLinecap="round" d="M16.5 16.5L21 21"/>
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people…"
              className="flex-1 bg-transparent text-[#e8e0d4] text-sm
                         placeholder:text-[#7a7060] outline-none font-sans-ui"
              aria-label="Search contacts"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-[#7a7060] hover:text-[#e8e0d4] transition-colors"
                aria-label="Clear search"
              >
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Send error (if any) */}
        {error && (
          <p className="mx-5 mt-3 rounded-xl bg-red-900/30 border border-red-700/40
                        px-4 py-2.5 text-xs text-red-300 font-sans-ui" role="alert">
            {error}
          </p>
        )}

        {/* Contacts list */}
        <div
          className="mt-3 overflow-y-auto max-h-72 scrollbar-thin px-2 pb-2"
          aria-live="polite"
        >
          {!isAuthenticated ? (
            <p className="text-center text-[#7a7060] text-sm py-8 font-sans-ui px-6">
              Sign in to send stories to the people you follow.
            </p>
          ) : contacts.length === 0 ? (
            <p className="text-center text-[#7a7060] text-sm py-8 font-sans-ui px-6">
              You're not following anyone yet — follow writers to share stories with them.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-[#7a7060] text-sm py-8 font-sans-ui">
              No contacts found
            </p>
          ) : (
            filtered.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl
                           hover:bg-[#1a1a1a] transition-colors duration-150"
              >
                {/* Avatar */}
                {contact.avatarUrl ? (
                  <img
                    src={contact.avatarUrl}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-[#3a3329]"
                  />
                ) : (
                  <span
                    className="w-10 h-10 rounded-full bg-[#2a2a2a] flex-shrink-0
                               flex items-center justify-center
                               text-[#c9a84c] text-sm font-bold ring-1 ring-[#3a3329]"
                  >
                    {contact.name.charAt(0)}
                  </span>
                )}

                {/* Name + handle */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#e8e0d4] text-sm font-medium font-sans-ui truncate">
                    {contact.name}
                  </p>
                  <p className="text-[#7a7060] text-xs font-sans-ui truncate">
                    @{contact.username}
                  </p>
                </div>

                {/* Send button — real message via POST /api/messages/:username */}
                <button
                  onClick={() => handleSend(contact)}
                  disabled={sent[contact.id] || sending[contact.id]}
                  aria-label={sent[contact.id] ? "Sent" : `Send to ${contact.name}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold font-sans-ui
                              transition-all duration-200 flex-shrink-0
                              ${sent[contact.id]
                                ? "bg-[#2a2a2a] text-[#7a7060] cursor-default"
                                : sending[contact.id]
                                  ? "bg-[#2a2a2a] text-[#7a7060] cursor-wait"
                                  : "bg-[#c9a84c] text-[#0e0e0e] hover:bg-[#e2c97e] hover:scale-[1.02] active:scale-[0.98]"
                              }`}
                >
                  {sent[contact.id] ? "Sent ✓" : sending[contact.id] ? "Sending…" : "Send"}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Copy link + native share row */}
        <div className="px-5 py-4 border-t border-[#1f1f1f] space-y-2">
          <button
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2
                       bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a]
                       text-[#e8e0d4] text-sm font-medium font-sans-ui
                       px-4 py-2.5 rounded-xl transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#c9a84c]" fill="none"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            {copied ? t('common.linkCopied') : t('common.copyLink')}
          </button>
          <button
            onClick={nativeShare}
            className="w-full flex items-center justify-center gap-2
                       bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#2a2a2a]
                       text-[#e8e0d4] text-sm font-medium font-sans-ui
                       px-4 py-2.5 rounded-xl transition-all duration-200"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#c9a84c]" fill="none"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
            {t('common.share')}
          </button>
        </div>
      </div>
    </div>
  )
}
