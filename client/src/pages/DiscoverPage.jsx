import { useState } from "react"
import AppLayout        from "../components/layout/AppLayout"
import DiscoverUserCard from "../components/discover/DiscoverUserCard"

/**
 * <DiscoverPage />
 * Two-section layout:
 *  1. Follow Requests — incoming requests to accept/decline
 *  2. Suggested for You — algorithmically recommended authors
 *
 * TODO: wire accept/decline buttons on request cards to
 *       POST /api/follow-requests/:id/accept  or  DELETE /api/follow-requests/:id
 */
export default function DiscoverPage() {
  /*
   * Initialize with empty arrays. 
   * When the backend is ready, replace with fetched data.
   * e.g., const { data: incomingRequests = [] } = useQuery(["follow-requests"], fetchRequests)
   */
  const [incomingRequests, setIncomingRequests] = useState([])
  const [suggestedAuthors, setSuggestedAuthors] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <AppLayout>
      {/* ── Page heading ─────────────────────────────────────────────── */}
      <header className="mb-6">
        <h1
          className="text-[#e8e0d4] text-2xl font-bold"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Search
        </h1>
        <p className="text-[#7a7060] text-sm font-sans-ui mt-0.5">
          Find writers and thinkers to follow
        </p>
      </header>

      {/* ── Section 1: Follow Requests ───────────────────────────────── */}
      {incomingRequests.length > 0 && (
        <section className="mb-8" aria-label="Follow requests">
          <h2 className="text-[#e8e0d4] text-sm font-semibold font-sans-ui uppercase
                         tracking-widest mb-3 text-[#7a7060]">
            Follow Requests
            <span className="ml-2 bg-[#c9a84c] text-[#0e0e0e] text-[10px] font-bold
                             px-1.5 py-0.5 rounded-full">
              {incomingRequests.length}
            </span>
          </h2>

          <div className="space-y-3">
            {incomingRequests.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-4 rounded-2xl
                           bg-[#111111] border border-[#1f1f1f]"
              >
                {/* Avatar */}
                <span
                  className="w-11 h-11 rounded-full bg-[#2a2a2a] flex-shrink-0
                             flex items-center justify-center
                             text-[#c9a84c] font-bold ring-1 ring-[#3a3329]"
                >
                  {user.name.charAt(0)}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#e8e0d4] text-sm font-semibold font-sans-ui">
                    {user.name}
                  </p>
                  <p className="text-[#7a7060] text-xs font-sans-ui">
                    @{user.username} · {user.bio}
                  </p>
                </div>

                {/* Accept / Decline buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className="px-3 py-1.5 rounded-full bg-[#c9a84c] text-[#0e0e0e]
                               text-xs font-semibold font-sans-ui
                               hover:bg-[#e2c97e] transition-all duration-200"
                    aria-label={`Accept follow request from ${user.name}`}
                    // TODO: POST /api/follow-requests/:user.id/accept
                  >
                    Accept
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-full bg-[#1f1f1f] text-[#7a7060]
                               border border-[#2a2a2a] text-xs font-semibold font-sans-ui
                               hover:text-[#e8e0d4] hover:border-[#3a3329]
                               transition-all duration-200"
                    aria-label={`Decline follow request from ${user.name}`}
                    // TODO: DELETE /api/follow-requests/:user.id
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Section divider */}
          <div className="h-px bg-[#1f1f1f] mt-6" />
        </section>
      )}

      {/* ── Section 2: Suggested Authors ─────────────────────────────── */}
      <section aria-label="Suggested authors">
        <h2 className="text-[#7a7060] text-sm font-semibold font-sans-ui uppercase
                       tracking-widest mb-3">
          Suggested for You
        </h2>

        {/* Search / filter bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 mb-4
                        bg-[#161616] border border-[#2a2a2a] rounded-xl
                        focus-within:border-[#c9a84c30] transition-colors duration-200">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#7a7060] flex-shrink-0"
               fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7"/>
            <path strokeLinecap="round" d="M16.5 16.5L21 21"/>
          </svg>
          <input
            type="search"
            placeholder="Search writers…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[#e8e0d4] text-sm
                       placeholder:text-[#7a7060] outline-none font-sans-ui"
            // TODO: wire up search query logic
          />
        </div>

        {/* Cards list or Empty State */}
        {suggestedAuthors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#2a2a2a] rounded-2xl bg-[#111111]">
            <svg className="w-12 h-12 text-[#3a3329] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-[#e8e0d4] text-base font-medium font-sans-ui mb-1">
              No suggestions right now
            </h3>
            <p className="text-[#7a7060] text-sm font-sans-ui max-w-xs">
              Check back later for new writers to discover as the community grows.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestedAuthors.map((user) => (
              <DiscoverUserCard key={user.id} user={user} />
            ))}
          </div>
        )}

        {/* Load more */}
        {suggestedAuthors.length > 0 && (
          <div className="text-center py-8">
            <button
              className="text-[#7a7060] text-sm font-sans-ui
                         hover:text-[#c9a84c] transition-colors duration-200"
              // TODO: load next page of suggestions
            >
              Load more suggestions ↓
            </button>
          </div>
        )}
      </section>
    </AppLayout>
  )
}

