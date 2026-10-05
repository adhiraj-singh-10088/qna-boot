# AGENTS.md — qna-boot project notes (maintained by Hermes)

**Last updated:** 2026-10-05 (post-verification fix batch; local changes uncommitted) · **Repo root:** `/home/adhiraj/GitHub/Projects/qna-boot` · **Remote:** `https://github.com/adhiraj-singh-10088/qna-boot.git` (branch `main`)

> **Standing rule for the agent:** every time you implement a feature, fix, or any change in this project (code, config, docs), update **this file** (project state / structure / gotchas) **and** add an entry to **CHANGELOG.md** in the same repo root. Keep both in the same change set as the code. Do not `git commit` / `push` unless the user explicitly asks.

---

## 1. What this project is

- **"Inkspace"** (current working title) — a social publishing platform: people post questions / articles / blogs and others interact (comments, votes, shares). Original one-liner in `IDEA.md`; concept + faculty review notes in `Blog Posting Platform/Blog Posting Platform.docx`; backend design in `Backend Architecture Design.pdf`.
- Started as a college project (VIT Bhopal). Contributors in git history: **adhiraj-singh-10088** (Adhiraj), **Atishay Jain**, **ADITYA GANGULY**.
- The frontend is branded **Inkspace** — a Medium-style writing platform: marketing landing page + auth + an in-app shell (feed, search/discover, profile, messages, write editor). Core social features were implemented end-to-end on 2026-10-05: post CRUD + feed, likes, comments, bookmarks, follows (public/private + requests), notifications, profile search/editing, post sharing by URL, and UI translation (EN/HI/ES). Still demo-only: messaging, cover-image/avatar upload, "Save Draft".

## 2. Stack & layout

### client/ — React 19 + Vite 8 + Tailwind CSS 4 + react-router-dom 7 (oxlint)
- Provider tree (`src/App.jsx`): `AuthProvider` → `MessagesProvider` → `NotificationsProvider` → `BrowserRouter`.
- **Routes:**
  - `/` → `HomePage` — landing (Navbar / Hero / Features / Categories / Footer / AuthPanel); redirects logged-in users to `/feed`.
  - `/login` → `LoginPage` — standalone sign-in (`AuthPanel` in `lockedMode`; `?registered=1` shows an "Account created" banner); redirects logged-in users to `/feed`.
  - `/feed` → `FeedPage` — **public**; fetches real posts from `GET /api/feed` (paging via "Load more"); like/save call the API; share opens `ShareModal`.
  - `/post/:id` → `PostPage` — public permalink (what shared URLs open): article + like/save/share/comments + owner edit/delete.
  - `/search` → `DiscoverPage` — guests get `GuestPrompt`; live user search (debounced) + follow-request accept/decline.
  - `/profile` & `/u/:username` → `ProfilePage` — own profile (Articles + Bookmarks tabs, edit/share) or public profile (follow/unfollow/request button, followers/following modals, private-account lock).
  - `/notifications` → `NotificationsPage` — likes / comments / follows / follow requests & accepts; mark one/all read; badge in Sidebar + BottomNav; also linked from MoreMenu.
  - `/messages` → `MessagesPage` — still demo (localStorage inbox via `MessagesContext`).
  - `/create` → `CreatePostPage` — real publish (`POST /api/posts`) and edit mode (`/create?edit=<id>`, `PUT /api/posts/:id`); navigates to `/post/:id` after publish. Cover image = preview only.
  - `*` → redirect to `/`.
