import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useMessages } from "../../context/MessagesContext"
import { useNotifications } from "../../context/NotificationsContext"

/* ── Inline SVG Icons ───────────────────────────────────────────────── */
const HomeIcon    = ({ active }) => active
  ? <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
  : <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/></svg>

const SearchIcon  = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="11" cy="11" r="7"/><path strokeLinecap="round" d="M16.5 16.5L21 21"/>
  </svg>
)

const MessagesIcon = ({ active }) => active
  ? <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v8A2.5 2.5 0 0117.5 16H9.4L5 20.2A1 1 0 013.5 19.4V5.5z"/></svg>
  : <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7A2.5 2.5 0 0117.5 16H9l-5 4V6.5z"/></svg>

const NotificationsIcon = ({ active }) => active
  ? <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22zm7-6v-5a7 7 0 00-5-6.7V4a2 2 0 10-4 0v.3A7 7 0 005 11v5l-2 2v1h18v-1l-2-2z"/></svg>
  : <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 20a2 2 0 01-3.4 0"/></svg>

const CreateIcon  = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round"/>
    <path strokeLinecap="round" d="M12 8v8M8 12h8"/>
  </svg>
)

const ProfileIcon = ({ active }) => active
  ? <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z"/></svg>
  : <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="8" r="4"/><path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>

/* ── Tab definitions ────────────────────────────────────────────────── */
const TABS = [
  { to: "/feed",          label: "home",          Icon: HomeIcon,          hasActive: true  },
  { to: "/search",        label: "search",        Icon: SearchIcon,        hasActive: false },
  { to: "/messages",      label: "messages",      Icon: MessagesIcon,      hasActive: true  },
  { to: "/notifications", label: "notifications", Icon: NotificationsIcon, hasActive: true  },
  { to: "/create",        label: "create",        Icon: CreateIcon,        hasActive: false },
  { to: "/profile",       label: "profile",       Icon: ProfileIcon,       hasActive: true  },
]

export default function BottomNav() {
  const { t } = useTranslation()
  const { unreadCount } = useMessages()
  const { unread: unreadNotifications } = useNotifications()

  const badgeFor = (to) =>
    to === "/messages" ? unreadCount
    : to === "/notifications" ? unreadNotifications
    : 0

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40
                 bg-[#0e0e0e]/95 backdrop-blur-md
                 border-t border-[#1f1f1f]
                 flex items-center justify-around
                 px-1 pt-2 pb-[env(safe-area-inset-bottom,8px)]"
      aria-label="Mobile navigation"
    >
      {TABS.map(({ to, label, Icon, hasActive }) => (
        <NavLink
          key={to}
          to={to}
          aria-label={t(`nav.${label}`)}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl
             transition-all duration-200
             ${isActive ? "text-[#c9a84c]" : "text-[#7a7060]"}`
          }
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <Icon active={hasActive && isActive} />
                {badgeFor(to) > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-[#c9a84c] text-[#0e0e0e] text-[9px] font-bold flex items-center justify-center">
                    {badgeFor(to) > 9 ? "9+" : badgeFor(to)}
                  </span>
                )}
              </span>
              <span className={`w-1 h-1 rounded-full transition-all duration-300 ${isActive ? "bg-[#c9a84c] scale-100" : "scale-0"}`} />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
