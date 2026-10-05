import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import AppLayout       from "../components/layout/AppLayout"
import PostCard        from "../components/ui/PostCard"
import ShareModal      from "../components/ui/ShareModal"
import EmptyFeedState  from "../components/feed/EmptyFeedState"
import Loader          from "../components/ui/Loader"
import { fetchFeed }   from "../api/posts"

const PAGE_SIZE = 20

/**
 * <FeedPage />
 * Primary editorial feed — fetches GET /api/feed, supports paging and sharing.
 */
export default function FeedPage() {
  const { t } = useTranslation()

  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]       = useState("")
  const [hasMore, setHasMore]   = useState(false)
  const [shareTarget, setShareTarget] = useState(null)

  const load = useCallback(async (offset = 0) => {
    if (offset === 0) setLoading(true)
    else setLoadingMore(true)
    setError("")
    try {
      const data = await fetchFeed({ limit: PAGE_SIZE, offset })
      const list = data?.posts || []
      setPosts((prev) => (offset ? [...prev, ...list] : list))
      setHasMore(list.length === PAGE_SIZE)
    } catch (err) {
      setError(err.message || t('feed.error'))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [t])

  useEffect(() => {
    load(0)
  }, [load])

  return (
    <AppLayout>
      {/* ── Page header ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-[#e8e0d4] text-2xl font-bold leading-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {t('feed.title')}
          </h1>
          <p className="text-[#7a7060] text-sm font-sans-ui mt-0.5">
            {posts.length > 0
              ? t('feed.subtitleCount', { count: posts.length })
              : t('feed.subtitleEmpty')}
          </p>
        </div>
      </header>

      {/* ── Feed content ─────────────────────────────────────────────── */}
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-[#9a9080] text-sm font-sans-ui mb-4">{error}</p>
          <button
            onClick={() => load(0)}
            className="px-5 py-2.5 rounded-full bg-[#c9a84c] text-[#0e0e0e] text-sm font-semibold font-sans-ui hover:bg-[#e2c97e] transition-colors"
          >
            {t('common.loadMore')}
          </button>
        </div>
      ) : posts.length === 0 ? (
        <EmptyFeedState />
      ) : (
        <section aria-label="Article feed" className="space-y-0">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onShare={() => setShareTarget(post)}
            />
          ))}

          {hasMore && (
            <div className="text-center py-8">
              <button
                onClick={() => load(posts.length)}
                disabled={loadingMore}
                className="text-[#7a7060] text-sm font-sans-ui hover:text-[#c9a84c]
                           transition-colors duration-200 disabled:opacity-50"
              >
                {loadingMore ? t('common.loading') : t('feed.loadMore')}
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Share Modal ───────────────────────────────────────────────── */}
      <ShareModal
        isOpen={!!shareTarget}
        onClose={() => setShareTarget(null)}
        article={shareTarget}
      />
    </AppLayout>
  )
}