- **Guard:** `GuestGuard` renders `GuestPrompt` for unauthenticated users.
- **i18n:** `react-i18next` (`src/i18n/index.js`), locales `en`/`hi`/`es` under `src/i18n/locales/`; choice persisted in localStorage `inkspace_lang`; `LanguageSwitcher` in Navbar (desktop + mobile) and MoreMenu → Settings. Main app screens + auth (incl. login extras, placeholders, DOB labels) + landing hero (incl. nav links, tag chips) are translated; remaining English-only: quote/author texts, month names in the DOB picker, ShareModal internals, footer, Messages page.
- `src/context/AuthContext.jsx` — token/user in localStorage (`inkspace_token` / `inkspace_user`); `login`, `logout`, `updateUser(patch)` (syncs server response into the session), `isAuthenticated`.
- `src/context/MessagesContext.jsx` — demo inbox (no server calls yet). `src/context/NotificationsContext.jsx` — unread count for badges; polls every 30s + on window focus.
- `src/api/` — fetch layer: `client.js` (`apiFetch` + `ApiError`, attaches Bearer token from localStorage), `auth.js`, `posts.js` (feed/post/like/bookmark/comments), `users.js` (search/profile/posts/followers/following/updateMe), `follows.js` (follow + requests), `notifications.js`.
- `src/components/`: landing — `Navbar`, `HeroSection`, `FeaturesSection`, `CategoriesSection`, `Footer`, `AuthPanel`; app shell (`layout/`) — `AppLayout` = `Sidebar` + `BottomNav` + `MoreMenu`; `ui/` — `PostCard`, `ShareModal`, `LanguageSwitcher`, `GuestPrompt`, `Loader`; `discover/DiscoverUserCard`; `feed/EmptyFeedState`; `profile/EditProfileModal`, `profile/ShareProfileModal`.
  - **Dead code:** `TrendingSection`, `WritersSection`, `NewsletterSection` — exist but are imported nowhere.
- Dev server: Vite default port **5173**; `client/vite.config.js` proxies `/auth` and `/api` → `http://localhost:3001`.

### server/ — Express 5 (ESM), entry point `server/server.js`
- ⚠️ `server/app.js` is an **empty file** — the app is created and listens in `server/server.js`. Default port fallback **3001** (was 3036); `server/.env` sets `PORT=3001`.
- `routes/auth.js` → `POST /auth/signup` (accepts `full_name`), `POST /auth/login`, `GET /auth/me` (fresh profile from DB). bcryptjs cost 10; JWT signed with `JWT_SECRET`, `JWT_EXPIRES_IN` default `1h`.
- **API surface (all implemented in the 2026-10-05 batch):**
  - Feed: `GET /api/feed?limit&offset` (public; `optionalAuth` adds viewer flags).
  - Posts @ `/api/posts`: `GET /` (list), `POST /` (auth), `GET/PUT/DELETE /:id`, `POST/DELETE /:id/like`, `POST/DELETE /:id/bookmark`, `GET/POST /:id/comments`; `DELETE /api/comments/:id`; `GET /api/bookmarks`.
  - Users @ `/api/users`: `GET /search?q=`, `PATCH /me`, `GET /:username`, `GET /:username/posts` (private → `{ locked: true }` for non-followers), `/:username/followers`, `/:username/following`, `POST/DELETE /:username/follow`.
  - Follow requests @ `/api/follow-requests`: `GET /`, `POST /:id/accept`, `DELETE /:id`.
  - Notifications @ `/api/notifications`: `GET /`, `GET /unread-count`, `PATCH /:id/read`, `POST /read-all`.
- `middlewares/authMiddleware.js` — default export = strict Bearer JWT (401 otherwise); named export `optionalAuth` attaches `req.user` when present, never rejects. `JWT_SECRET` fallback `"change-me"`.
- `utils/posts.js` — shared post SELECT + mapper (`viewerId` drives `isLiked`/`isSaved`, `stripHtml` builds excerpts). `utils/notify.js` — `notify(userId, actorId, type, {postId, commentId})`; skips self-notifications; likes only notify on fresh inserts (INSERT IGNORE affectedRows check).
- `scripts/migrate.js` — **idempotent schema sync**: adds `users.full_name` / `bio` / `is_private`; creates `posts` / `likes` / `comments` / `bookmarks` / `follows` / `notifications`. Re-run after pulling.
- `utils/db.js` — `mysql2/promise` pool → **TiDB Cloud** (MySQL-compatible; env-driven via `.env`). Pool sets `timezone: 'Z'` — DATETIME/TIMESTAMP values are read as UTC (do not remove: without it relative times read 5h30m early on IST machines). Note: TiDB does not enforce FKs — referential integrity is app-level (post deletion cascades run in a transaction).
- Unused deps in `server/package.json`: `pg`, `cookie-parser`.

### Root
- `README.md` — run instructions (partially stale: says port 3036).
- `package-lock.json` at root is vestigial (87 bytes); real lockfiles live in `client/` and `server/`.

## 3. How to run (local dev)

