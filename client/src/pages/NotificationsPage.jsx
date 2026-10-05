import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import AppLayout from "../components/layout/AppLayout"
import Loader from "../components/ui/Loader"
import { useNotifications } from "../context/NotificationsContext"
import { fetchNotifications, markNotificationRead } from "../api/notifications"

/* Small glyph per notification type (matches the app's icon-light style) */
const TYPE_GLYPH = {
  like: "♥",
  comment: "💬",
  follow: "👤",
  follow_request: "🔒",
  follow_accepted: "✓",
}

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  if (mins < 1440) return `${Math.floor(mins / 60)}h`
  return `${Math.floor(mins / 1440)}d`
}

/**
 * <NotificationsPage />
 * List of interactions (likes, comments, follows, follow requests/accepts).
 */
export default function NotificationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { refresh: refreshCount, markAllRead, setUnread } = useNotifications()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await fetchNotifications()
      setItems(data?.notifications || [])
      refreshCount()
    } catch (err) {
      setError(err.message || t('notifications.error'))
    } finally {
      setLoading(false)
    }
  }, [refreshCount, t])

  useEffect(() => { load() }, [load])

  const handleOpen = async (n) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))
      // Optimistically drop the badge; reconcile after the PATCH commits
      setUnread((u) => Math.max(0, u - 1))
      markNotificationRead(n.id)
        .then(() => refreshCount())
        .catch(() => refreshCount())
    }
    if (n.post) navigate(`/post/${n.post.id}`)
    else navigate(`/u/${n.actor.username}`)
  }

  const handleMarkAll = async () => {
    await markAllRead()
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })))
  }

  const unread = items.filter((n) => !n.isRead).length

  return (
    <AppLayout>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#e8e0d4] text-2xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>
            {t('notifications.title')}
          </h1>
          {unread > 0 && (
            <p className="text-[#7a7060] text-sm font-sans-ui mt-0.5">
              {unread} · {t('notifications.title')}
            </p>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-xs font-medium font-sans-ui px-3 py-2 rounded-xl
                       bg-[#161616] border border-[#2a2a2a] text-[#7a7060]
                       hover:text-[#e8e0d4] hover:border-[#3a3329] transition-all duration-200"
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </header>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-[#9a9080] text-sm font-sans-ui mb-4">{error}</p>
          <button
            onClick={load}
            className="px-5 py-2.5 rounded-full bg-[#c9a84c] text-[#0e0e0e] text-sm font-semibold font-sans-ui hover:bg-[#e2c97e] transition-colors"
          >
            {t('common.loadMore')}
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="text-4xl mb-3" aria-hidden="true">🔔</span>
          <h2 className="text-[#e8e0d4] text-lg font-semibold mb-1" style={{ fontFamily: "'Georgia', serif" }}>
            {t('notifications.empty')}
          </h2>
          <p className="text-[#7a7060] text-sm font-sans-ui max-w-xs">{t('notifications.emptyText')}</p>
        </div>
      ) : (
        <ul className="space-y-2" aria-live="polite">
          {items.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => handleOpen(n)}
                className={`w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all duration-200
                  ${n.isRead
                    ? "bg-[#111111] border border-[#1f1f1f] hover:border-[#2a2a2a]"
                    : "bg-[#161410] border border-[#3a3020] hover:border-[#c9a84c]/40"}`}
              >
                <span className="w-9 h-9 rounded-full bg-[#2a2218] border border-[#3a3020] flex items-center justify-center
                                 text-[#c9a84c] text-sm flex-shrink-0">
                  {TYPE_GLYPH[n.type] || "•"}
                </span>

                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-sans-ui text-[#c8bea8] leading-snug">
                    <span className="text-[#e8e0d4] font-semibold">{n.actor.name}</span>{" "}
                    {t(`notifications.${n.type}`)}
                    {n.post && (
                      <>
                        {": "}
                        <span className="text-[#c9a84c]">{n.post.title}</span>
                      </>
                    )}
                  </span>
                  <span className="block text-xs text-[#7a7060] font-sans-ui mt-1">@{n.actor.username} · {timeAgo(n.createdAt)}</span>
                </span>

                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#c9a84c] flex-shrink-0 mt-2" aria-label="unread" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  )
}
