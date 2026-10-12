import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { LANGUAGES, setLanguage } from "../../i18n"

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3 12h18M12 3c-1.8 2.4-2.7 5.4-2.7 9s.9 6.6 2.7 9c1.8-2.4 2.7-5.4 2.7-9s-.9-6.6-2.7-9z" />
    </svg>
  )
}

/**
 * <LanguageSwitcher />
 * Small dropdown to change the UI language (persisted by i18n/index.js).
 */
export default function LanguageSwitcher({ compact = false, align = "right" }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = LANGUAGES.find((l) => l.code === (i18n.resolvedLanguage || "en")) || LANGUAGES[0]

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const alignmentClass = align === "left" ? "left-0" : "right-0"

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('nav.language')}
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#3a3329] text-[#a09880]
                   hover:border-[#c9a84c]/60 hover:text-[#c9a84c] transition-all duration-200 text-sm font-sans-ui"
      >
        <GlobeIcon />
        {!compact && <span>{current.label}</span>}
      </button>

      {open && (
        <div className={`absolute ${alignmentClass} mt-2 z-50 w-44 bg-[#161616] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden py-1`}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLanguage(l.code); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm font-sans-ui transition-colors flex items-center justify-between
                ${l.code === current.code ? "text-[#c9a84c] bg-[#1f1c16] font-medium" : "text-[#e8e0d4] hover:bg-[#1a1a1a]"}`}
            >
              <span>{l.label}</span>
              {l.code === current.code && (
                <span className="text-[#c9a84c] text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