```bash
# one-time schema sync (idempotent — safe to re-run)
cd server && node scripts/migrate.js
# backend
cd server && npm install && npm run dev      # nodemon → http://localhost:3001
# frontend (second terminal)
cd client && npm install && npm run dev      # Vite → http://localhost:5173
```

- Frontend build: `cd client && npm run build`; lint: `npm run lint` (oxlint). No test suites exist anywhere (`server` `npm test` is a stub).
- Machine: Node v26 / npm 11 (CachyOS). Server CORS in `server/server.js` allows only origin `http://localhost:5173`.

## 4. Known issues / gotchas (as of 2026-10-05)

1. **Uploads are not persisted server-side** — cover images stay as base64 previews in the editor (not saved); no avatar upload; "Save Draft" is still a local demo. Publish/edit/comment/like/save are real.
2. **Messaging is still a frontend demo** — `MessagesContext` + `MessagesPage` run on localStorage; `ShareModal`'s per-contact "Send" is unwired (the copy-link row works). No backend messages/shares endpoints yet.
3. **Security hardening pending (agreed next phase):** post content is stored as raw editor HTML and rendered via `dangerouslySetInnerHTML` (stored-XSS surface), no input sanitization library, no rate limiting, JWT in localStorage, `server/.env` committed with live credentials.
4. **`server/.env` is committed to git with live DB credentials**, and **`server/node_modules` (~1500 files) is committed** — treat `.env` as secret (never copy credentials into docs, chat, or the changelog); cleanup (untrack + `.gitignore` + rotate) is a recommended future task.
5. `server/app.js` empty; real entry is `server/server.js`. README still claims port 3036 — actual port is 3001. Dead code: `TrendingSection`, `WritersSection`, `NewsletterSection`; `pg`, `cookie-parser` deps unused.
6. Do not type passwords via the browser-automation tool into pages; for local testing, obtain a token via the API (curl/node) and inject it into localStorage (`inkspace_token` / `inkspace_user`).
7. **Hermes output-redaction quirk (not a bug in the repo):** `client/src/api/auth.js` (around line 70) reads as ``Authorization: *** ${token}`` in tool output because Hermes masks the `` `Bearer ${token}` `` template string. The file is valid JS (`node --check` passes) — do **not** "fix" it.
8. `JWT_SECRET` fallback is `"change-me"` — must be set in any real environment.
9. `/feed` is public; `/search`, `/profile`, `/messages`, `/create` show `GuestPrompt` to guests — no hard redirects anymore.

## 5. Design language (frontend)

Dark, literary theme: background `#0e0e0e`, panels `#141210` / `#161410` / `#1a1814`, borders `#2a2520` / `#2e2a24`, gold accent `#c9a84c` (hover `#e2c97e`), body text `#e8e0d4`, headings `#f5e6c8`, muted text `#7a7060`. Serif body font (Georgia stack) + Inter UI font via the `.font-sans-ui` utility. Tailwind v4 with inline utility classes; custom animations & scroll-reveal utilities in `client/src/index.css`.

## 6. History & process

- Full change history lives in **`CHANGELOG.md`**. 26 commits as of 2026-10-05 (first 2026-07-12) plus the uncommitted 2026-10-05 feature batch + post-verification fixes (see changelog entries).
- **2026-10-05 feature batch:** post creation (CRUD + feed + comments + likes + bookmarks), share-by-URL, i18n (EN/HI/ES), user search, follow system (public/private + requests), notifications, profile editing; DB migration `server/scripts/migrate.js`; verified by API smoke script (50 checks), browser walkthrough, and independent subagent tests.
- **2026-10-05 post-verification fix batch:** fixed bugs found by the independent subagent tests — edit-mode body prefill; notification timestamps 5h30m offset (`timezone: 'Z'`); stuck "User not found" after rename + unstable saved-message; i18n gaps (login/landing/raw key); LIKE-wildcard escaping in search; markup-only post validation; notification badge reconcile. See CHANGELOG top entry.
- **Maintenance note:** this file contains a masked token string that trips Hermes's whole-file write guard — update it with targeted `patch` edits; `write_file` overwrites get refused.
- After each change: (a) re-verify (lint/build or `node --check` as appropriate), (b) update section 4 / relevant sections here, (c) prepend a CHANGELOG.md entry with date, summary, files touched.
