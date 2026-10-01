import { useState } from "react"
import AppLayout       from "../components/layout/AppLayout"
import PostCard        from "../components/ui/PostCard"
import ShareModal      from "../components/ui/ShareModal"
import EmptyFeedState  from "../components/feed/EmptyFeedState"

/*
 * ── Demo seed data ──────────────────────────────────────────────────
 * Replace this array with real data fetched from your API.
 * Suggested pattern:
 *   const { data: posts, isLoading } = useQuery(["feed"], fetchFeed)
 */
const DEMO_POSTS = [
  {
    id: "p1",
    author: {
      name:     "Meera Krishnan",
      username: "meera.writes",
      avatar:   null,
    },
    publishedAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min ago
    title:   "The Architecture of Silence: How Empty Spaces Define Modern Literature",
    excerpt: "In contemporary fiction, what goes unsaid carries as much weight as the written word. Writers like Ishiguro and Modiano have mastered the grammar of omission — leaving readers to inhabit the white space between sentences.",
    heroImage:  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    likes:      142,
    comments:   28,
    isLiked:    false,
    isSaved:    false,
  },
  {
    id: "p2",
    author: {
      name:     "James Okonkwo",
      username: "jamesokonkwo",
      avatar:   null,
    },
    publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hrs ago
    title:   "On the Ethics of the Algorithm: Who Decides What We Read?",
    excerpt: "Recommendation engines have become the invisible editors of the digital age. But the values baked into their loss functions — engagement, retention, virality — may be antithetical to the mission of serious writing.",
    heroImage:  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    likes:      89,
    comments:   41,
    isLiked:    true,
    isSaved:    true,
  },
]

/**
 * <FeedPage />
 * Primary editorial feed page.
 *
 * State:
 *  - posts: array of post objects (TODO: fetch from GET /api/feed)
 *  - shareTarget: post being shared (drives ShareModal)
 *
 * To switch between empty state and populated feed,
 * set DEMO_POSTS to [] or populate it.
 */
export default function FeedPage() {
  /*
   * Initialize with an empty array to show the EmptyFeedState by default.
   * When the backend is ready, replace this with fetched data or update via useEffect.
   * e.g., const { data: posts = [], isLoading } = useQuery(["feed"], fetchFeed)
   */
  const [posts, setPosts] = useState([])


  /* ShareModal state — which post is being shared */
  const [shareTarget, setShareTarget] = useState(null)

  return (
    <AppLayout>
      {/* ── Page header ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-[#e8e0d4] text-2xl font-bold leading-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Your Feed
          </h1>
          <p className="text-[#7a7060] text-sm font-sans-ui mt-0.5">
            {posts.length > 0
              ? `${posts.length} new articles from writers you follow`
              : "Discover writers to populate your feed"}
          </p>
        </div>

        {/* Filter / sort button — hook up dropdown later */}
        {posts.length > 0 && (
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                       bg-[#161616] border border-[#2a2a2a] text-[#7a7060]
                       hover:text-[#e8e0d4] hover:border-[#3a3329]
                       text-xs font-medium font-sans-ui transition-all duration-200"
            aria-label="Filter feed"
            // TODO: open filter/sort sheet
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none"
                 stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" d="M3 5h14M6 10h8M9 15h2"/>
            </svg>
            Filter
          </button>
        )}
      </header>

      {/* ── Feed content ─────────────────────────────────────────────── */}
      {posts.length === 0 ? (
        /* Empty state — shown when user has no followed writers yet */
        <EmptyFeedState />
      ) : (
        /* Populated feed — maps each post to a PostCard */
        <section aria-label="Article feed" className="space-y-0">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onShare={() => setShareTarget(post)}
            />
          ))}

          {/* Load more trigger — TODO: replace with infinite scroll */}
          <div className="text-center py-8">
            <button
              className="text-[#7a7060] text-sm font-sans-ui
                         hover:text-[#c9a84c] transition-colors duration-200"
              // TODO: fetchNextPage() from react-query infinite query
            >
              Load more articles ↓
            </button>
          </div>
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
