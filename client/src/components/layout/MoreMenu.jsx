import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/AuthContext"
import { useNotifications } from "../../context/NotificationsContext"
import { fetchActivity } from "../../api/activity"
import LanguageSwitcher from "../ui/LanguageSwitcher"

const SETTINGS_KEY = "inkspace_settings"

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) return { notifications: true, activityStatus: true, ...JSON.parse(stored) }
  } catch {
    /* ignore */
  }
  return { notifications: true, activityStatus: true }
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  )
}

function IconBookmark() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12v16l-6-3.5L6 20V4z" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 20a2 2 0 01-3.4 0" />
    </svg>
  )
}

function IconActivity() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h3l2-6 4 12 2-6h5" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v8a2 2 0 002 2h4M15 12H8m7 0l3-3m-3 3l3 3" />
    </svg>
  )
}

function Toggle({ on, onToggle, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 py-3 text-left"
    >
      <span className="text-sm font-sans-ui text-[#e8e0d4]">{label}</span>
      <span className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${on ? "bg-[#c9a84c]" : "bg-[#2a2a2a]"}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-[#0e0e0e] transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-1"}`} />
      </span>
    </button>
  )
}

export default function MoreMenu() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { logout, isAuthenticated } = useAuth()
  const { unread } = useNotifications()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState("menu")
  const [activity, setActivity] = useState(null)
  const [settings, setSettings] = useState(loadSettings)
  const rootRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if (!open) return undefined
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
        setView("menu")
      }
    }
    function onKey(event) {
      if (event.key === "Escape") {
        setOpen(false)
        setView("menu")
      }
    }
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  /* Load the user's likes + comments when the activity view opens */
  useEffect(() => {
    if (view !== "activity" || !isAuthenticated) return undefined
    let cancelled = false
    fetchActivity()
      .then((data) => { if (!cancelled) setActivity(data || { likes: [], comments: [] }) })
      .catch(() => { if (!cancelled) setActivity({ likes: [], comments: [] }) })
    return () => { cancelled = true }
  }, [view, isAuthenticated])

  function handleLogout() {
    logout()
    setOpen(false)
    navigate("/login")
  }

  const itemClass =
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans-ui text-[#e8e0d4] hover:bg-[#1a1a1a] transition-colors text-left"

  return (
    <div ref={rootRef} className="relative mt-auto">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev)
          setView("menu")
        }}
        className={`flex items-center gap-4 px-3 py-3 rounded-xl w-full
                    transition-all duration-200
                    ${open ? "bg-[#1f1c16] text-[#c9a84c]" : "text-[#7a7060] hover:bg-[#161616] hover:text-[#e8e0d4]"}`}
        aria-label={t('nav.more')}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="hidden xl:block text-[15px] font-medium">{t('nav.more')}</span>
      </button>

      {open && (
        <div
          className="absolute bottom-14 left-0 z-50 w-[min(100vw-2rem,280px)]
                     bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden"
        >
          {view === "menu" && (
            <div className="p-2">
              {isAuthenticated && (
                <>
                  <button
                    type="button"
                    className={itemClass}
                    onClick={() => {
                      setOpen(false)
                      navigate("/notifications")
                    }}
                  >
                    <IconBell />
                    <span className="flex-1">{t('nav.notifications')}</span>
                    {unread > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#c9a84c] text-[#0e0e0e] text-[10px] font-bold flex items-center justify-center leading-none">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className={itemClass}
                    onClick={() => {
                      setOpen(false)
                      navigate("/profile?tab=Bookmarks")
                    }}
                  >
                    <IconBookmark />
                    {t('nav.saved')}
                  </button>
                  <button type="button" className={itemClass} onClick={() => { setActivity(null); setView("activity") }}>
                    <IconActivity />
                    {t('nav.yourActivity')}
                  </button>
                  <div className="my-1 h-px bg-[#2a2a2a]" />
                </>
              )}
              <button type="button" className={itemClass} onClick={() => setView("settings")}>
                <IconSettings />
                {t('nav.settings')}
              </button>
              {isAuthenticated ? (
                <>
                  <div className="my-1 h-px bg-[#2a2a2a]" />
                  <button
                    type="button"
                    className={`${itemClass} text-red-400 hover:text-red-300`}
                    onClick={handleLogout}
                  >
                    <IconLogout />
                    {t('common.logOut')}
                  </button>
                </>
              ) : (
                <>
                  <div className="my-1 h-px bg-[#2a2a2a]" />
                  <button
                    type="button"
                    className={itemClass}
                    onClick={() => { setOpen(false); navigate("/login") }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                    </svg>
                    {t('common.logIn')}
                  </button>
                  <button
                    type="button"
                    className={itemClass}
                    onClick={() => { setOpen(false); navigate("/") }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8 7a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" />
                    </svg>
                    {t('common.createAccount')}
                  </button>
                </>
              )}
            </div>
          )}

          {view === "settings" && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setView("menu")}
                  className="text-[#7a7060] hover:text-[#e8e0d4] p-1"
                  aria-label={t('common.back')}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-sm font-semibold font-sans-ui text-[#e8e0d4]">{t('nav.settings')}</h2>
              </div>

              {/* Language switcher */}
              <div className="flex items-center justify-between gap-4 py-2">
                <span className="text-sm font-sans-ui text-[#e8e0d4]">{t('nav.language')}</span>
                <LanguageSwitcher />
              </div>

              <Toggle
                label={t('nav.notificationsToggle')}
                on={settings.notifications}
                onToggle={() => setSettings((s) => ({ ...s, notifications: !s.notifications }))}
              />
              <Toggle
                label={t('nav.activityToggle')}
                on={settings.activityStatus}
                onToggle={() => setSettings((s) => ({ ...s, activityStatus: !s.activityStatus }))}
              />
              <p className="text-[11px] text-[#7a7060] font-sans-ui mt-2">{t('nav.settingsHint')}</p>
            </div>
          )}

          {view === "activity" && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setView("menu")}
                  className="text-[#7a7060] hover:text-[#e8e0d4] p-1"
                  aria-label={t('common.back')}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-sm font-semibold font-sans-ui text-[#e8e0d4]">{t('nav.yourActivity')}</h2>
              </div>

              {activity === null ? (
                <p className="text-xs text-[#7a7060] font-sans-ui py-2">{t('common.loading')}</p>
              ) : (
                <div className="max-h-[55vh] overflow-y-auto scrollbar-thin space-y-4 pr-0.5">
                  <div>
                    <h3 className="text-[11px] uppercase tracking-widest text-[#5a5248] font-sans-ui mb-2">
                      {t('activity.likes')}
                    </h3>
                    {activity.likes.length === 0 ? (
                      <p className="text-xs text-[#7a7060] font-sans-ui leading-relaxed">{t('activity.noLikes')}</p>
                    ) : (
                      <ul className="space-y-1">
                        {activity.likes.map(({ post }) => (
                          <li key={`like-${post.id}`}>
                            <button
                              type="button"
                              onClick={() => { setOpen(false); navigate(`/post/${post.id}`) }}
                              className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-[#1a1a1a] transition-colors"
                            >
                              <span className="text-[#c9a84c] text-xs mt-0.5">♥</span>
                              <span className="flex-1 min-w-0">
                                <span className="block truncate text-xs font-sans-ui text-[#e8e0d4]">{post.title}</span>
                                <span className="block text-[10px] font-sans-ui text-[#7a7060]">@{post.author.username}</span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h3 className="text-[11px] uppercase tracking-widest text-[#5a5248] font-sans-ui mb-2">
                      {t('activity.comments')}
                    </h3>
                    {activity.comments.length === 0 ? (
                      <p className="text-xs text-[#7a7060] font-sans-ui leading-relaxed">{t('activity.noComments')}</p>
                    ) : (
                      <ul className="space-y-1">
                        {activity.comments.map((c) => (
                          <li key={`comment-${c.id}`}>
                            <button
                              type="button"
                              onClick={() => { setOpen(false); navigate(`/post/${c.post.id}`) }}
                              className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-[#1a1a1a] transition-colors"
                            >
                              <span className="text-[#7a7060] text-xs mt-0.5">💬</span>
                              <span className="flex-1 min-w-0">
                                <span className="block truncate text-xs font-sans-ui text-[#e8e0d4]">{c.content}</span>
                                <span className="block text-[10px] font-sans-ui text-[#7a7060]">
                                  {t('activity.on')}: {c.post.title}
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
