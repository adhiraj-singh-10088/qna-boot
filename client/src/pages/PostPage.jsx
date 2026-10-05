import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import AppLayout from "../components/layout/AppLayout"
import ShareModal from "../components/ui/ShareModal"
import Loader from "../components/ui/Loader"
import { useAuth } from "../context/AuthContext"
import {
  addComment as apiAddComment,
  bookmarkPost,
  deleteComment as apiDeleteComment,
  deletePost,
  fetchComments,
  fetchPost,
  likePost,
  unlikePost,
  unbookmarkPost,
} from "../api/posts"

const plainText = (html) =>
  String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()

function formatDate(dateString, locale) {
  try {
    return new Date(dateString).toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })
  } catch {
    return ""
  }
}

/**
 * <PostPage />
 * Public permalink view of a single article — /post/:id
 * Includes like, save, share, comments and owner controls (edit / delete).
 */
export default function PostPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { isAuthenticated, user } = useAuth()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [posting, setPosting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sharing, setSharing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setNotFound(false)
    try {
      const [postData, commentData] = await Promise.all([
        fetchPost(id),
        fetchComments(id).catch(() => ({ comments: [] })),
      ])
      setPost(postData.post)
      setComments(commentData?.comments || [])
    } catch (err) {
      if (err.status === 404) setNotFound(true)
      else setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const isOwner = post && user && String(post.author?.id) === String(user.id)

  const requireAuth = () => {
    if (isAuthenticated) return true
    navigate("/login")
    return false
  }

  const handleLike = async () => {
    if (!requireAuth() || busy || !post) return
    const next = !post.isLiked
    setPost((p) => ({ ...p, isLiked: next, likes: Math.max(0, p.likes + (next ? 1 : -1)) }))
    setBusy(true)
    try {
      const res = next ? await likePost(post.id) : await unlikePost(post.id)
      setPost((p) => ({ ...p, isLiked: res.isLiked, likes: res.likes }))
    } catch {
      setPost((p) => ({ ...p, isLiked: !next }))
    } finally {
      setBusy(false)
    }
  }

  const handleSave = async () => {
    if (!requireAuth() || busy || !post) return
    const next = !post.isSaved
    setPost((p) => ({ ...p, isSaved: next }))
    setBusy(true)
    try {
      const res = next ? await bookmarkPost(post.id) : await unbookmarkPost(post.id)
      setPost((p) => ({ ...p, isSaved: res.isSaved }))
    } catch {
      setPost((p) => ({ ...p, isSaved: !next }))
    } finally {
      setBusy(false)
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm(t('post.deletePostConfirm'))) return
    try {
      await deletePost(post.id)
      navigate('/feed')
    } catch (err) {
      window.alert(err.message)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!requireAuth() || posting) return
    const content = commentText.trim()
    if (!content) return
    setPosting(true)
    try {
      const res = await apiAddComment(post.id, content)
      setComments((prev) => [...prev, res.comment])
      setPost((p) => ({ ...p, comments: res.comments }))
      setCommentText("")
    } catch (err) {
      window.alert(err.message)
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm(t('post.deleteCommentConfirm'))) return
    try {
      await apiDeleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      setPost((p) => ({ ...p, comments: Math.max(0, (p.comments || 1) - 1) }))
    } catch (err) {
      window.alert(err.message)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    )
  }

  if (notFound || !post) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-[#e8e0d4] text-lg font-semibold mb-4">{t('post.notFound')}</p>
          <Link
            to="/feed"
            className="px-5 py-2.5 rounded-full bg-[#c9a84c] text-[#0e0e0e] text-sm font-semibold font-sans-ui hover:bg-[#e2c97e] transition-colors"
          >
            {t('post.backToFeed')}
          </Link>
        </div>
      </AppLayout>
    )
  }

  const words = plainText(post.content).split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(words / 200))

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 text-[#7a7060] hover:text-[#c9a84c] text-sm font-sans-ui transition-colors mb-6"
        >
          ← {t('post.backToFeed')}
        </Link>

        <article>
          {post.isDraft && (
            <span className="inline-block font-sans-ui text-[10px] px-2 py-0.5 rounded-full bg-[#2a2218] border border-[#3a3020] text-[#c9a84c] uppercase tracking-wider mb-4">
              {t('profile.draft')}
            </span>
          )}

          {post.category && (
            <p className="font-sans-ui text-xs tracking-[0.2em] text-[#c9a84c] uppercase mb-4">
              {post.category}
            </p>
          )}

          <h1
            className="text-3xl lg:text-4xl font-bold text-[#f5e6c8] leading-tight mb-3"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-lg text-[#7a7060] mb-6 leading-relaxed">{post.subtitle}</p>
          )}

          {post.coverUrl && (
            <img
              src={post.coverUrl}
              alt={post.title}
              className="w-full h-72 object-cover rounded-2xl mb-8"
            />
          )}

          {/* Author row */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#2a2520]">
            <Link
              to={`/u/${post.author.username}`}
              className="w-9 h-9 rounded-full bg-[#2a2218] border border-[#3a3020] flex items-center justify-center text-xs font-bold text-[#c9a84c]"
            >
              {(post.author.name || "?").charAt(0).toUpperCase()}
            </Link>
            <div>
              <Link
                to={`/u/${post.author.username}`}
                className="text-sm font-semibold text-[#e8e0d4] font-sans-ui hover:text-[#c9a84c] transition-colors"
              >
                {post.author.name}
              </Link>
              <p className="font-sans-ui text-xs text-[#5a5248]">
                @{post.author.username} · {formatDate(post.publishedAt, i18n.language)} ·{" "}
                {t('post.minRead', { count: readTime })}
                {post.edited && <span className="ml-2 italic">({t('post.edited')})</span>}
              </p>
            </div>

            {post.tags?.length > 0 && (
              <div className="ml-auto flex gap-2 flex-wrap">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-sans-ui text-[10px] px-2.5 py-1 rounded-full bg-[#2a2218] border border-[#3a3020] text-[#c9a84c]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content — stored as editor HTML */}
          <div
            className="text-[#c8bea8] leading-relaxed text-base prose-inkspace
                       [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#f5e6c8] [&_h1]:mt-6 [&_h1]:mb-3
                       [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#e8e0d4] [&_h2]:mt-5 [&_h2]:mb-2
                       [&_blockquote]:border-l-2 [&_blockquote]:border-[#c9a84c]/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#7a7060]
                       [&_pre]:bg-[#161410] [&_pre]:border [&_pre]:border-[#2e2a24] [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:text-[#c9a84c] [&_pre]:text-sm [&_pre]:font-mono
                       [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-[#c9a84c] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Action bar */}
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-[#2a2520]">
            <button
              onClick={handleLike}
              aria-pressed={post.isLiked}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-sans-ui
                ${post.isLiked
                  ? "border-[#c9a84c]/60 text-[#c9a84c] bg-[#2a2218]"
                  : "border-[#3a3329] text-[#a09880] hover:border-[#c9a84c]/60 hover:text-[#c9a84c]"}`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill={post.isLiked ? "#c9a84c" : "none"} stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              {post.likes > 0 ? post.likes : ""}
            </button>

            <a
              href="#comments"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#3a3329] text-[#a09880]
                         hover:border-[#c9a84c]/60 hover:text-[#c9a84c] transition-all duration-200 text-sm font-sans-ui"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              {post.comments || 0}
            </a>

            {!post.isDraft && (
              <button
                onClick={() => setSharing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#3a3329] text-[#a09880]
                           hover:border-[#c9a84c]/60 hover:text-[#c9a84c] transition-all duration-200 text-sm font-sans-ui"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                </svg>
                {t('common.share')}
              </button>
            )}

            <button
              onClick={handleSave}
              aria-pressed={post.isSaved}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm font-sans-ui
                ${post.isSaved
                  ? "border-[#c9a84c]/60 text-[#c9a84c] bg-[#2a2218]"
                  : "border-[#3a3329] text-[#a09880] hover:border-[#c9a84c]/60 hover:text-[#c9a84c]"}`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill={post.isSaved ? "#c9a84c" : "none"} stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
              {t('nav.saved')}
            </button>

            {isOwner && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => navigate(`/create?edit=${post.id}`)}
                  className="px-4 py-2 rounded-full border border-[#3a3329] text-[#a09880] hover:border-[#c9a84c]/60
                             hover:text-[#c9a84c] transition-all duration-200 text-sm font-sans-ui"
                >
                  {t('post.editPost')}
                </button>
                <button
                  onClick={handleDeletePost}
                  className="px-4 py-2 rounded-full border border-red-900/50 text-red-400 hover:border-red-500/60
                             hover:text-red-300 transition-all duration-200 text-sm font-sans-ui"
                >
                  {t('post.deletePost')}
                </button>
              </div>
            )}
          </div>
        </article>

        {/* ── Comments ──────────────────────────────────────────────── */}
        <section id="comments" className="mt-10">
          <h2 className="text-[#e8e0d4] text-lg font-semibold font-sans-ui mb-5">
            {t('post.comments')} · {post.comments || 0}
          </h2>

          {/* Composer */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="flex items-start gap-3 mb-6">
              <textarea
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t('post.addComment')}
                className="flex-1 bg-[#1a1814] border border-[#2e2a24] rounded-xl px-4 py-3 text-sm text-[#e8e0d4]
                           placeholder-[#3a3329] font-sans-ui focus:outline-none focus:border-[#c9a84c]/50 resize-none"
              />
              <button
                type="submit"
                disabled={posting || !commentText.trim()}
                className="px-5 py-3 rounded-xl bg-[#c9a84c] text-[#0e0e0e] text-sm font-semibold font-sans-ui
                           hover:bg-[#e2c97e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? "…" : t('post.addCommentCta')}
              </button>
            </form>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="w-full mb-6 py-3 rounded-xl border border-[#3a3329] text-[#a09880] text-sm font-sans-ui
                         hover:border-[#c9a84c]/60 hover:text-[#c9a84c] transition-all"
            >
              {t('common.signIn')} — {t('post.addComment')}
            </button>
          )}

          {/* List */}
          {comments.length === 0 ? (
            <p className="text-[#5a5248] text-sm font-sans-ui py-4">{t('post.commentsEmpty')}</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => {
                const canDelete = isAuthenticated && user && (String(c.author.id) === String(user.id) || isOwner)
                return (
                  <li key={c.id} className="flex items-start gap-3">
                    <Link
                      to={`/u/${c.author.username}`}
                      className="w-8 h-8 rounded-full bg-[#2a2218] border border-[#3a3020] flex items-center justify-center
                                 text-[11px] font-bold text-[#c9a84c] flex-shrink-0"
                    >
                      {(c.author.name || "?").charAt(0).toUpperCase()}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans-ui text-[#7a7060]">
                        <Link to={`/u/${c.author.username}`} className="text-[#c9a84c] hover:text-[#e2c97e] font-semibold">
                          {c.author.name}
                        </Link>{" "}
                        · {new Date(c.createdAt).toLocaleDateString(i18n.language)}
                      </p>
                      <p className="text-sm text-[#c8bea8] font-sans-ui mt-1 leading-relaxed break-words">{c.content}</p>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-[#5a5248] hover:text-red-400 text-xs font-sans-ui transition-colors flex-shrink-0"
                      >
                        {t('post.deleteComment')}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <ShareModal
        isOpen={sharing}
        onClose={() => setSharing(false)}
        article={post}
      />
    </AppLayout>
  )
}
