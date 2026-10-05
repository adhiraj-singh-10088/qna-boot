import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/AuthContext"
import { likePost, unlikePost, bookmarkPost, unbookmarkPost } from "../../api/posts"

/* ── Action icon components ─────────────────────────────────────────── */
const HeartIcon   = ({ filled }) => filled
  ? <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#c9a84c"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
  : <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
)

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
  </svg>
)

const BookmarkIcon = ({ filled }) => filled
  ? <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#c9a84c"><path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z"/></svg>
  : <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>

/* ── Helpers ────────────────────────────────────────────────────────── */
function formatRelativeTime(dateString) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)    return "now"
  if (mins < 60)   return `${mins}m`
  if (mins < 1440) return `${Math.floor(mins / 60)}h`
  return `${Math.floor(mins / 1440)}d`
}

/**
 * <PostCard />
 * Instagram-inspired article card for the editorial feed.
 * Likes & bookmarks call the API (optimistic UI); guests are sent to /login.
 */
export default function PostCard({ post, onShare }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  /* Local optimistic state — server response reconciles the numbers */
  const [liked,      setLiked]      = useState(post?.isLiked  ?? false)
  const [saved,      setSaved]      = useState(post?.isSaved  ?? false)
  const [likeCount,  setLikeCount]  = useState(post?.likes    ?? 0)
  const [busy,       setBusy]       = useState(false)

  const requireAuth = () => {
    if (isAuthenticated) return true
    navigate("/login")
    return false
  }

  const handleLike = async () => {
    if (!requireAuth() || busy) return
    const next = !liked
    setLiked(next)
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)))
    setBusy(true)
    try {
      const res = next ? await likePost(post.id) : await unlikePost(post.id)
      setLiked(res.isLiked)
      setLikeCount(res.likes)
    } catch {
      setLiked(!next)
      setLikeCount((c) => Math.max(0, c + (next ? -1 : 1)))
    } finally {
      setBusy(false)
    }
  }

  const handleSave = async () => {
    if (!requireAuth() || busy) return
    const next = !saved
    setSaved(next)
    setBusy(true)
    try {
      const res = next ? await bookmarkPost(post.id) : await unbookmarkPost(post.id)
      setSaved(res.isSaved)
    } catch {
      setSaved(!next)
    } finally {
      setBusy(false)
    }
  }

  // Fallback values for safety
  const {
    id,
    author   = { name: t('common.anonymous'), username: "anon", avatar: null },
    publishedAt = new Date().toISOString(),
    title    = "",
    excerpt  = "",
    heroImage = null,
    comments = 0,
    category = null,
  } = post ?? {}

  const openPost = () => navigate(`/post/${id}`)

  return (
    <article
      className="bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden
                 hover:border-[#2a2a2a] transition-colors duration-300 mb-5"
      aria-label={`Article: ${title}`}
    >
      {/* ── Card Header: Author info ─────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => author.username && navigate(`/u/${author.username}`)}
            className="flex-shrink-0"
            aria-label={`@${author.username}`}
          >
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-[#2a2a2a]"
              />
            ) : (
              <span
                className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center
                           text-[#c9a84c] text-sm font-bold ring-1 ring-[#3a3329]"
              >
                {author.name.charAt(0).toUpperCase()}
              </span>
            )}
          </button>

          <div>
            <button
              type="button"
              onClick={() => author.username && navigate(`/u/${author.username}`)}
              className="text-[#e8e0d4] text-sm font-semibold leading-none font-sans-ui hover:text-[#c9a84c] transition-colors"
            >
              {author.name}
            </button>
            <p className="text-[#7a7060] text-xs mt-0.5 font-sans-ui">
              @{author.username} · {formatRelativeTime(publishedAt)}
            </p>
          </div>
        </div>

        {category && (
          <span className="font-sans-ui text-[10px] px-2.5 py-1 rounded-full bg-[#2a2218] border border-[#3a3020] text-[#c9a84c] uppercase tracking-wider">
            {category}
          </span>
        )}
      </header>

      {/* ── Hero Image ──────────────────────────────────────────────── */}
      {heroImage && (
        <button type="button" onClick={openPost} className="block relative w-full aspect-[16/9] overflow-hidden">
          <img
            src={heroImage}
            alt={`Hero image for "${title}"`}
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/40 to-transparent" />
        </button>
      )}

      {/* ── Article Content ──────────────────────────────────────────── */}
      <div className="px-4 py-3">
        <h2
          className="text-[#e8e0d4] text-[18px] font-semibold leading-snug mb-2
                     hover:text-[#c9a84c] transition-colors duration-200 cursor-pointer"
          style={{ fontFamily: "'Georgia', serif" }}
          onClick={openPost}
        >
          {title}
        </h2>

        <p
          className="text-[#9a9080] text-[14px] leading-relaxed line-clamp-2 font-sans-ui cursor-pointer"
          onClick={openPost}
        >
          {excerpt}
        </p>
      </div>

      {/* ── Divider ─────────────────────────────────────────────────── */}
      <div className="h-px bg-[#1f1f1f] mx-4" />

      {/* ── Instagram-Style Action Bar ───────────────────────────────── */}
      <footer className="flex items-center px-4 py-3 gap-1">
        {/* Like button */}
        <button
          onClick={handleLike}
          aria-label={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                      transition-all duration-200 group
                      ${liked
                        ? "text-[#c9a84c]"
                        : "text-[#7a7060] hover:text-[#e8e0d4] hover:bg-[#1f1f1f]"
                      }`}
        >
          <span className={`transition-transform duration-150 ${liked ? "scale-110" : "group-hover:scale-110"}`}>
            <HeartIcon filled={liked} />
          </span>
          <span className="text-xs font-medium font-sans-ui tabular-nums">
            {likeCount > 0 ? likeCount : ""}
          </span>
        </button>

        {/* Comment button → opens post page */}
        <button
          onClick={openPost}
          aria-label={t('post.comments')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                     text-[#7a7060] hover:text-[#e8e0d4] hover:bg-[#1f1f1f]
                     transition-all duration-200 group"
        >
          <span className="group-hover:scale-110 transition-transform duration-150">
            <CommentIcon />
          </span>
          {comments > 0 && (
            <span className="text-xs font-medium font-sans-ui tabular-nums">{comments}</span>
          )}
        </button>

        {/* Share button */}
        <button
          onClick={() => onShare?.(post)}
          aria-label={t('post.shareArticle')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                     text-[#7a7060] hover:text-[#e8e0d4] hover:bg-[#1f1f1f]
                     transition-all duration-200 group"
        >
          <span className="group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-150">
            <ShareIcon />
          </span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save / Bookmark button — right aligned like Instagram */}
        <button
          onClick={handleSave}
          aria-label={saved ? "Remove bookmark" : "Save article"}
          aria-pressed={saved}
          className={`p-2 rounded-xl transition-all duration-200 group
                      ${saved
                        ? "text-[#c9a84c]"
                        : "text-[#7a7060] hover:text-[#e8e0d4] hover:bg-[#1f1f1f]"
                      }`}
        >
          <span className={`block transition-transform duration-150 ${saved ? "scale-110" : "group-hover:scale-110"}`}>
            <BookmarkIcon filled={saved} />
          </span>
        </button>
      </footer>
    </article>
  )
}
