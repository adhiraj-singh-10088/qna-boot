import { useState } from "react"

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
  // TODO: replace with a date library (e.g. date-fns formatDistanceToNow)
  const diff = Date.now() - new Date(dateString).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 60)   return `${mins}m ago`
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
  return `${Math.floor(mins / 1440)}d ago`
}

/**
 * <PostCard />
 * Instagram-inspired article card for the editorial feed.
 *
 * Props:
 *  post: {
 *    id, author: { name, avatar, username },
 *    publishedAt, title, excerpt, heroImage,
 *    likes, comments, isLiked, isSaved
 *  }
 *  onShare: () => void  — opens <ShareModal />
 *
 * TODO: wire onLike / onSave to API mutations.
 */
export default function PostCard({ post, onShare }) {
  /* Local optimistic state — replace with server state / React Query */
  const [liked,      setLiked]      = useState(post?.isLiked  ?? false)
  const [saved,      setSaved]      = useState(post?.isSaved  ?? false)
  const [likeCount,  setLikeCount]  = useState(post?.likes    ?? 0)

  const handleLike = () => {
    // TODO: call PATCH /api/posts/:id/like
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  const handleSave = () => {
    // TODO: call POST /api/bookmarks
    setSaved(prev => !prev)
  }

  // Fallback values for demo rendering
  const {
    author   = { name: "Anonymous", username: "anon", avatar: null },
    publishedAt = new Date().toISOString(),
    title    = "Untitled Article",
    excerpt  = "",
    heroImage = null,
    comments = 0,
  } = post ?? {}

  return (
    <article
      className="bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden
                 hover:border-[#2a2a2a] transition-colors duration-300 mb-5"
      aria-label={`Article: ${title}`}
    >
      {/* ── Card Header: Author info ─────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Author avatar */}
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-[#2a2a2a]"
            />
          ) : (
            /* Fallback monogram avatar */
            <span
              className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center
                         text-[#c9a84c] text-sm font-bold flex-shrink-0 ring-1 ring-[#3a3329]"
            >
              {author.name.charAt(0).toUpperCase()}
            </span>
          )}

          <div>
            {/* Author name */}
            <p className="text-[#e8e0d4] text-sm font-semibold leading-none font-sans-ui">
              {author.name}
            </p>
            {/* @username · timestamp */}
            <p className="text-[#7a7060] text-xs mt-0.5 font-sans-ui">
              @{author.username} · {formatRelativeTime(publishedAt)}
            </p>
          </div>
        </div>

        {/* ··· More options button */}
        <button
          className="text-[#7a7060] hover:text-[#e8e0d4] transition-colors p-1 rounded-lg
                     hover:bg-[#1f1f1f]"
          aria-label="More options"
          // TODO: open post options menu (edit, report, hide)
        >
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
            <circle cx="10" cy="4"  r="1.5"/>
            <circle cx="10" cy="10" r="1.5"/>
            <circle cx="10" cy="16" r="1.5"/>
          </svg>
        </button>
      </header>

      {/* ── Hero Image ──────────────────────────────────────────────── */}
      {heroImage && (
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <img
            src={heroImage}
            alt={`Hero image for "${title}"`}
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
          />
          {/* Subtle gradient overlay at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/40 to-transparent" />
        </div>
      )}

      {/* ── Article Content ──────────────────────────────────────────── */}
      <div className="px-4 py-3">
        {/* Article title */}
        <h2
          className="text-[#e8e0d4] text-[18px] font-semibold leading-snug mb-2
                     hover:text-[#c9a84c] transition-colors duration-200 cursor-pointer"
          style={{ fontFamily: "'Georgia', serif" }}
          // TODO: navigate to /articles/:post.id on click
        >
          {title}
        </h2>

        {/* Excerpt — clamped to 2 lines */}
        <p
          className="text-[#9a9080] text-[14px] leading-relaxed line-clamp-2 font-sans-ui"
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

        {/* Comment button */}
        <button
          aria-label="View comments"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl
                     text-[#7a7060] hover:text-[#e8e0d4] hover:bg-[#1f1f1f]
                     transition-all duration-200 group"
          // TODO: navigate to /articles/:id#comments
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
          onClick={onShare}
          aria-label="Share article"
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
