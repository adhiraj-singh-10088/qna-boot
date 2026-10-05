import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import AppLayout from "../components/layout/AppLayout"
import { useAuth } from "../context/AuthContext"
import { createPost, fetchPost, updatePost } from "../api/posts"
import { uploadImage } from "../api/uploads"

/* ── Icons ───────────────────────────────────────────── */
function BoldIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg> }
function ItalicIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg> }
function LinkIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> }
function ImageIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> }
function QuoteIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg> }
function CodeIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> }
function H1Icon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8M4 6v12M12 6v12M17 12l3-3v9"/></svg> }
function H2Icon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8M4 6v12M12 6v12M21 18h-4c0-4 4-3 4-6 0-1.5-1-2-2-2s-2 .85-2 2"/></svg> }
function ListIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function EyeIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> }
function SaveIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> }
function PlusIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function XIcon()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }

const CATEGORIES = ["Technology", "Philosophy", "Literature", "Journalism", "Science", "Culture", "Opinion", "Essays", "Poetry", "Business"]

const TOOLBAR_GROUPS = [
  [
    { label: "H1", icon: <H1Icon />, cmd: "formatBlock", val: "h1" },
    { label: "H2", icon: <H2Icon />, cmd: "formatBlock", val: "h2" },
  ],
  [
    { label: "Bold",   icon: <BoldIcon />,   cmd: "bold" },
    { label: "Italic", icon: <ItalicIcon />, cmd: "italic" },
  ],
  [
    { label: "Quote", icon: <QuoteIcon />, cmd: "formatBlock", val: "blockquote" },
    { label: "Code",  icon: <CodeIcon />,  cmd: "formatBlock", val: "pre" },
    { label: "List",  icon: <ListIcon />,  cmd: "insertUnorderedList" },
  ],
  [
    { label: "Link",  icon: <LinkIcon />,  cmd: "createLink" },
    { label: "Image", icon: <ImageIcon />, cmd: "insertImage" },
  ],
]

function ToolbarBtn({ item, onAction }) {
  return (
    <button
      type="button"
      title={item.label}
      onMouseDown={(e) => { e.preventDefault(); onAction(item) }}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#a09880] hover:text-[#c9a84c] hover:bg-[#2a2520] transition-all duration-150"
    >
      {item.icon}
    </button>
  )
}

