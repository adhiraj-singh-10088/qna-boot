# AGENTS.md — qna-boot project notes (maintained by Hermes)

**Last updated:** 2026-10-05 (synced with `origin/main` @ `9795f26`) · **Repo root:** `/home/adhiraj/GitHub/Projects/qna-boot` · **Remote:** `https://github.com/adhiraj-singh-10088/qna-boot.git` (branch `main`)

> **Standing rule for the agent:** every time you implement a feature, fix, or any change in this project (code, config, docs), update **this file** (project state / structure / gotchas) **and** add an entry to **CHANGELOG.md** in the same repo root. Keep both in the same change set as the code. Do not `git commit` / `push` unless the user explicitly asks.

---

## 1. What this project is

- **"Inkspace"** (current working title) — a social publishing platform: people post questions / articles / blogs and others interact (comments, votes, shares). Original one-liner in `IDEA.md`; concept + faculty review notes in `Blog Posting Platform/Blog Posting Platform.docx`; backend design in `Backend Architecture Design.pdf`.
- Started as a college project (VIT Bhopal). Contributors in git history: **adhiraj-singh-10088** (Adhiraj), **Atishay Jain**, **ADITYA GANGULY**.
- The frontend is branded **Inkspace** — a Medium-style writing platform: marketing landing page + auth + an in-app shell (feed, search/discover, profile, messages, write editor). Most in-app pages currently run on **demo data with "TODO: wire to API" markers**; the backend only implements auth so far.

## 2. Stack & layout

### client/ — React 19 + Vite 8 + Tailwind CSS 4 + react-router-dom 7 (oxlint)
- Provider tree (`src/App.jsx`): `AuthProvider` → `MessagesProvider` → `BrowserRouter`.
- **Routes:**
  - `/` → `HomePage` — landing (Navbar / Hero / Features / Categories / Footer / AuthPanel); redirects logged-in users to `/feed`.
  - `/login` → `LoginPage` — standalone sign-in (`AuthPanel` in `lockedMode`, hides signup tab; `?registered=1` shows an "Account created" banner); redirects logged-in users to `/feed`.
  - `/feed` → `FeedPage` — **public** (guests can read); currently renders inline `DEMO_POSTS` (TODO: `GET /api/feed`); uses `AppLayout`, `PostCard`, `ShareModal`, `EmptyFeedState`.
  - `/search` → `DiscoverPage` — guests get `GuestPrompt`; user cards + follow requests are TODOs (`POST/DELETE /api/follows/:userId`, `POST /api/follow-requests/:id/accept`, `DELETE /api/follow-requests/:id`).
  - `/profile` → `ProfilePage` — guests get `GuestPrompt`; `EditProfileModal` (saves via `updateUser()` = **local-only**) and `ShareProfileModal`; TODO: `GET /api/users/:username`.
  - `/messages` → `MessagesPage` — guests get `GuestPrompt`; conversations come from `MessagesContext` (localStorage `inkspace_inbox`; demo conversations filtered out; `unreadCount`, `markRead`, `sendMessage` — **frontend-only**).
  - `/create` → `CreatePostPage` — guests get `GuestPrompt`; contentEditable rich-text editor (execCommand toolbar: H1/H2, bold, italic, quote, code, list, link, image; cover upload, category, tags max 5, preview mode, word count) inside `AppLayout`; **"Publish" is still a demo `alert()`**.
  - `*` → redirect to `/`.
- **Guard:** `GuestGuard` (in `App.jsx`) renders `GuestPrompt` for unauthenticated users (replaced the older `ProtectedRoute` redirect).
- `src/context/AuthContext.jsx` — token/user in localStorage (`inkspace_token` / `inkspace_user`); `login`, `logout`, `updateUser(patch)` (local-only profile patch), `isAuthenticated`.
- `src/context/MessagesContext.jsx` — demo inbox persisted in localStorage; no server calls yet.
- `src/api/auth.js` — `signupUser`, `loginUser`, `getMe` calling `/auth/*` (has `safeJson` + friendly network-error handling). Flow: signup → `/login?registered=1`; sign-in → `/feed` (navigation lives in `AuthPanel`).
- `src/components/`:
  - Marketing/landing: `Navbar` (anchor links only for guests; when logged in: @username, My Feed, Write, Log Out), `HeroSection`, `FeaturesSection`, `CategoriesSection`, `Footer`, `AuthPanel` (props: `lockedMode`, `justRegistered`).
  - App shell (`layout/`): `AppLayout` = `Sidebar` + `BottomNav` (mobile) + `MoreMenu` — wraps every in-app page; Sidebar/BottomNav use `useMessages` for unread badges.
  - `ui/`: `PostCard` (like/bookmark TODOs: `PATCH /api/posts/:id/like`, `POST /api/bookmarks`), `ShareModal` (TODO: `POST /api/messages` / `POST /api/shares`), `GuestPrompt`, `Loader`.
  - `discover/DiscoverUserCard`; `feed/EmptyFeedState`; `profile/EditProfileModal`, `profile/ShareProfileModal`.
  - **Dead code:** `TrendingSection`, `WritersSection`, `NewsletterSection` — exist but are imported nowhere.
- Dev server: Vite default port **5173**; `client/vite.config.js` proxies `/auth` and `/api` → `http://localhost:3001`.

