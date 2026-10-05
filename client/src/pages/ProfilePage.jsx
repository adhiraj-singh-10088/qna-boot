import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import AppLayout from "../components/layout/AppLayout"
import Loader from "../components/ui/Loader"
import { useAuth } from "../context/AuthContext"
import EditProfileModal from "../components/profile/EditProfileModal"
import ShareProfileModal from "../components/profile/ShareProfileModal"
import { fetchFollowers, fetchFollowing, fetchProfile, fetchUserPosts } from "../api/users"
import { fetchBookmarks } from "../api/posts"
import { followUser, unfollowUser } from "../api/follows"

/* ── Stat pill ──────────────────────────────────────────────────────── */
function StatPill({ value, label, onClick }) {
  const formatted =
    value >= 1000000 ? `${(value / 1000000).toFixed(1)}M`
    : value >= 1000  ? `${(value / 1000).toFixed(1)}k`
    : String(value)

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity">
      <span className="text-[#e8e0d4] font-bold text-lg leading-none font-sans-ui">{formatted}</span>
      <span className="text-[#7a7060] text-xs font-sans-ui">{label}</span>
    </button>
  )
}

/* ── Grid card ──────────────────────────────────────────────────────── */
function GridCard({ post }) {
  const navigate = useNavigate()
  return (
    <article
      onClick={() => navigate(`/post/${post.id}`)}
      className="group relative bg-[#161616] rounded-xl overflow-hidden
                 border border-[#1f1f1f] hover:border-[#c9a84c30]
                 transition-all duration-300 cursor-pointer"
    >
      <div className="aspect-square overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
        <span className="text-[#3a3329] text-4xl">✍</span>
      </div>
      <div className="p-3">
        <p className="text-[#e8e0d4] text-xs font-medium font-sans-ui line-clamp-2 leading-snug">
          {post.title}
        </p>
        <p className="text-[#7a7060] text-[10px] mt-1 font-sans-ui">
          ♥ {post.likes} · 💬 {post.comments}
        </p>
      </div>
    </article>
  )
}

/* ── People list modal (followers / following) ──────────────────────── */
function PeopleModal({ data, onClose, t }) {
  const navigate = useNavigate()
  if (!data) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
          <h2 className="text-[#e8e0d4] font-semibold text-base font-sans-ui">{data.title}</h2>
          <button onClick={onClose} aria-label={t('common.close')} className="text-[#7a7060] hover:text-[#e8e0d4]">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
          {data.users.length === 0 ? (
            <p className="text-center text-[#7a7060] text-sm font-sans-ui py-8">
              {data.emptyText || t('common.noResults')}
            </p>
          ) : (
            data.users.map((u) => (
              <button
                key={u.id}
                onClick={() => { onClose(); navigate(`/u/${u.username}`) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left"
              >
                <span className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#c9a84c] text-sm font-bold flex-shrink-0">
                  {(u.name || "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="text-[#e8e0d4] text-sm font-medium font-sans-ui truncate">{u.name}</p>
                  <p className="text-[#7a7060] text-xs font-sans-ui truncate">@{u.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { username: routeUsername } = useParams()
  const { user: authUser, isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const username = routeUsername || authUser?.username
  const isOwn = !routeUsername || (authUser && routeUsername === authUser.username)

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState(searchParams.get("tab") === "Bookmarks" ? "Bookmarks" : "Articles")
  const [editing, setEditing] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [people, setPeople] = useState(null)
  const [followStatus, setFollowStatus] = useState("none")
  const [followBusy, setFollowBusy] = useState(false)

  const requestSeq = useRef(0)
  const hasDataRef = useRef(false)

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!username) return
    const seq = ++requestSeq.current
    if (!silent) setLoading(true)
    setNotFound(false)
    try {
      const { profile: p } = await fetchProfile(username)
      if (seq !== requestSeq.current) return // a newer load superseded this one
      hasDataRef.current = true
      setProfile(p)
      setFollowStatus(p.isFollowing ? "following" : p.hasPendingRequest ? "requested" : "none")

      const postsRes = await fetchUserPosts(username)
      if (seq !== requestSeq.current) return
      setPosts(postsRes?.posts || [])
      setLocked(Boolean(postsRes?.locked))

      const own = authUser && p.username === authUser.username
      if (own) {
        try {
          const bm = await fetchBookmarks()
          if (seq !== requestSeq.current) return
          setBookmarks(bm?.posts || [])
        } catch { /* bookmarks are optional */ }
      }
    } catch {
      if (seq !== requestSeq.current) return
      setNotFound(true)
    } finally {
      if (seq === requestSeq.current) setLoading(false)
    }
  }, [username, authUser])

  /* Different user (route change) → show the loader again; refresh of the same
     profile (e.g. after editing) → stay silent so the page (and any open modal)
     doesn't unmount. */
  useEffect(() => { hasDataRef.current = false }, [username])

  useEffect(() => { load({ silent: hasDataRef.current }) }, [load])

  const switchTab = (next) => {
    setTab(next)
    setSearchParams(next === "Articles" ? {} : { tab: next })
  }

  const handleFollowToggle = async () => {
    if (!isAuthenticated) { navigate("/login"); return }
    if (followBusy) return
    setFollowBusy(true)
    try {
      if (followStatus === "none") {
        const res = await followUser(profile.username)
        setFollowStatus(res.status === "requested" ? "requested" : "following")
      } else {
        await unfollowUser(profile.username)
        setFollowStatus("none")
      }
      const { profile: fresh } = await fetchProfile(profile.username)
      setProfile(fresh)
    } catch (err) {
      window.alert(err.message)
    } finally {
      setFollowBusy(false)
    }
  }

  const openPeople = async (which) => {
    try {
      const res = which === "followers"
        ? await fetchFollowers(profile.username)
        : await fetchFollowing(profile.username)
      setPeople({
        title: which === "followers" ? t('profile.followersList') : t('profile.followingList'),
        users: res?.users || [],
        emptyText: which === "followers" ? t('profile.emptyFollowers') : t('profile.emptyFollowing'),
      })
    } catch { /* ignore */ }
  }

  if (!username) {
    return (
      <AppLayout>
        <p className="text-center text-[#7a7060] text-sm font-sans-ui py-20">{t('common.loading')}</p>
      </AppLayout>
    )
  }

  if (loading) {
    return <AppLayout><Loader /></AppLayout>
  }

  if (notFound || !profile) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-[#e8e0d4] text-lg font-semibold mb-4">{t('profile.notFound')}</p>
          <Link to="/feed" className="px-5 py-2.5 rounded-full bg-[#c9a84c] text-[#0e0e0e] text-sm font-semibold font-sans-ui hover:bg-[#e2c97e] transition-colors">
            {t('post.backToFeed')}
          </Link>
        </div>
      </AppLayout>
    )
  }

  const tabs = isOwn ? ["Articles", "Bookmarks"] : ["Articles"]
  const items = tab === "Bookmarks" ? bookmarks : posts
  const followLabel = followStatus === "following" ? t('profile.following')
    : followStatus === "requested" ? t('profile.requested')
    : t('profile.follow')

  return (
    <AppLayout>
      {/* ── Profile Header ───────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-start gap-6 mb-5">
          <div className="flex-shrink-0">
            <span
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]
                         flex items-center justify-center text-3xl font-bold text-[#c9a84c]
                         ring-2 ring-[#c9a84c40]"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {(profile.name || profile.username || "?").charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-around pt-2">
            <StatPill value={profile.postCount} label={t('profile.articles')} />
            <div className="w-px h-8 bg-[#2a2a2a]" />
            <StatPill value={profile.followerCount} label={t('profile.followers')} onClick={() => openPeople("followers")} />
            <div className="w-px h-8 bg-[#2a2a2a]" />
            <StatPill value={profile.followingCount} label={t('profile.following')} onClick={() => openPeople("following")} />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-[#e8e0d4] text-lg font-bold" style={{ fontFamily: "'Georgia', serif" }}>
              {profile.name}
            </h1>
            {profile.isPrivate && (
              <span className="font-sans-ui text-[10px] px-2 py-0.5 rounded-full bg-[#2a2218] border border-[#3a3020] text-[#c9a84c] uppercase tracking-wider">
                {t('search.privateAccount')}
              </span>
            )}
            {profile.followsYou && !profile.isSelf && (
              <span className="font-sans-ui text-[10px] px-2 py-0.5 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] text-[#7a7060]">
                {t('search.followsYou')}
              </span>
            )}
          </div>
          <p className="text-[#7a7060] text-xs font-sans-ui">@{profile.username}</p>
        </div>

        <p className="text-[#b0a898] text-sm leading-relaxed font-sans-ui mb-4">
          {profile.bio || t('profile.bioEmpty')}
        </p>

        {followStatus === "requested" && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[#1f1c16] border border-[#3a3020]">
            <p className="text-[#c9a84c] text-sm font-semibold font-sans-ui">{t('profile.requestedNotice')}</p>
            <p className="text-[#7a7060] text-xs font-sans-ui mt-0.5">{t('profile.requestedText')}</p>
          </div>
        )}

        <div className="flex gap-3">
          {isOwn ? (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex-1 py-2 rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]
                           text-[#e8e0d4] text-sm font-medium font-sans-ui
                           hover:border-[#3a3329] hover:bg-[#252525] transition-all duration-200"
              >
                {t('profile.editProfile')}
              </button>
              <button
                type="button"
                onClick={() => setSharing(true)}
                className="flex-1 py-2 rounded-xl bg-[#1f1f1f] border border-[#2a2a2a]
                           text-[#e8e0d4] text-sm font-medium font-sans-ui
                           hover:border-[#3a3329] hover:bg-[#252525] transition-all duration-200"
              >
                {t('profile.shareProfile')}
              </button>
            </>
          ) : (
            <button
              onClick={handleFollowToggle}
              disabled={followBusy}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold font-sans-ui transition-all duration-200 disabled:opacity-60
                ${followStatus === "none"
                  ? "bg-[#c9a84c] text-[#0e0e0e] hover:bg-[#e2c97e]"
                  : "bg-[#1f1f1f] text-[#c9a84c] border border-[#3a3329] hover:border-[#c9a84c]/50"}`}
            >
              {followLabel}
            </button>
          )}
        </div>
      </header>

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className="flex border-b border-[#1f1f1f] mb-5" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb}
            role="tab"
            aria-selected={tab === tb}
            onClick={() => switchTab(tb)}
            className={`flex-1 py-3 text-xs font-semibold font-sans-ui uppercase tracking-widest
                        transition-all duration-200 relative
                        ${tab === tb ? "text-[#e8e0d4]" : "text-[#7a7060] hover:text-[#9a9080]"}`}
          >
            {tb === "Articles" ? t('profile.articles') : t('profile.bookmarks')}
            {tab === tb && <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-[#c9a84c] rounded-full" />}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      {locked ? (
        <div className="flex flex-col items-center py-16 text-center border border-dashed border-[#2a2a2a] rounded-2xl bg-[#111111]">
          <svg className="w-10 h-10 text-[#3a3329] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <h3 className="text-[#e8e0d4] text-base font-medium font-sans-ui mb-1">{t('profile.privateNotice')}</h3>
          <p className="text-[#7a7060] text-sm font-sans-ui max-w-xs">{t('profile.privateText')}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <span className="text-4xl mb-3" aria-hidden="true">📝</span>
          <p className="text-[#7a7060] text-sm font-sans-ui">
            {tab === "Bookmarks" ? t('profile.noBookmarks') : t('profile.noArticles')}
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-3 gap-1.5" aria-label={`${tab} grid`} role="tabpanel">
          {items.map((item) => <GridCard key={item.id} post={item} />)}
        </section>
      )}

      <EditProfileModal isOpen={editing} onClose={() => setEditing(false)} onSaved={() => load({ silent: true })} />
      <ShareProfileModal
        isOpen={sharing}
        onClose={() => setSharing(false)}
        username={profile.username}
        name={profile.name}
      />
      <PeopleModal data={people} onClose={() => setPeople(null)} t={t} />
    </AppLayout>
  )
}