export default function CreatePostPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get("edit")
  const editorRef = useRef(null)

  const [title, setTitle]               = useState("")
  const [subtitle, setSubtitle]         = useState("")
  const [tag, setTag]                   = useState("")
  const [tags, setTags]                 = useState([])
  const [category, setCategory]         = useState("")
  const [coverPreview, setCoverPreview] = useState(null)
  const [coverUrl, setCoverUrl]         = useState(null)
  const [coverBusy, setCoverBusy]       = useState(false)
  const [preview, setPreview]           = useState(false)
  const [saved, setSaved]               = useState(false)
  const [wordCount, setWordCount]       = useState(0)
  const [publishing, setPublishing]     = useState(false)
  const [loadingPost, setLoadingPost]   = useState(!!editId)
  const [initialHtml, setInitialHtml]   = useState(null)
  const [isDraftPost, setIsDraftPost]   = useState(false)

  /* ── Edit mode: prefill the editor with the existing post ─────────── */
  useEffect(() => {
    let cancelled = false
    if (!editId) return undefined

    setLoadingPost(true)
    fetchPost(editId)
      .then(({ post }) => {
        if (cancelled) return
        if (!post || String(post.author?.id) !== String(user?.id)) {
          window.alert("You can only edit your own posts.")
          navigate("/feed")
          return
        }
        setTitle(post.title || "")
        setSubtitle(post.subtitle || "")
        setCategory(post.category || "")
        setTags(Array.isArray(post.tags) ? post.tags : [])
        setCoverUrl(post.coverUrl || null)
        setCoverPreview(post.coverUrl || null)
        setIsDraftPost(Boolean(post.isDraft))
        // The editor is not mounted while loadingPost is true — stash the HTML
        // and apply it in the effect below once the editor actually renders.
        setInitialHtml(post.content || "")
      })
      .catch(() => navigate("/feed"))
      .finally(() => { if (!cancelled) setLoadingPost(false) })

    return () => { cancelled = true }
  }, [editId, navigate, user?.id])

  /* Edit mode: apply the stashed HTML once the editor is actually mounted */
  useEffect(() => {
    if (loadingPost || initialHtml === null) return
    const editor = editorRef.current
    if (editor && !editor.innerHTML.trim()) {
      editor.innerHTML = initialHtml
      const words = editor.innerText.trim().split(/\s+/).filter(Boolean).length
      setWordCount(words)
    }
    setInitialHtml(null)
  }, [loadingPost, initialHtml])

  const handleInput = () => {
    const text = editorRef.current?.innerText || ""
    const words = text.trim().split(/\s+/).filter(Boolean).length
    setWordCount(words)
    setSaved(false)
  }

  const execCmd = (item) => {
    if (item.cmd === "createLink") {
      const url = prompt("Enter URL:")
      if (url) document.execCommand("createLink", false, url)
    } else if (item.cmd === "insertImage") {
      const url = prompt("Enter image URL:")
      if (url) document.execCommand("insertImage", false, url)
    } else if (item.val) {
      document.execCommand(item.cmd, false, item.val)
    } else {
      document.execCommand(item.cmd, false, null)
    }
    editorRef.current?.focus()
  }

  const addTag = (value) => {
    const clean = value.trim()
    if (clean && !tags.includes(clean) && tags.length < 5) setTags([...tags, clean])
    setTag("")
  }
  const removeTag = (value) => setTags(tags.filter((x) => x !== value))

  const handleCover = async (e) => {
    const file = e.target.files?.[0]
    if (!file || coverBusy) return
    setCoverBusy(true)
    try {
      const res = await uploadImage(file)
      setCoverUrl(res.url)
      setCoverPreview(res.url)
      setSaved(false)
    } catch (err) {
      window.alert(err.message)
    } finally {
      setCoverBusy(false)
      e.target.value = ""
    }
  }

  /* Shared payload for Publish / Save-as-draft */
  const buildPayload = ({ draft = false } = {}) => ({
    title: title.trim(),
    subtitle: subtitle.trim() || undefined,
    content: editorRef.current?.innerHTML || "",
    category: category || undefined,
    tags,
    cover_url: coverUrl || null,
    ...(draft ? { status: "draft", draft: true } : {}),
  })

  /* Save as draft on the server, then show it on the profile (drafts live there) */
  const saveDraft = async () => {
    if (publishing) return
    if (!title.trim()) { window.alert(t('create.errorTitle')); return }
    setPublishing(true)
    try {
      const payload = buildPayload({ draft: true })
      if (editId) await updatePost(editId, payload)
      else await createPost(payload)
      navigate("/profile")
    } catch (err) {
      if (err.status === 401) window.alert(t('create.loginRequired'))
      else window.alert(err.message)
    } finally {
      setPublishing(false)
    }
  }

  /* ── Publish (create) or save (edit) — real API calls ─────────────── */
  const handlePublish = async (e) => {
    e.preventDefault()
    if (publishing) return

    const text = editorRef.current?.innerText || ""
    if (!title.trim()) { window.alert(t('create.errorTitle')); return }
    if (!text.trim())  { window.alert(t('create.errorContent')); return }

    setPublishing(true)
    try {
      const payload = buildPayload()
      if (editId && isDraftPost) payload.status = "published"
      const res = editId
        ? await updatePost(editId, payload)
        : await createPost(payload)
      navigate(`/post/${res.post.id}`)
    } catch (err) {
      if (err.status === 401) window.alert(t('create.loginRequired'))
      else window.alert(err.message)
    } finally {
      setPublishing(false)
    }
  }

  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto pb-12 relative">
        <header className="sticky top-0 z-40 bg-[#0e0e0e]/95 backdrop-blur-md border-b border-[#2a2520] pb-4 pt-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[#e8e0d4] text-2xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>
              {editId ? t('create.editTitle') : t('create.title')}
              {isDraftPost && (
                <span className="ml-3 align-middle font-sans-ui text-[10px] px-2 py-0.5 rounded-full bg-[#2a2218] border border-[#3a3020] text-[#c9a84c] uppercase tracking-wider">
                  {t('profile.draft')}
                </span>
              )}
            </h1>
            <p className="font-sans-ui text-xs text-[#7a7060] mt-1">
              {t('post.words', { count: wordCount })} · {t('post.minRead', { count: readTime })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="font-sans-ui text-xs text-green-500 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {t('create.saved')}
              </span>
            )}
            {(!editId || isDraftPost) && (
              <button
                onClick={saveDraft}
                disabled={publishing}
                className="flex items-center gap-2 font-sans-ui text-sm px-4 py-2 rounded-full border border-[#3a3329] text-[#a09880] hover:border-[#c9a84c]/60 hover:text-[#c9a84c] transition-all duration-200 disabled:opacity-50"
              >
                <SaveIcon /> <span className="hidden sm:inline">{t('create.saveDraft')}</span>
              </button>
            )}
            <button
              onClick={() => setPreview(!preview)}
              className={`flex items-center gap-2 font-sans-ui text-sm px-4 py-2 rounded-full border transition-all duration-200 ${
                preview
                  ? "bg-[#2a2218] border-[#c9a84c]/50 text-[#c9a84c]"
                  : "border-[#3a3329] text-[#a09880] hover:border-[#c9a84c]/60 hover:text-[#c9a84c]"
              }`}
            >
              <EyeIcon /> <span className="hidden sm:inline">{preview ? t('create.edit') : t('create.preview')}</span>
            </button>
            <button
              onClick={handlePublish}
              disabled={!title.trim() || publishing}
              className="flex items-center gap-2 font-sans-ui text-sm px-5 py-2 rounded-full bg-[#c9a84c] hover:bg-[#e2c97e] text-[#0e0e0e] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {publishing ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : null}
              {publishing
                ? ((editId && !isDraftPost) ? t('create.saving') : t('create.publishing'))
                : ((editId && !isDraftPost) ? t('create.save') : t('create.publish'))}
            </button>
          </div>
        </header>

        {loadingPost ? (
          <p className="text-center text-[#7a7060] text-sm font-sans-ui py-20">{t('common.loading')}</p>
        ) : preview ? (
          /* ── PREVIEW MODE ─────────────────────────────────── */
          <article>
            {coverPreview && (
              <img src={coverPreview} alt="cover" className="w-full h-64 object-cover rounded-2xl mb-10" />
            )}
            {category && (
              <p className="font-sans-ui text-xs tracking-[0.2em] text-[#c9a84c] uppercase mb-4">{category}</p>
            )}
            <h1 className="text-4xl lg:text-5xl font-bold text-[#f5e6c8] leading-tight mb-4">
              {title || <span className="text-[#2e2a24]">{t('create.titlePlaceholder')}</span>}
            </h1>
            {subtitle && <p className="text-lg text-[#7a7060] mb-6 leading-relaxed">{subtitle}</p>}
            <div className="flex items-center gap-3 mb-10 pb-8 border-b border-[#2a2520]">
              <div className="w-9 h-9 rounded-full bg-[#2a2218] border border-[#3a3020] flex items-center justify-center text-xs font-bold text-[#c9a84c]">
                {(user?.full_name || user?.username || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#e8e0d4]">{user?.full_name || user?.username}</p>
                <p className="font-sans-ui text-xs text-[#5a5248]">
                  {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {t('post.minRead', { count: readTime })}
                </p>
              </div>
              {tags.length > 0 && (
                <div className="ml-auto flex gap-2">
                  {tags.map((tg) => (
                    <span key={tg} className="font-sans-ui text-[10px] px-2.5 py-1 rounded-full bg-[#2a2218] border border-[#3a3020] text-[#c9a84c]">{tg}</span>
                  ))}
                </div>
              )}
            </div>
            <div
              className="text-[#c8bea8] leading-relaxed text-base"
              dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || "" }}
            />
          </article>
        ) : (
          /* ── EDIT MODE ────────────────────────────────────── */
          <div>

            {/* Cover image upload */}
            <div className="mb-8">
              {coverPreview ? (
                <div className="relative group">
                  <img src={coverPreview} alt="cover" className="w-full h-56 object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
                    <label className="cursor-pointer font-sans-ui text-sm px-4 py-2 rounded-full bg-[#c9a84c] text-[#0e0e0e] font-semibold">
                      {t('create.changeCover')}
                      <input type="file" accept="image/*" onChange={handleCover} className="hidden" />
                    </label>
                    <button onClick={() => { setCoverPreview(null); setCoverUrl(null) }} className="font-sans-ui text-sm px-4 py-2 rounded-full bg-[#2a2520] text-[#e8e0d4] border border-[#3a3329]">
                      {t('create.remove')}
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-[#3a3329] hover:border-[#c9a84c]/50 hover:bg-[#161410] transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-[#2a2218] border border-[#3a3020] flex items-center justify-center text-[#c9a84c] mb-3 group-hover:border-[#c9a84c]/60 transition-colors">
                    <ImageIcon />
                  </div>
                  <p className="font-sans-ui text-sm text-[#7a7060] group-hover:text-[#a09880] transition-colors">{coverBusy ? t('common.loading') : t('create.addCover')}</p>
                  <p className="font-sans-ui text-xs text-[#3a3329] mt-1">{t('create.coverHint')}</p>
                  <input type="file" accept="image/*" onChange={handleCover} className="hidden" />
                </label>
              )}
            </div>

            {/* Category picker */}
            <div className="mb-6">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="font-sans-ui text-xs bg-[#1a1814] border border-[#3a3329] rounded-xl px-4 py-2.5 text-[#a09880] focus:outline-none focus:border-[#c9a84c]/50 cursor-pointer transition-all appearance-none pr-8"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7060' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                <option value="">{t('create.selectCategory')}</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Title */}
            <textarea
              rows={2}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSaved(false) }}
              placeholder={t('create.titlePlaceholder')}
              className="w-full bg-transparent resize-none text-4xl lg:text-5xl font-bold text-[#f5e6c8] placeholder-[#2e2a24] focus:outline-none leading-tight mb-4 border-none"
            />

            {/* Subtitle */}
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => { setSubtitle(e.target.value); setSaved(false) }}
              placeholder={t('create.subtitlePlaceholder')}
              className="w-full bg-transparent resize-none text-lg text-[#7a7060] placeholder-[#2a2520] focus:outline-none leading-relaxed mb-8 border-none"
            />

            {/* Divider */}
            <div className="h-px bg-[#2a2520] mb-6" />

            {/* Sticky Toolbar */}
            <div className="sticky top-14 z-40 bg-[#1a1814] border border-[#3a3329] rounded-xl px-3 py-2 mb-6 flex items-center gap-1 flex-wrap">
              {TOOLBAR_GROUPS.map((group, gi) => (
                <React.Fragment key={gi}>
                  {gi > 0 && <div className="w-px h-5 bg-[#3a3329] mx-1" />}
                  {group.map((item) => (
                    <ToolbarBtn key={item.label} item={item} onAction={execCmd} />
                  ))}
                </React.Fragment>
              ))}
            </div>

            {/* Editor area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              className="min-h-[420px] text-base text-[#c8bea8] leading-relaxed focus:outline-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#f5e6c8] [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#e8e0d4] [&_h2]:mt-5 [&_h2]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-[#c9a84c]/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#7a7060] [&_pre]:bg-[#161410] [&_pre]:border [&_pre]:border-[#2e2a24] [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:text-[#c9a84c] [&_pre]:text-sm [&_pre]:font-mono [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-[#c9a84c] [&_a]:underline [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4 empty:before:content-[attr(data-placeholder)] empty:before:text-[#2e2a24] empty:before:pointer-events-none"
              data-placeholder={t('create.contentPlaceholder')}
            />

            {/* Divider */}
            <div className="h-px bg-[#2a2520] mt-10 mb-8" />

            {/* Tags */}
            <div>
              <p className="font-sans-ui text-xs tracking-[0.2em] text-[#7a7060] uppercase mb-4">
                {t('create.tags')} <span className="normal-case tracking-normal text-[#3a3329]">{t('create.tagsHint')}</span>
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tg) => (
                  <span key={tg} className="flex items-center gap-1.5 font-sans-ui text-xs px-3 py-1.5 rounded-full bg-[#2a2218] border border-[#3a3020] text-[#c9a84c]">
                    {tg}
                    <button onClick={() => removeTag(tg)} className="text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors">
                      <XIcon />
                    </button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tag) } }}
                      placeholder={t('create.addTag')}
                      className="font-sans-ui text-xs bg-[#1a1814] border border-[#3a3329] rounded-full px-3 py-1.5 text-[#a09880] placeholder-[#3a3329] focus:outline-none focus:border-[#c9a84c]/50 w-32 transition-all"
                    />
                    <button
                      onClick={() => addTag(tag)}
                      className="w-7 h-7 rounded-full border border-[#3a3329] flex items-center justify-center text-[#7a7060] hover:text-[#c9a84c] hover:border-[#c9a84c]/40 transition-all"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                )}
              </div>
              <p className="font-sans-ui text-[10px] text-[#3a3329]">{t('create.tagsHelp')}</p>
            </div>

          </div>
        )}
      </div>
    </AppLayout>
  )
}
