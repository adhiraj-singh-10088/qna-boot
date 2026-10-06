# AGENTS.md — qna-boot project notes (maintained by Hermes)

**Last updated:** 2026-10-05 (feature batch 2 — uploads/drafts/messaging — plus i18n completion, content translation, the activity panel, and the DM inbox search bar) · **Repo root:** `/home/adhiraj/GitHub/Projects/qna-boot` · **Remote:** `https://github.com/adhiraj-singh-10088/qna-boot.git` (branch `main`)

> **Standing rule for the agent:** every time you implement a feature, fix, or any change in this project (code, config, docs), update **this file** (project state / structure / gotchas) **and** add an entry to **CHANGELOG.md** in the same repo root. Keep both in the same change set as the code. Do not `git commit` / `push` unless the user explicitly asks.

---

## 1. What this project is

- **"Inkspace"** (current working title) — a social publishing platform: people post questions / articles / blogs and others interact (comments, votes, shares). Original one-liner in `IDEA.md`; concept + faculty review notes in `Blog Posting Platform/Blog Posting Platform.docx`; backend design in `Backend Architecture Design.pdf`.
- Started as a college project (VIT Bhopal). Contributors in git history: **adhiraj-singh-10088** (Adhiraj), **Atishay Jain**, **ADITYA GANGULY**.
- The frontend is branded **Inkspace** — a Medium-style writing platform: marketing landing page + auth + an in-app shell (feed, search/discover, profile, messages, write editor). Core social features were implemented end-to-end on 2026-10-05: post CRUD + feed, likes, comments, bookmarks, follows (public/private + requests), notifications, profile search/editing, post sharing by URL, and UI translation (EN/HI/ES). Also live since 2026-10-05: image uploads (post covers + avatars), server-side drafts ("Save Draft"), real messaging + share-to-contact, the **"Your activity" panel** (your likes + comments), and **content translation** — post titles/bodies/excerpts, comments, bios, and activity items are machine-translated on demand when the UI language is not English (cached in the `translations` table).

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
  - `/messages` → `MessagesPage` — real server-backed inbox (conversations, threads, unread badges via `MessagesContext` → `/api/messages`); people you follow appear automatically as "Start a conversation" rows even without message history (follow list merged client-side), so anyone you follow can be messaged directly; a search box filters by name / @handle / last-message text (client-side, EN/HI/ES placeholder).
  - `/create` → `CreatePostPage` — real publish (`POST /api/posts`) and edit mode (`/create?edit=<id>`, `PUT /api/posts/:id`); navigates to `/post/:id` after publish. Cover images upload for real (`POST /api/uploads` → `cover_url`); "Save Draft" stores a server draft (`status='draft'`) that the editor can reopen and publish.
  - `*` → redirect to `/`.
