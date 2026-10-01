import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSaved(false)
    setForm({
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
    })
  }, [isOpen, user])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setSaved(false)
  }

  function handleSave(event) {
    event.preventDefault()
    updateUser({
      name: form.name.trim() || user?.name,
      username: form.username.trim().replace(/^@/, "") || user?.username,
      bio: form.bio.trim(),
      location: form.location.trim(),
      website: form.website.trim().replace(/^https?:\/\//, ""),
    })
    setSaved(true)
  }

  const fieldClass =
    "w-full rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2.5 text-sm font-sans-ui text-[#e8e0d4] placeholder:text-[#5c564c] focus:outline-none focus:border-[#c9a84c]/50"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <form
        onSubmit={handleSave}
        className="w-full max-w-md bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
          <h2 className="text-[#e8e0d4] font-semibold text-base font-sans-ui">Edit profile</h2>
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

        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <label className="block">
            <span className="block text-xs text-[#7a7060] font-sans-ui mb-1">Name</span>
            <input name="name" value={form.name} onChange={handleChange} className={fieldClass} />
          </label>
          <label className="block">
            <span className="block text-xs text-[#7a7060] font-sans-ui mb-1">Username</span>
            <input name="username" value={form.username} onChange={handleChange} className={fieldClass} />
          </label>
          <label className="block">
            <span className="block text-xs text-[#7a7060] font-sans-ui mb-1">Bio</span>
            <textarea name="bio" rows={3} value={form.bio} onChange={handleChange} className={`${fieldClass} resize-none`} />
          </label>
          <label className="block">
            <span className="block text-xs text-[#7a7060] font-sans-ui mb-1">Location</span>
            <input name="location" value={form.location} onChange={handleChange} className={fieldClass} placeholder="City" />
          </label>
          <label className="block">
            <span className="block text-xs text-[#7a7060] font-sans-ui mb-1">Website</span>
            <input name="website" value={form.website} onChange={handleChange} className={fieldClass} placeholder="your-site.com" />
          </label>
        </div>

        <div className="px-5 py-4 border-t border-[#1f1f1f] flex items-center justify-between gap-3">
          <p className="text-xs font-sans-ui text-[#7a7060]">
            {saved ? "Saved on this device." : "Changes stay on this device for now."}
          </p>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#c9a84c] text-[#0e0e0e] text-sm font-semibold font-sans-ui hover:brightness-110"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
