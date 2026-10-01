import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import AppLayout from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import EditProfileModal from "../components/profile/EditProfileModal"
import ShareProfileModal from "../components/profile/ShareProfileModal"



const TABS = ["Articles", "Bookmarks", "Vlogs"]

/* ── Stat pill ──────────────────────────────────────────────────────── */
function StatPill({ value, label }) {
  const formatted =
    value >= 1000000 ? `${(value / 1000000).toFixed(1)}M`
    : value >= 1000  ? `${(value / 1000).toFixed(1)}k`
    : String(value)

  return (
    <button className="flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity">
      <span className="text-[#e8e0d4] font-bold text-lg leading-none font-sans-ui">
        {formatted}
      </span>
      <span className="text-[#7a7060] text-xs font-sans-ui">{label}</span>
    </button>
  )
}

/* ── Grid card ──────────────────────────────────────────────────────── */
function GridCard({ item, type }) {
  return (
    <article
      className="group relative bg-[#161616] rounded-xl overflow-hidden
                 border border-[#1f1f1f] hover:border-[#c9a84c30]
                 transition-all duration-300 cursor-pointer"
      // TODO: navigate to /articles/:item.id on click
    >
      {/* Thumbnail */}
      <div className="aspect-square overflow-hidden bg-[#1a1a1a]">
        {item.cover ? (
          <img
            src={item.cover}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105
                       transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#3a3329] text-4xl">✍</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
                        transition-all duration-300 flex items-center justify-center">
          {/* Vlog play button */}
          {type === "Vlogs" && (
            <span className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg viewBox="0 0 20 20" className="w-5 h-5 text-[#0e0e0e] ml-0.5"
                   fill="currentColor">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Caption */}
      <div className="p-3">
        <p className="text-[#e8e0d4] text-xs font-medium font-sans-ui line-clamp-2 leading-snug">
          {item.title}
        </p>
        <p className="text-[#7a7060] text-[10px] mt-1 font-sans-ui">
          {type === "Vlogs" ? item.duration : `${item.readTime} · ${item.publishedAt}`}
        </p>
      </div>
    </article>
  )
}

/**
 * <ProfilePage />
 * User profile page with:
 *  - Header: avatar, name, bio, stats (Articles / Followers / Following)
 *  - Tabs: Articles | Bookmarks | Vlogs
 *  - 3-column grid of content cards for the active tab
 *
 * TODO:
 *  - Fetch profile via useParams() username → GET /api/users/:username
 *  - Handle isOwn vs viewing another user's profile
 */
export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(
    TABS.includes(tabFromUrl) ? tabFromUrl : "Articles"
  )
  const [editing, setEditing] = useState(false)
  const [sharing, setSharing] = useState(false)

  const [articles, setArticles] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [vlogs, setVlogs] = useState([])

  useEffect(() => {
    if (TABS.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl, activeTab])

  // Map context user onto profile props (fallback to defaults if fields are missing)
  const profileUser = {
    name:            authUser?.name || authUser?.username || "Inkspace User",
    username:        authUser?.username || "writer",
    avatar:          authUser?.avatar || null,
    bio:             authUser?.bio || "No bio added yet.",
    location:        authUser?.location || "",
    website:         authUser?.website || "",
    articlesCount:   authUser?.articlesCount || 0,
    followersCount:  authUser?.followersCount || 0,
    followingCount:  authUser?.followingCount || 0,
    isOwn:           true, // currently always viewing own profile in this tab
  }

  const tabContent = {
    Articles:  articles,
    Bookmarks: bookmarks,
    Vlogs:     vlogs,
  }

  const items = tabContent[activeTab] ?? []

  return (
    <AppLayout>
      {/* ── Profile Header ───────────────────────────────────────────── */}
      <header className="mb-8">
        {/* Top row: avatar + stats */}
        <div className="flex items-start gap-6 mb-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profileUser.avatar ? (
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-20 h-20 rounded-full object-cover
                           ring-2 ring-[#c9a84c40]"
              />
            ) : (
              <span
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]
                           flex items-center justify-center
                           text-3xl font-bold text-[#c9a84c]
                           ring-2 ring-[#c9a84c40]"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {profileUser.name.charAt(0)}
              </span>
            )}
          </div>

          {/* Stats grid — Instagram layout */}
          <div className="flex-1 flex items-center justify-around pt-2">
            <StatPill value={profileUser.articlesCount}  label="Articles"  />
            <div className="w-px h-8 bg-[#2a2a2a]" />
            <StatPill value={profileUser.followersCount} label="Followers" />
            <div className="w-px h-8 bg-[#2a2a2a]" />
            <StatPill value={profileUser.followingCount} label="Following" />
          </div>
        </div>

        {/* Name + bio block */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h1
              className="text-[#e8e0d4] text-lg font-bold"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {profileUser.name}
            </h1>
            {/* Verified badge — show conditionally */}
            <svg viewBox="0 0 20 20" className="w-4 h-4 text-[#c9a84c]" fill="currentColor"
                 aria-label="Verified author">
              <path fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"/>
            </svg>
          </div>
          <p className="text-[#7a7060] text-xs font-sans-ui">@{profileUser.username}</p>
        </div>

        <p className="text-[#b0a898] text-sm leading-relaxed font-sans-ui mb-3">
          {profileUser.bio}
        </p>

        {/* Location + website */}
        <div className="flex items-center gap-4 text-[#7a7060] text-xs font-sans-ui mb-4">
          {profileUser.location && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
                <path fillRule="evenodd" d="M8 1a5 5 0 100 10A5 5 0 008 1zm0 4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" clipRule="evenodd"/>
                <path d="M3 8a5 5 0 0110 0c0 3.5-5 7-5 7S3 11.5 3 8z" opacity=".3"/>
              </svg>
              {profileUser.location}
            </span>
          )}
          {profileUser.website && (
            <a
              href={`https://${profileUser.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#c9a84c] hover:text-[#e2c97e]
                         transition-colors duration-200"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none"
                   stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" d="M8 2a6 6 0 100 12A6 6 0 008 2zM2 8h12M8 2c-1.5 2-2.5 3.8-2.5 6S6.5 12 8 14m0-12c1.5 2 2.5 3.8 2.5 6S9.5 12 8 14"/>
              </svg>
              {profileUser.website}
            </a>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-3">
          {profileUser.isOwn ? (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex-1 py-2 rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]
                           text-[#e8e0d4] text-sm font-medium font-sans-ui
                           hover:border-[#3a3329] hover:bg-[#252525]
                           transition-all duration-200"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => setSharing(true)}
                className="flex-1 py-2 rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]
                           text-[#e8e0d4] text-sm font-medium font-sans-ui
                           hover:border-[#3a3329] hover:bg-[#252525]
                           transition-all duration-200"
              >
                Share Profile
              </button>
            </>
          ) : (
            <button
              className="flex-1 py-2 rounded-xl bg-[#c9a84c] text-[#0e0e0e]
                         text-sm font-semibold font-sans-ui
                         hover:bg-[#e2c97e] transition-all duration-200"
              // TODO: follow / unfollow user
            >
              Follow
            </button>
          )}
        </div>
      </header>

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div
        className="flex border-b border-[#1f1f1f] mb-5"
        role="tablist"
        aria-label="Profile content sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => {
              setActiveTab(tab)
              setSearchParams(tab === "Articles" ? {} : { tab })
            }}
            className={`flex-1 py-3 text-xs font-semibold font-sans-ui uppercase
                        tracking-widest transition-all duration-200 relative
                        ${activeTab === tab
                          ? "text-[#e8e0d4]"
                          : "text-[#7a7060] hover:text-[#9a9080]"
                        }`}
          >
            {tab}
            {/* Active underline indicator */}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px]
                               bg-[#c9a84c] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── Content grid ─────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="text-4xl mb-3" aria-hidden="true">
            {activeTab === "Vlogs" ? "🎬" : "📝"}
          </span>
          <p className="text-[#7a7060] text-sm font-sans-ui">
            No {activeTab.toLowerCase()} yet
          </p>
        </div>
      ) : (
        <section
          className="grid grid-cols-3 gap-1.5"
          aria-label={`${activeTab} grid`}
          role="tabpanel"
        >
          {items.map((item) => (
            <GridCard key={item.id} item={item} type={activeTab} />
          ))}
        </section>
      )}

      <EditProfileModal isOpen={editing} onClose={() => setEditing(false)} />
      <ShareProfileModal
        isOpen={sharing}
        onClose={() => setSharing(false)}
        username={profileUser.username}
        name={profileUser.name}
      />
    </AppLayout>
  )
}
