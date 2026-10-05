import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/AuthContext"
import { followUser, unfollowUser } from "../../api/follows"

/**
 * <DiscoverUserCard />
 * Row card for the Discover/Search page — follow button is API-wired.
 */
export default function DiscoverUserCard({ user }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  const [followState, setFollowState] = useState(
    user?.isFollowing ? "following" : user?.hasPendingRequest ? "requested" : "none",
  )
  const [busy, setBusy] = useState(false)

  const handleFollow = async () => {
    if (!isAuthenticated) { navigate("/login"); return }
    if (busy) return
    setBusy(true)
    try {
      if (followState === "none") {
        const res = await followUser(user.username)
        setFollowState(res.status === "requested" ? "requested" : "following")
      } else {
        await unfollowUser(user.username)
        setFollowState("none")
      }
    } catch (err) {
      window.alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  const buttonConfig = {
    none:      { label: t('common.follow'),     cls: "bg-[#c9a84c] text-[#0e0e0e] hover:bg-[#e2c97e]" },
    requested: { label: t('common.requested'),  cls: "bg-[#1f1f1f] text-[#7a7060] border border-[#3a3329]" },
    following: { label: t('common.following'),  cls: "bg-[#1f1f1f] text-[#c9a84c] border border-[#3a3329]" },
  }
  const { label, cls } = buttonConfig[followState]

  const {
    name           = t('common.anonymous'),
    username       = "unknown",
    avatar         = null,
    bio            = "",
    followerCount  = 0,
    isPrivate      = false,
    followsYou     = false,
  } = user ?? {}

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-2xl
                 bg-[#111111] border border-[#1f1f1f]
                 hover:border-[#2a2a2a] transition-all duration-300 group"
    >
      {/* ── Avatar ─────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => navigate(`/u/${username}`)}
        className="flex-shrink-0"
        aria-label={`@${username}`}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#2a2a2a] group-hover:ring-[#c9a84c30] transition-all duration-300"
          />
        ) : (
          <span
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]
                       flex items-center justify-center text-[#c9a84c] font-bold text-lg
                       ring-2 ring-[#2a2a2a] group-hover:ring-[#c9a84c30] transition-all duration-300"
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {/* ── Info block ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(`/u/${username}`)}
            className="text-[#e8e0d4] text-sm font-semibold font-sans-ui
                       group-hover:text-[#c9a84c] transition-colors duration-200"
          >
            {name}
          </button>
          <span className="text-[#7a7060] text-xs font-sans-ui">@{username}</span>
          {isPrivate && (
            <span className="font-sans-ui text-[9px] px-1.5 py-0.5 rounded-full bg-[#2a2218] border border-[#3a3020] text-[#c9a84c] uppercase tracking-wider">
              {t('search.privateAccount')}
            </span>
          )}
          {followsYou && (
            <span className="font-sans-ui text-[9px] px-1.5 py-0.5 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] text-[#7a7060]">
              {t('search.followsYou')}
            </span>
          )}
        </div>

        {bio && (
          <p className="text-[#9a9080] text-xs mt-1 font-sans-ui leading-relaxed line-clamp-2">{bio}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <span className="text-[#7a7060] text-xs font-sans-ui">
            <span className="text-[#c9a84c] font-semibold">
              {followerCount >= 1000 ? `${(followerCount / 1000).toFixed(1)}k` : followerCount}
            </span>{" "}
            {t('profile.followers').toLowerCase()}
          </span>
        </div>
      </div>

      {/* ── Follow toggle button ────────────────────────────────────── */}
      <button
        onClick={handleFollow}
        disabled={busy}
        aria-label={`${label} ${name}`}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full
                    text-xs font-semibold font-sans-ui
                    transition-all duration-200
                    hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60
                    ${cls}`}
      >
        {label}
      </button>
    </div>
  )
}
