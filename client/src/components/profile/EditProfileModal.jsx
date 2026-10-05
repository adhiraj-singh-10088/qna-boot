import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../context/AuthContext"
import { updateMe } from "../../api/users"
import { uploadImage } from "../../api/uploads"

export default function EditProfileModal({ isOpen, onClose, onSaved }) {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ full_name: "", username: "", bio: "", is_private: false, avatar_url: "" })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isOpen) return
    setSaved(false)
    setError("")
    setForm({
      full_name: user?.full_name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      is_private: Boolean(user?.is_private),
      avatar_url: user?.avatar_url || "",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prefill only when the modal opens;
    // depending on `user` would wipe the "saved" confirmation right after updateUser()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    setSaved(false)
    setError("")
  }

  async function handleAvatar(event) {
    const file = event.target.files?.[0]
    if (!file || uploading) return
    setUploading(true)
    setError("")
    try {
      const res = await uploadImage(file)
      setForm((prev) => ({ ...prev, avatar_url: res.url }))
      setSaved(false)
    } catch (err) {
      setError(err.message || t('common.error'))
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  async function handleSave(event) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError("")
    try {
      const res = await updateMe({
        full_name: form.full_name.trim(),
        username: form.username.trim().replace(/^@/, "").toLowerCase(),
        bio: form.bio.trim(),
        is_private: form.is_private,
        avatar_url: form.avatar_url || "",
      })
      /* Keep AuthContext + localStorage in sync with the server response */
      updateUser(res.user)
      setSaved(true)
      onSaved?.()
    } catch (err) {
      setError(err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const fieldClass =
    "w-full rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2.5 text-sm font-sans-ui text-[#e8e0d4] placeholder:text-[#5c564c] focus:outline-none focus:border-[#c9a84c]/50"

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('profile.editTitle')}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <form
        onSubmit={handleSave}
        className="w-full max-w-md bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f]">
          <h2 className="text-[#e8e0d4] font-semibold text-base font-sans-ui">{t('profile.editTitle')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#7a7060] hover:text-[#e8e0d4] hover:bg-[#2a2a2a]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {/* Avatar upload */}
          <div className="flex items-center gap-4 pb-1">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover ring-2 ring-[#c9a84c40]" />
            ) : (
              <span className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#c9a84c] text-xl font-bold flex-shrink-0">
                {(form.full_name || form.username || "?").charAt(0).toUpperCase()}
              </span>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#2a2a2a] text-[#e8e0d4] text-xs font-medium font-sans-ui hover:border-[#3a3329] hover:bg-[#1f1f1f] transition-all w-fit">
                {uploading ? t('common.loading') : t('profile.changePhoto')}
                <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" disabled={uploading} />
              </label>
              {form.avatar_url && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, avatar_url: "" }))}
                  className="text-xs text-[#7a7060] hover:text-[#e8e0d4] font-sans-ui text-left transition-colors"
                >
                  {t('profile.removePhoto')}
                </button>
              )}
            </div>
          </div>

          <label className="block">
            <span className="block text-xs text-[#7a7060] font-sans-ui mb-1">{t('profile.nameLabel')}</span>
            <input name="full_name" value={form.full_name} onChange={handleChange} className={fieldClass} />
          </label>
          <label className="block">
            <span className="block text-xs text-[#7a7060] font-sans-ui mb-1">{t('profile.usernameLabel')}</span>
            <input name="username" value={form.username} onChange={handleChange} className={fieldClass} />
          </label>
          <label className="block">
            <span className="block text-xs text-[#7a7060] font-sans-ui mb-1">{t('profile.bioLabel')}</span>
            <textarea
              name="bio"
              rows={3}
              value={form.bio}
              onChange={handleChange}
              placeholder={t('profile.bioPlaceholder')}
              className={`${fieldClass} resize-none`}
            />
          </label>

          {/* Private account toggle */}
          <label className="flex items-start justify-between gap-4 py-2 cursor-pointer">
            <span>
              <span className="block text-sm text-[#e8e0d4] font-sans-ui">{t('profile.privateLabel')}</span>
              <span className="block text-xs text-[#7a7060] font-sans-ui mt-0.5">{t('profile.privateHint')}</span>
            </span>
            <input
              type="checkbox"
              name="is_private"
              checked={form.is_private}
              onChange={handleChange}
              className="mt-1 w-4 h-4 accent-[#c9a84c]"
            />
          </label>

          {error && (
            <div className="rounded-xl bg-red-900/30 border border-red-700/40 px-4 py-3 text-sm text-red-300 font-sans-ui">
              {error}
            </div>
          )}
          {saved && !error && (
            <div className="rounded-xl bg-emerald-900/30 border border-emerald-700/40 px-4 py-3 text-sm text-emerald-300 font-sans-ui">
              {t('profile.saved')}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[#1f1f1f] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#2a2a2a] text-[#7a7060] text-sm font-sans-ui hover:text-[#e8e0d4]"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-[#c9a84c] text-[#0e0e0e] text-sm font-semibold font-sans-ui
                       hover:brightness-110 disabled:opacity-60"
          >
            {saving ? t('profile.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
