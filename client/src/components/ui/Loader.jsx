/**
 * <Loader />
 * Full-screen overlay shown while the app is initializing or
 * a heavy data fetch is in progress.
 *
 * Usage:
 *   {isLoading && <Loader />}
 *
 * TODO: accept a `message` prop for contextual loading text.
 */
export default function Loader() {
  return (
    <div
      role="status"
      aria-label="Loading Inkspace"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center
                 bg-[#0e0e0e]"
    >
      {/* ── Animated ring + logo monogram ──────────────────────────── */}
      <div className="relative mb-8">
        {/* Outer spinning gradient ring */}
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent
                     border-t-[#c9a84c] border-r-[#c9a84c30]
                     animate-spin"
          style={{ width: 80, height: 80, animationDuration: "1.1s" }}
          aria-hidden="true"
        />
        {/* Secondary slower ring for depth */}
        <span
          className="absolute inset-2 rounded-full border border-[#c9a84c15]
                     animate-spin"
          style={{ animationDuration: "2.4s", animationDirection: "reverse" }}
          aria-hidden="true"
        />

        {/* Logo monogram */}
        <div
          className="relative w-20 h-20 rounded-full bg-[#161616] border border-[#2a2a2a]
                     flex items-center justify-center"
        >
          <span
            className="text-3xl font-bold text-[#c9a84c] select-none animate-pulse"
            style={{ fontFamily: "'Georgia', serif", animationDuration: "2s" }}
          >
            I
          </span>
        </div>
      </div>

      {/* ── Brand wordmark ─────────────────────────────────────────── */}
      <p
        className="text-[#e8e0d4] text-2xl font-semibold tracking-widest
                   animate-pulse"
        style={{
          fontFamily: "'Georgia', serif",
          animationDuration: "2s",
          animationDelay: "0.3s",
        }}
      >
        Inkspace
      </p>

      {/* ── Subtle tagline ─────────────────────────────────────────── */}
      <p
        className="mt-2 text-[#7a7060] text-xs tracking-[0.25em] uppercase
                   font-sans-ui"
        style={{ animationDelay: "0.5s" }}
      >
        Loading your editorial…
      </p>

      {/* ── Gold shimmer progress bar ──────────────────────────────── */}
      <div className="mt-10 w-40 h-px bg-[#2a2a2a] overflow-hidden rounded-full">
        <div
          className="h-full bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent
                     animate-[shimmer_1.8s_ease-in-out_infinite]"
          style={{ width: "60%" }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
