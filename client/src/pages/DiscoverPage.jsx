import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import AppLayout        from "../components/layout/AppLayout"
import DiscoverUserCard from "../components/discover/DiscoverUserCard"
import Loader from "../components/ui/Loader"
import { searchUsers } from "../api/users"
import { acceptFollowRequest, declineFollowRequest, fetchFollowRequests } from "../api/follows"

/**
 * <DiscoverPage />
 *  1. Follow Requests — pending requests to accept/decline (API-wired)
 *  2. Search / Suggestions — live user search via GET /api/users/search
 */
export default function DiscoverPage() {
  const { t } = useTranslation()
  const [requests, setRequests] = useState([])
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [busyRequests, setBusyRequests] = useState({})
  const debounceRef = useRef(null)

  const loadRequests = useCallback(async () => {
    try {
      const data = await fetchFollowRequests()
      setRequests(data?.requests || [])
    } catch {
      setRequests([])
    }
  }, [])

  const loadUsers = useCallback(async (query) => {
    setLoading(true)
    try {
      const data = await searchUsers(query)
      setUsers(data?.users || [])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRequests()
    loadUsers("")
  }, [loadRequests, loadUsers])

  /* Debounced live search */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => loadUsers(searchQuery.trim()), 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery, loadUsers])

  const handleAccept = async (user) => {
    setBusyRequests((b) => ({ ...b, [user.id]: true }))
    try {
      await acceptFollowRequest(user.id)
      setRequests((prev) => prev.filter((r) => r.id !== user.id))
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusyRequests((b) => ({ ...b, [user.id]: false }))
    }
  }

  const handleDecline = async (user) => {
    setBusyRequests((b) => ({ ...b, [user.id]: true }))
    try {
      await declineFollowRequest(user.id)
      setRequests((prev) => prev.filter((r) => r.id !== user.id))
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusyRequests((b) => ({ ...b, [user.id]: false }))
    }
  }

  return (
    <AppLayout>
      {/* ── Page heading ─────────────────────────────────────────────── */}
      <header className="mb-6">
        <h1 className="text-[#e8e0d4] text-2xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>
          {t('search.title')}
        </h1>
        <p className="text-[#7a7060] text-sm font-sans-ui mt-0.5">{t('search.subtitle')}</p>
      </header>

      {/* ── Section 1: Follow Requests ───────────────────────────────── */}
      {requests.length > 0 && (
        <section className="mb-8" aria-label={t('search.followRequests')}>
          <h2 className="text-sm font-semibold font-sans-ui uppercase tracking-widest mb-3 text-[#7a7060]">
            {t('search.followRequests')}
            <span className="ml-2 bg-[#c9a84c] text-[#0e0e0e] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {requests.length}
            </span>
          </h2>

          <div className="space-y-3">
            {requests.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#111111] border border-[#1f1f1f]"
              >
                <span className="w-11 h-11 rounded-full bg-[#2a2a2a] flex-shrink-0 flex items-center justify-center text-[#c9a84c] font-bold ring-1 ring-[#3a3329]">
                  {(user.name || "?").charAt(0).toUpperCase()}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-[#e8e0d4] text-sm font-semibold font-sans-ui">{user.name}</p>
                  <p className="text-[#7a7060] text-xs font-sans-ui truncate">@{user.username}{user.bio ? ` · ${user.bio}` : ""}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAccept(user)}
                    disabled={busyRequests[user.id]}
                    className="px-3 py-1.5 rounded-full bg-[#c9a84c] text-[#0e0e0e] text-xs font-semibold font-sans-ui
                               hover:bg-[#e2c97e] transition-all duration-200 disabled:opacity-60"
                  >
                    {t('common.accept')}
                  </button>
                  <button
                    onClick={() => handleDecline(user)}
                    disabled={busyRequests[user.id]}
                    className="px-3 py-1.5 rounded-full bg-[#1f1f1f] text-[#7a7060] border border-[#2a2a2a]
                               text-xs font-semibold font-sans-ui hover:text-[#e8e0d4] hover:border-[#3a3329]
                               transition-all duration-200 disabled:opacity-60"
                  >
                    {t('common.decline')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-[#1f1f1f] mt-6" />
        </section>
      )}

      {/* ── Section 2: Search / Suggested ────────────────────────────── */}
      <section aria-label={t('search.suggested')}>
        <h2 className="text-[#7a7060] text-sm font-semibold font-sans-ui uppercase tracking-widest mb-3">
          {searchQuery ? t('common.search') : t('search.suggested')}
        </h2>

        <div className="flex items-center gap-2 px-3 py-2.5 mb-4 bg-[#161616] border border-[#2a2a2a] rounded-xl
                        focus-within:border-[#c9a84c30] transition-colors duration-200">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#7a7060] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7"/><path strokeLinecap="round" d="M16.5 16.5L21 21"/>
          </svg>
          <input
            type="search"
            placeholder={t('search.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[#e8e0d4] text-sm placeholder:text-[#7a7060] outline-none font-sans-ui"
          />
        </div>

        {loading ? (
          <Loader />
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#2a2a2a] rounded-2xl bg-[#111111]">
            <svg className="w-12 h-12 text-[#3a3329] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-[#e8e0d4] text-base font-medium font-sans-ui mb-1">{t('search.noSuggestions')}</h3>
            <p className="text-[#7a7060] text-sm font-sans-ui max-w-xs">{t('search.noSuggestionsText')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <DiscoverUserCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  )
}
