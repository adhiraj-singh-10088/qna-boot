import { useState } from "react"

/**
 * <DiscoverUserCard />
 * A single row card for the Discover/Suggestions page.
 *
 * Props:
 *  user: {
 *    id, name, username, avatar (optional),
 *    bio, articlesCount, followersCount
 *  }
 *
 * TODO: wire Follow / Unfollow to POST/DELETE /api/follows/:userId
 */
export default function DiscoverUserCard({ user }) {
  /*
   * followState: "none" | "requested" | "following"
   * For a public follow model use "following"; for private use "requested" first.
   * TODO: initialise from user.isFollowing / user.hasRequested
   */
  const [followState, setFollowState] = useState("none")

  const handleFollow = () => {
    if (followState === "none") {
      // TODO: POST /api/follows/:user.id
      setFollowState("following")
    } else if (followState === "following" || followState === "requested") {
      // TODO: DELETE /api/follows/:user.id
      setFollowState("none")
    }
  }

  const buttonConfig = {
    none:      { label: "Follow",      cls: "bg-[#c9a84c] text-[#0e0e0e] hover:bg-[#e2c97e]" },
    requested: { label: "Requested",   cls: "bg-[#1f1f1f] text-[#7a7060] border border-[#3a3329]" },
    following: { label: "Following",   cls: "bg-[#1f1f1f] text-[#c9a84c]  border border-[#3a3329]" },
  }
  const { label, cls } = buttonConfig[followState]

  const {
    name          = "Unknown Author",
    username      = "unknown",
    avatar        = null,
    bio           = "",
    articlesCount = 0,
    followersCount = 0,
  } = user ?? {}

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-2xl
                 bg-[#111111] border border-[#1f1f1f]
                 hover:border-[#2a2a2a] transition-all duration-300 group"
    >
      {/* ── Avatar ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 relative">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[#2a2a2a]
                       group-hover:ring-[#c9a84c30] transition-all duration-300"
          />
        ) : (
          <span
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]
                       flex items-center justify-center text-[#c9a84c] font-bold text-lg
                       ring-2 ring-[#2a2a2a] group-hover:ring-[#c9a84c30]
                       transition-all duration-300"
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}
        {/* Active indicator dot — optional, remove if not needed */}
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full
                         bg-[#0e0e0e] border-2 border-[#0e0e0e]" />
      </div>

      {/* ── Info block ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {/* Name + username */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span
            className="text-[#e8e0d4] text-sm font-semibold font-sans-ui
                       group-hover:text-[#c9a84c] transition-colors duration-200 cursor-pointer"
            // TODO: navigate to /profile/:username
          >
            {name}
          </span>
          <span className="text-[#7a7060] text-xs font-sans-ui">@{username}</span>
        </div>

        {/* Bio snippet */}
        {bio && (
          <p className="text-[#9a9080] text-xs mt-1 font-sans-ui leading-relaxed line-clamp-2">
            {bio}
          </p>
        )}

        {/* Mini stats */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[#7a7060] text-xs font-sans-ui">
            <span className="text-[#c9a84c] font-semibold">{articlesCount}</span> articles
          </span>
          <span className="text-[#3a3329]">·</span>
          <span className="text-[#7a7060] text-xs font-sans-ui">
            <span className="text-[#c9a84c] font-semibold">
              {followersCount >= 1000
                ? `${(followersCount / 1000).toFixed(1)}k`
                : followersCount}
            </span>{" "}
            followers
          </span>
        </div>
      </div>

      {/* ── Follow toggle button ────────────────────────────────────── */}
      <button
        onClick={handleFollow}
        aria-label={`${label} ${name}`}
        className={`flex-shrink-0 px-4 py-1.5 rounded-full
                    text-xs font-semibold font-sans-ui
                    transition-all duration-200
                    hover:scale-[1.03] active:scale-[0.97]
                    ${cls}`}
      >
        {label}
      </button>
    </div>
  )
}
