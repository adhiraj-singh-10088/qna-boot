import { NavLink, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useMessages } from "../../context/MessagesContext"
import { useNotifications } from "../../context/NotificationsContext"
import MoreMenu from "./MoreMenu"
import LanguageSwitcher from "../ui/LanguageSwitcher"

/* ── Icon components (inline SVG — no extra lib needed) ─────────────── */
const HomeIcon = ({ filled }) =>
  filled ? (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  )

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="11" cy="11" r="7" strokeLinecap="round" />
    <path strokeLinecap="round" d="M16.5 16.5L21 21" />
  </svg>
)

const MessagesIcon = ({ filled }) =>
  filled ? (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M4 5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5v8A2.5 2.5 0 0117.5 16H9.4L5 20.2A1 1 0 013.5 19.4V5.5z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7A2.5 2.5 0 0117.5 16H9l-5 4V6.5z" />
    </svg>
  )

const NotificationsIcon = ({ filled }) =>
  filled ? (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M12 22a2.5 2.5 0 002.45-2h-4.9A2.5 2.5 0 0012 22zm7-6v-5a7 7 0 00-5-6.7V4a2 2 0 10-4 0v.3A7 7 0 005 11v5l-2 2v1h18v-1l-2-2z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 20a2 2 0 01-3.4 0" />
    </svg>
  )

const CreateIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" />
    <path strokeLinecap="round" d="M12 8v8M8 12h8" />
  </svg>
)

const ProfileIcon = ({ filled }) =>
  filled ? (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )

/* ── Nav items configuration ────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: "/feed",          label: "home",          Icon: HomeIcon,          hasFilledVariant: true  },
  { to: "/search",        label: "search",        Icon: SearchIcon,        hasFilledVariant: false },
  { to: "/messages",      label: "messages",      Icon: MessagesIcon,      hasFilledVariant: true  },
  { to: "/notifications", label: "notifications", Icon: NotificationsIcon, hasFilledVariant: true  },
  { to: "/create",        label: "create",        Icon: CreateIcon,        hasFilledVariant: false },
  { to: "/profile",       label: "profile",       Icon: ProfileIcon,       hasFilledVariant: true  },
]

function Badge({ count }) {
  if (!count) return null
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#c9a84c] text-[#0e0e0e] text-[10px] font-bold flex items-center justify-center leading-none">
      {count > 9 ? "9+" : count}
    </span>
  )
}

export default function Sidebar() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { unreadCount } = useMessages()
  const { unread: unreadNotifications } = useNotifications()

  const badgeFor = (to) =>
    to === "/messages" ? unreadCount
    : to === "/notifications" ? unreadNotifications
    : 0

  return (
    /*
     * Fixed sidebar — 72px wide (icon-only) on md, 240px on xl.
     * Hidden entirely on screens below md (mobile uses BottomNav).
     */
    <aside className="hidden md:flex fixed left-0 top-0 h-full z-40 flex-col
                      w-18 xl:w-60
                      bg-[#0e0e0e] border-r border-[#1f1f1f]
                      py-6 px-3 xl:px-5
                      transition-[width] duration-300">

      {/* ── Brand Logo ─────────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/feed")}
        className="flex items-center gap-3 mb-10 px-2 group"
        aria-label="Inkspace home"
      >
        <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#c9a84c] flex items-center justify-center
                         text-[#0e0e0e] font-bold text-lg leading-none select-none
                         group-hover:scale-105 transition-transform duration-200">
          I
        </span>
        <span className="hidden xl:block font-bold text-xl tracking-tight text-[#e8e0d4]"
              style={{ fontFamily: "'Georgia', serif" }}>
          Inkspace
        </span>
      </button>

      {/* ── Navigation Links ───────────────────────────────────────── */}
      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ to, label, Icon, hasFilledVariant }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-xl
               transition-all duration-200 group
               ${isActive
                 ? "bg-[#1f1c16] text-[#c9a84c]"
                 : "text-[#7a7060] hover:bg-[#161616] hover:text-[#e8e0d4]"
               }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative flex-shrink-0">
                  <Icon filled={hasFilledVariant && isActive} />
                  <Badge count={badgeFor(to)} />
                </span>
                <span className="hidden xl:block text-[15px] font-medium tracking-wide">
                  {t(`nav.${label}`)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom: settings/more ────────────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-2">
        <MoreMenu />
      </div>
    </aside>
  )
}