- **Guard:** `GuestGuard` renders `GuestPrompt` for unauthenticated users.
- **i18n:** `react-i18next` (`src/i18n/index.js`), locales `en`/`hi`/`es` under `src/i18n/locales/`; choice persisted in localStorage `inkspace_lang`; `LanguageSwitcher` in Navbar (desktop + mobile) and MoreMenu → Settings. All app screens incl. Messages, ShareModal, footer, and the DOB month names are translated; only the literary quote texts stay English on purpose. **Content translation:** `apiFetch` sends `X-Lang` (from `inkspace_lang`) whenever the UI language isn't English; the server translates titles/bodies/excerpts/comments/bios/activity items in responses (see `utils/translate.js` + the `translations` table).
- `src/context/AuthContext.jsx` — user only in localStorage (`inkspace_user`); the session JWT lives in an httpOnly cookie and is never stored by the app. `login`, `logout` (also clears the server cookie via `/auth/logout`), `updateUser(patch)`, `isAuthenticated` (user-based); hydrates the session from the cookie on boot via `getSessionUser()`.
- `src/context/MessagesContext.jsx` — API-backed inbox (conversations/threads/unread via `/api/messages`). `src/context/NotificationsContext.jsx` — unread count for badges; polls every 30s + on window focus.
- `src/api/` — fetch layer: `client.js` (`apiFetch` + `ApiError`, sends the session cookie via `credentials: 'include'`, attaches `X-Lang` for content translation; legacy Bearer attach), `auth.js` (+ `getSessionUser`, `logoutUser`), `posts.js` (feed/post/like/bookmark/comments), `users.js` (search/profile/posts/followers/following/updateMe), `follows.js` (follow + requests), `notifications.js`, `messages.js` (conversations/threads/send), `uploads.js` (image upload), `activity.js` (own likes + comments).
- `src/components/`: landing — `Navbar`, `HeroSection`, `FeaturesSection`, `CategoriesSection`, `Footer`, `AuthPanel`; app shell (`layout/`) — `AppLayout` = `Sidebar` + `BottomNav` + `MoreMenu`; `ui/` — `PostCard`, `ShareModal`, `LanguageSwitcher`, `GuestPrompt`, `Loader`; `discover/DiscoverUserCard`; `feed/EmptyFeedState`; `profile/EditProfileModal`, `profile/ShareProfileModal`.
  - **Dead code:** `TrendingSection`, `WritersSection`, `NewsletterSection` — exist but are imported nowhere.
- Dev server: Vite default port **5173**; `client/vite.config.js` proxies `/auth` and `/api` → `http://localhost:3001`.

### server/ — Express 5 (ESM), entry point `server/server.js`
- ⚠️ `server/app.js` is an **empty file** — the app is created and listens in `server/server.js`. Default port fallback **3001** (was 3036); `server/.env` sets `PORT=3001`.
- `routes/auth.js` → `POST /auth/signup` (accepts `full_name`), `POST /auth/login` (sets the httpOnly session cookie), `POST /auth/logout` (clears it), `GET /auth/me` (fresh profile from DB). bcryptjs cost 10; JWT signed with `JWT_SECRET`, `JWT_EXPIRES_IN` default `1h`.
- **API surface (all implemented in the 2026-10-05 batch):**
  - Feed: `GET /api/feed?limit&offset` (public; `optionalAuth` adds viewer flags).
  - Posts @ `/api/posts`: `GET /` (list), `POST /` (auth), `GET/PUT/DELETE /:id`, `POST/DELETE /:id/like`, `POST/DELETE /:id/bookmark`, `GET/POST /:id/comments`; `DELETE /api/comments/:id`; `GET /api/bookmarks`.
  - Users @ `/api/users`: `GET /search?q=`, `PATCH /me`, `GET /:username`, `GET /:username/posts` (private → `{ locked: true }` for non-followers), `/:username/followers`, `/:username/following`, `POST/DELETE /:username/follow`.
  - Follow requests @ `/api/follow-requests`: `GET /`, `POST /:id/accept`, `DELETE /:id`.
  - Notifications @ `/api/notifications`: `GET /`, `GET /unread-count`, `PATCH /:id/read`, `POST /read-all`.
  - Activity @ `/api/activity`: `GET /` (auth) — the caller's likes + comments on published posts (translated when `X-Lang` is sent).
  - Messages @ `/api/messages`: `GET /conversations`, `GET /:username` (thread, marks incoming read), `POST /:username`; optional `postId` must be a published post.
  - Uploads @ `/api/uploads`: `POST /` (auth, multipart `image`, magic-byte validated, 5 MB) → `{ url }`; files served statically at `/uploads`.