### server/ — Express 5 (ESM), entry point `server/server.js`
- ⚠️ `server/app.js` is an **empty file** — the app is created and listens in `server/server.js`. Default port fallback **3001** (was 3036); `server/.env` sets `PORT=3001`.
- `routes/auth.js` → `POST /auth/signup`, `POST /auth/login` (in `controllers/authController.js`: bcryptjs hash cost 10, JWT signed with `JWT_SECRET`, `JWT_EXPIRES_IN` default `1h`), `GET /auth/me` (behind `authMiddleware`).
- `routes/posts.js` → `POST /posts` (auth), `GET /posts/:id` (public), `PUT /posts/:id` (auth, author-only), `DELETE /posts/:id` (auth, author-only).
- `controllers/postController.js` — 🚧 **DB queries are placeholders**: `postQueries = { create: null, findById: null, update: null, delete: null }`, so every post operation throws `Post query placeholder not implemented`. Expected `posts` columns per file comments: `id`, `author_id`, `title`, `content`, `created_at`, `edited`.
- `middlewares/authMiddleware.js` — expects a signed JWT in the `Authorization` header; verifies with `JWT_SECRET` (fallback `"change-me"`).
- `utils/db.js` — `mysql2/promise` pool → **TiDB Cloud** (MySQL-compatible; host/user/password come from `.env`, with hardcoded fallback values in the file). TLS enabled in the pool config; CA cert file at `server/certs/isrgrootx1.pem` (env key `CA` exists but `db.js` does not currently read it).
- DB tables: `users` (id, email, dob, username, password) exists; `posts` schema planned but queries unimplemented.
- Unused deps in `server/package.json`: `pg`, `cookie-parser`.

### Root
- `README.md` — run instructions (partially stale: says port 3036).
- `package-lock.json` at root is vestigial (87 bytes); real lockfiles live in `client/` and `server/`.

## 3. How to run (local dev)

```bash
# backend
cd server && npm install && npm run dev      # nodemon → http://localhost:3001
# frontend (second terminal)
cd client && npm install && npm run dev      # Vite → http://localhost:5173
```

- Frontend build: `cd client && npm run build`; lint: `npm run lint` (oxlint). No test suites exist anywhere (`server` `npm test` is a stub).
- Machine: Node v26 / npm 11 (CachyOS). Server CORS in `server/server.js` allows only origin `http://localhost:5173`.

## 4. Known issues / gotchas (as of 2026-10-05)

1. **Post creation is not implemented end-to-end** — `CreatePostPage` "Publish" is an alert demo; `postController.js` queries are null placeholders.
2. **The 2026-10-01 frontend update added many "wire me to the API" markers** — the next big body of work is implementing the endpoints the UI expects: `GET /api/feed`, `GET /api/users/:username`, `POST/DELETE /api/follows/:userId`, follow-request accept/delete, `PATCH /api/posts/:id/like`, `POST /api/bookmarks`, `POST /api/messages`, `POST /api/shares`, plus finishing `postController`. Grep `TODO` under `client/src` for the live list.
3. **`server/.env` is committed to git with live DB credentials**, and **`server/node_modules` (~1500 files) is committed** — treat `.env` as secret (never copy credentials into docs, chat, or the changelog); cleanup (untrack + `.gitignore` + rotate) is a recommended future task.
4. `server/app.js` empty; real entry is `server/server.js`. README still claims port 3036 — actual port is 3001.
5. Dead code: `TrendingSection`, `WritersSection`, `NewsletterSection` (unused); `pg`, `cookie-parser` deps unused.
6. A git worktree for the Copilot branch `adhiraj-singh-10088-run-frontend-backend` exists at `/home/adhiraj/GitHub/Projects/copilot-worktrees/qna-boot/adhiraj-singh-10088-refactored-guide` (its history is ≤ `main`; no unique commits).
7. **Hermes output-redaction quirk (not a bug in the repo):** `client/src/api/auth.js` (around line 70) reads as ``Authorization: *** ${token}`` in tool output because Hermes masks the `` `Bearer ${token}` `` template string. The file is valid JS (`node --check` passes) — do **not** "fix" it.
8. `JWT_SECRET` fallback is `"change-me"` — must be set in any real environment.
9. `/feed` is public; `/search`, `/profile`, `/messages`, `/create` show `GuestPrompt` to guests — no hard redirects anymore.

## 5. Design language (frontend)

Dark, literary theme: background `#0e0e0e`, panels `#141210` / `#161410` / `#1a1814`, borders `#2a2520` / `#2e2a24`, gold accent `#c9a84c` (hover `#e2c97e`), body text `#e8e0d4`, headings `#f5e6c8`, muted text `#7a7060`. Serif body font (Georgia stack) + Inter UI font via the `.font-sans-ui` utility. Tailwind v4 with inline utility classes; custom animations & scroll-reveal utilities in `client/src/index.css`.

## 6. History & process

- Full change history lives in **`CHANGELOG.md`** (seeded from `git log` 2026-10-05; includes the teammate frontend update of 2026-10-01). 26 commits total as of 2026-10-05, first commit 2026-07-12.
- **Maintenance note:** this file contains a masked token string that trips Hermes's whole-file write guard — update it with targeted `patch` edits; `write_file` overwrites get refused.
- After each change: (a) re-verify (lint/build or `node --check` as appropriate), (b) update section 4 / relevant sections here, (c) prepend a CHANGELOG.md entry with date, summary, files touched.
