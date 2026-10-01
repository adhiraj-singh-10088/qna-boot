import { useEffect, useState } from "react"

export default function ShareProfileModal({ isOpen, onClose, username, name }) {
  const [copied, setCopied] = useState(false)
  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile`
    : "/profile"

  useEffect(() => {
    if (!isOpen) return
    setCopied(false)
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      copyLink()
      return
    }
    try {
      await navigator.share({
        title: name ? `${name} on Inkspace` : "Inkspace profile",
        text: username ? `Check out @${username} on Inkspace` : "Check out this Inkspace profile",
        url: profileUrl,
      })
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share profile"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
          <h2 className="text-[#e8e0d4] font-semibold text-base font-sans-ui">Share profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#7a7060] hover:text-[#e8e0d4] hover:bg-[#2a2a2a]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-2">
          <p className="text-xs text-[#7a7060] font-sans-ui truncate mb-3">{profileUrl}</p>
          <button
            type="button"
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#c9a84c] text-[#0e0e0e] text-sm font-semibold font-sans-ui hover:brightness-110"
          >
            {copied ? "Link copied" : "Copy profile link"}
          </button>
          <button
            type="button"
            onClick={nativeShare}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-[#e8e0d4] text-sm font-medium font-sans-ui hover:bg-[#1f1f1f]"
          >
            Share via…
          </button>
        </div>
      </div>
    </div>
  )
}