- `middlewares/authMiddleware.js` — default export = strict auth (401 otherwise); token read from the httpOnly `inkspace_token` cookie first, Bearer header second (API clients/scripts). Named export `optionalAuth` attaches `req.user` when present, never rejects. `JWT_SECRET` fallback `"change-me"` (real value lives in `server/.env`).
- `utils/posts.js` — shared post SELECT + mapper (`viewerId` drives `isLiked`/`isSaved`, `stripHtml` builds excerpts, content sanitized on read). `utils/notify.js` — `notify(userId, actorId, type, {postId, commentId})`; skips self-notifications; likes only notify on fresh inserts (INSERT IGNORE affectedRows check).
- `utils/sanitize.js` — `sanitizePostHtml()` allow-list sanitizer (used on write in `postController` + on read in `utils/posts.js`). `utils/authCookie.js` — `TOKEN_COOKIE` name + cookie options/JWT-expiry parsing for the session cookie. `utils/translate.js` — on-demand content translation: `reqLang(req)` reads `X-Lang`/`?lang=` (no-op for en/unsupported); `translateTexts/translateFields/translateList` translate via Google's public endpoint (POST, ipv4-first DNS, sentinel-batched) and cache results in the `translations` table (sha256(text)+lang); every failure degrades to the original text.
- `scripts/migrate.js` — **idempotent schema sync**: adds `users.full_name` / `bio` / `is_private` / `avatar_url`; adds `posts.cover_url` / `status`; creates `posts` / `likes` / `comments` / `bookmarks` / `follows` / `notifications` / `messages` / `translations`. Re-run after pulling.
- `utils/db.js` — `mysql2/promise` pool → **TiDB Cloud** (MySQL-compatible; env-driven via `.env`). Pool sets `timezone: 'Z'` — DATETIME/TIMESTAMP values are read as UTC (do not remove: without it relative times read 5h30m early on IST machines). Note: TiDB does not enforce FKs — referential integrity is app-level (post deletion cascades run in a transaction).
- `cookie-parser` is now used (session cookies); unused dep left: `pg`. Security deps: `helmet`, `express-rate-limit` (auth: 30 failed/15 min, API: 1000/15 min — env-overridable via `RATE_LIMIT_AUTH_MAX`/`RATE_LIMIT_API_MAX`), `sanitize-html`.

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

- Fresh clone: `cp server/.env.example server/.env` and fill in DB + JWT values (never commit `.env`).
- Frontend build: `cd client && npm run build`; lint: `npm run lint` (oxlint). No test suites exist anywhere (`server` `npm test` is a stub).
- Machine: Node v26 / npm 11 (CachyOS). Server CORS in `server/server.js` allows only origin `http://localhost:5173`.

## 4. Known issues / gotchas (as of 2026-10-05)

1. **Uploads & drafts are real (since 2026-10-05)** — covers/avatars upload to `server/uploads/` (gitignored, served at `/uploads`; local disk, no CDN); drafts are server-side and author-only.
2. **Messaging is real (since 2026-10-05)** — `messages` table + `/api/messages`; ShareModal sends stories to people you follow. Message text itself is intentionally never translated.
3. **Security phase (2026-10-05 — mostly done):** post HTML is sanitized server-side on write + read (`utils/sanitize.js`); rate limiting on auth (failed attempts) + `/api`; `helmet()` + 1 MB JSON cap + `x-powered-by` off; session JWT in an httpOnly SameSite=Lax cookie (Bearer kept for scripts); `server/.env` + `node_modules` untracked & gitignored. **Remaining (user action): rotate the TiDB DB password** — the old one still exists in git history; set `NODE_ENV=production` for Secure cookies in any real deployment.
4. **`server/.env` and `server/node_modules` were committed to git** (~1505 files) — both were untracked and gitignored on 2026-10-05, but the old DB credentials still exist in git history. Rotate the DB password; never copy credentials into docs, chat, or the changelog.
5. `server/app.js` empty; real entry is `server/server.js`. README still claims port 3036 — actual port is 3001. Dead code: `TrendingSection`, `WritersSection`, `NewsletterSection`; `pg`, `cookie-parser` deps unused.
6. Do not type passwords via the browser-automation tool into pages; for browser testing, get a fresh token via `POST /auth/login` (script) and set the session cookie directly via CDP (`Network.setCookie`, name `inkspace_token`, url `http://localhost:5173/`). **localStorage token injection no longer works** — `AuthContext` scrubs `inkspace_token` on boot (cookie-only sessions); only `inkspace_user` persists.
7. **Hermes output-redaction quirk (not a bug in the repo):** `client/src/api/auth.js` (around line 70) reads as ``Authorization: *** ${token}`` in tool output because Hermes masks the `` `Bearer ${token}` `` template string. The file is valid JS (`node --check` passes) — do **not** "fix" it.
8. `JWT_SECRET` fallback is `"change-me"` — must be set in any real environment.
9. `/feed` is public; `/search`, `/profile`, `/messages`, `/create` show `GuestPrompt` to guests — no hard redirects anymore.
10. **Content translation (2026-10-05):** UI language ≠ en → `X-Lang` header → the server translates post titles/bodies/excerpts, comments, bios, search results and activity items on the fly (cached in `translations`; names/usernames are never translated). Engine is Google's public dev endpoint with no API key — fine for dev, swap for a keyed API before production; failures quietly fall back to the original text.

