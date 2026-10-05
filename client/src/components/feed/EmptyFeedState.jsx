import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

/**
 * <EmptyFeedState />
 * Shown in <FeedPage /> when the fetched posts array is empty
 * (i.e. the user hasn't followed any writers yet).
 */
export default function EmptyFeedState() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">

      {/* ── SVG Illustration — open book / quill ────────────────────── */}
      <div className="mb-8 animate-float" aria-hidden="true">
        <svg
          viewBox="0 0 120 100"
          className="w-36 h-auto opacity-60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Book pages */}
          <path
            d="M10 20 Q60 10 110 20 L110 80 Q60 70 10 80 Z"
            fill="#1a1a1a"
            stroke="#2a2a2a"
            strokeWidth="1.5"
          />
          {/* Left page lines */}
          <line x1="18" y1="35" x2="55" y2="31" stroke="#3a3329" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="18" y1="43" x2="55" y2="39" stroke="#3a3329" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="18" y1="51" x2="55" y2="47" stroke="#3a3329" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="18" y1="59" x2="55" y2="55" stroke="#3a3329" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Right page lines */}
          <line x1="65" y1="31" x2="102" y2="35" stroke="#3a3329" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="65" y1="39" x2="102" y2="43" stroke="#3a3329" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="65" y1="47" x2="102" y2="51" stroke="#3a3329" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Spine divider */}
          <line x1="60" y1="12" x2="60" y2="78" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          {/* Quill */}
          <path
            d="M72 18 C85 5 100 8 98 22 C96 36 80 40 72 52 L70 48 C77 38 90 34 91 22 C92 14 84 10 72 18Z"
            fill="#c9a84c"
            opacity="0.7"
          />
          <path d="M72 52 L68 62 L73 55Z" fill="#c9a84c" opacity="0.5"/>
          {/* Stars/dots scattered */}
          <circle cx="20" cy="12" r="1.5" fill="#c9a84c" opacity="0.4"/>
          <circle cx="95" cy="85" r="1"   fill="#c9a84c" opacity="0.3"/>
          <circle cx="8"  cy="60" r="1"   fill="#c9a84c" opacity="0.25"/>
        </svg>
      </div>

      {/* ── Heading ─────────────────────────────────────────────────── */}
      <h2
        className="text-2xl font-semibold text-[#e8e0d4] mb-3 leading-snug"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {t('feed.emptyTitle')}
      </h2>

      {/* ── Subtitle ────────────────────────────────────────────────── */}
      <p className="text-[#7a7060] text-[15px] leading-relaxed max-w-xs font-sans-ui mb-8">
        {t('feed.emptyText')}
      </p>

      {/* ── CTA Button ──────────────────────────────────────────────── */}
      <Link
        to="/search"
        className="inline-flex items-center gap-2
                   bg-[#c9a84c] hover:bg-[#e2c97e]
                   text-[#0e0e0e] font-semibold text-sm
                   px-6 py-3 rounded-full
                   transition-all duration-200
                   hover:scale-[1.02] active:scale-[0.98]
                   font-sans-ui tracking-wide"
      >
        <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 7.5l-2 4-2-4 4-2-2 4" fill="currentColor" opacity="0.8"/>
        </svg>
        {t('feed.discoverWriters')}
      </Link>

      {/* ── Divider + secondary link ─────────────────────────────────── */}
      <div className="flex items-center gap-3 mt-6 text-[#7a7060] text-sm font-sans-ui">
        <span className="w-10 h-px bg-[#2a2a2a]" />
        <span>{t('common.or')}</span>
        <span className="w-10 h-px bg-[#2a2a2a]" />
      </div>
      <Link
        to="/create"
        className="mt-4 text-[#c9a84c] hover:text-[#e2c97e] text-sm font-medium
                   font-sans-ui underline underline-offset-4 transition-colors duration-200"
      >
        {t('feed.writeFirst')}
      </Link>
    </div>
  )
}