## 5. Design language (frontend)

Dark, literary theme: background `#0e0e0e`, panels `#141210` / `#161410` / `#1a1814`, borders `#2a2520` / `#2e2a24`, gold accent `#c9a84c` (hover `#e2c97e`), body text `#e8e0d4`, headings `#f5e6c8`, muted text `#7a7060`. Serif body font (Georgia stack) + Inter UI font via the `.font-sans-ui` utility. Tailwind v4 with inline utility classes; custom animations & scroll-reveal utilities in `client/src/index.css`.

## 6. History & process

- Full change history lives in **`CHANGELOG.md`**. 26 commits as of 2026-10-05 (first 2026-07-12) plus the uncommitted 2026-10-05 feature batch + post-verification fixes (see changelog entries).
- **2026-10-05 feature batch:** post creation (CRUD + feed + comments + likes + bookmarks), share-by-URL, i18n (EN/HI/ES), user search, follow system (public/private + requests), notifications, profile editing; DB migration `server/scripts/migrate.js`; verified by API smoke script (50 checks), browser walkthrough, and independent subagent tests.
- **2026-10-05 post-verification fix batch:** fixed bugs found by the independent subagent tests — edit-mode body prefill; notification timestamps 5h30m offset (`timezone: 'Z'`); stuck "User not found" after rename + unstable saved-message; i18n gaps (login/landing/raw key); LIKE-wildcard escaping in search; markup-only post validation; notification badge reconcile. See CHANGELOG top entry.
- **2026-10-05 security phase:** server-side XSS sanitization (write + read), rate limiting (auth/API), helmet + body cap, httpOnly-cookie sessions (SPA no longer stores the JWT; Bearer kept for scripts), `.env`/`node_modules` untracked + `.gitignore` + `.env.example`, JWT_SECRET rotated. Verified by `qna-security-check.mjs` (29/29), rate-limit test, smoke 50/50, browser cookie-flow walkthrough. Remaining: DB password rotation (user). See CHANGELOG top entry.
- **2026-10-05 feature batch 2 + fix batch 2:** image uploads (covers/avatars), server-side drafts, real messaging + share-to-contact; independent-tester fixes (draft-interaction privacy 404s, magic-byte upload validation, viewer-aware postCount, stale-session avatar). See CHANGELOG entries.
- **2026-10-05 i18n completion + content translation + activity:** Messages/ShareModal/footer/DOB-months localized; real "Your activity" panel (`GET /api/activity` + MoreMenu); content-translation layer (`utils/translate.js`, `translations` table, `X-Lang` header). Verified via activity E2E (10/10) + Hindi browser walkthrough (feed/post/messages/activity screenshots).
- **Maintenance note:** this file contains a masked token string that trips Hermes's whole-file write guard — update it with targeted `patch` edits; `write_file` overwrites get refused.
- After each change: (a) re-verify (lint/build or `node --check` as appropriate), (b) update section 4 / relevant sections here, (c) prepend a CHANGELOG.md entry with date, summary, files touched.
