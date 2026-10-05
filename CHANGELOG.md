# CHANGELOG — qna-boot ("Inkspace")

Human/agent-readable log of every change made to this project, newest first — same spirit as the GitHub history, plus a record of AI-agent sessions.

**Entry format** (add new entries at the top, under "Entries"):

```md
### YYYY-MM-DD — short title   [git: <hash if committed>]
- What changed and why (1–4 bullets)
- Files: exact paths touched
- Verified: how it was checked (lint / build / manual run / node --check)
```

Every change made through Hermes also updates `AGENTS.md` in the same change set.

---

## Entries (newest first)

### 2026-10-05 — Security phase: XSS sanitization, rate limiting, secret hygiene, httpOnly-cookie sessions   [Hermes agent session · git: 35d56a6]
- **XSS sanitization (stored-XSS surface closed):** post content is sanitized server-side with `sanitize-html` on write (`postController` create/update) and on read (`utils/posts.js` mapPost — covers legacy rows); allow-list keeps the editor's own markup (headings, bold/italic, lists, blockquote, pre, http/https links + images) and strips scripts, iframes, event handlers, `style=`, and `javascript:` URLs. Comments were already rendered as text (safe).
- **Rate limiting:** `express-rate-limit` — auth (login/signup) counts **failed** attempts only: 30 per 15 min per IP (429 + JSON error); global `/api` limiter 1000 per 15 min. Env-overridable (`RATE_LIMIT_AUTH_MAX`, `RATE_LIMIT_API_MAX`).
- **Session → httpOnly cookie:** login sets an httpOnly, SameSite=Lax `inkspace_token` cookie (Secure when `NODE_ENV=production`); `authMiddleware` reads cookie first, Bearer second (scripts/API clients unchanged); `POST /auth/logout` clears it; the SPA no longer stores the JWT in localStorage (keeps user only; hydrates session from the cookie on boot via `/auth/me`).
- **Headers & limits:** `helmet()` defaults, `x-powered-by` disabled, JSON body cap 1 MB, `trust proxy` set.
- **Secret hygiene:** `server/.env` + `server/node_modules` untracked (1505 files) + `.gitignore` files + `server/.env.example` added; `JWT_SECRET` rotated to a fresh 96-hex value. Old DB credentials remain in git history → **rotate the DB password in the TiDB console (user action)**; history rewrite deliberately not attempted on a shared repo.
- **Verified:** `~/.hermes/cache/scratch/qna-security-check.mjs` 29/29 (cookie flags, auth paths, XSS payloads on create/update/legacy rows, headers); rate-limit experiment (401×3 → 429, good login blocked while tripped, recovers after restart); full API smoke 50/50; browser walkthrough (cookie-only session likes a post; no cookie → 401s; UI logout clears cookie + user); client `npm run build` green.
- Files: `server/{server.js,utils/{sanitize,authCookie}.js,controllers/{authController,postController}.js,middlewares/authMiddleware.js,routes/auth.js,utils/posts.js,.gitignore,.env.example,package.json,package-lock.json}`, `client/src/{api/{client,auth}.js,context/AuthContext.jsx}`, root `.gitignore`, `AGENTS.md`, `CHANGELOG.md`.

### 2026-10-05 — Post-verification fix batch (bugs found by the independent subagent tests)   [Hermes agent session · git: a28b7c8]
- **Post editing (Feature 1, high):** edit mode now pre-fills the editor body — the HTML is stashed in state and applied once the editor mounts (`CreatePostPage.jsx`), instead of writing to an unmounted ref. Browser-verified: title + body prefilled, save works, "(Edited)" shown.
- **Notifications timestamps (Feature 6, medium):** all `created_at` values read 5h30m early (relative times wrong app-wide). Root cause: `mysql2` parsed TiDB's UTC datetime strings as local (IST) time. Fixed with `timezone: 'Z'` on the pool (`server/utils/db.js`); probe + API checks now match host UTC to the second.
- **Profile editing (Feature 7):** fixed stuck "User not found" after username rename (request-sequence guard + silent reload in `ProfilePage.jsx`) and made the "Profile updated." confirmation actually stick (modal prefill effect no longer depends on `user`; same-profile refresh no longer flashes the page loader while the modal is open — loader only shows on route change).
- **i18n gaps (Feature 3):** translated login/signup leftovers (Forgot password?, locked-mode footer, Explore as Guest, signup placeholders, DOB select labels) and landing nav links + hero tag chips; fixed raw `create.words` key (reuses `post.words`); new locale keys `landingNav`, `landingTags`, `guest.noAccount/createOneFree/exploreGuest`, `auth.dd/mm/yyyy` in EN/HI/ES.
- **API hardening bits:** `POST/PUT /api/posts` now reject markup-only content (`stripHtml` non-empty check); user search escapes LIKE wildcards (`%`, `_`, `\`) so they match literally.
- **Notifications badge (Feature 6, low):** reading a notification optimistically drops the badge and reconciles after the PATCH (`NotificationsPage.jsx`). Browser-verified: unread 5→4, badge spans follow.
- **Verified:** `npm run lint` (warnings only, pre-existing), `npm run build` green; API check script `~/.hermes/cache/scratch/qna-verify-fixes.mjs` 8/9 (the 1 "fail" was a wrong test expectation — those users genuinely contain `_`); browser re-walkthrough of every fixed flow (edit prefill, rename, saved message, badge decrement, Hindi landing logged-out).
- Files: `server/utils/db.js`, `server/controllers/{postController,userController}.js`, `client/src/pages/{CreatePostPage,ProfilePage,NotificationsPage,LoginPage}.jsx`, `client/src/components/{AuthPanel,Navbar,HeroSection}.jsx`, `client/src/components/profile/EditProfileModal.jsx`, `client/src/i18n/locales/{en,hi,es}.json`, `AGENTS.md`, `CHANGELOG.md`.

### 2026-10-05 — Features 1–7 implemented: post creation, share URLs, i18n, user search, follows, notifications, profile editing   [Hermes agent session · git: a28b7c8]
- **Backend:** new schema via `server/scripts/migrate.js` (adds `users.full_name/bio/is_private`; creates `posts`, `likes`, `comments`, `bookmarks`, `follows`, `notifications` on TiDB). Wired `postController` (real queries), added `userController`, `followController`, `notificationController`, `utils/posts.js`, `utils/notify.js`, `optionalAuth` middleware, and route groups: `/api/feed`, `/api/posts` (CRUD, like, bookmark, comments), `/api/users` (search, profile, posts, followers/following, follow), `/api/follow-requests`, `/api/notifications`. `authController` now stores/returns `full_name` and `/auth/me` reads fresh from DB.
- **Frontend:** feed + post page (`/post/:id` permalink) fetch real data; like/save/comment/share wired with optimistic UI; `/create` publishes & edits for real; `/profile` + `/u/:username` with stats, tabs, followers/following modals, follow/request button, private lock; `/notifications` page + badge (polls 30s); live user search + follow-request accept/decline; profile editing (name, username, bio, private toggle) hitting `PATCH /api/users/me`; share = permalink copy + native share; react-i18next with EN/HI/ES + LanguageSwitcher (Navbar + MoreMenu); new API layer under `src/api/`.
- **Found & fixed during testing:** like re-click produced duplicate notifications (now only on fresh insert); notification locale keys renamed to match DB types (`like`/`comment`/`follow`/`follow_request`/`follow_accepted`); LanguageSwitcher import path.
- **Verified:** API smoke script `~/.hermes/cache/scratch/qna-api-smoke.mjs` — 50/50 checks (auth, posts, likes, comments, follows, private accounts, requests, notifications, search, profile edit, deletes); `npm run build` green; browser walkthrough of landing/feed/post/profile/notifications/publish/language-switch; independent subagent tests per feature (see their reports).
- **Not yet done (deliberately):** messaging backend, cover/avatar uploads, security hardening (next phase per user).
- Files: see `git status` — `server/{controllers,utils,routes,middlewares,scripts}/*`, `client/src/{api,context,pages,components,i18n}/*`, `AGENTS.md`, `CHANGELOG.md`.

### 2026-10-05 — Synced teammate frontend update; docs committed & pushed   [Hermes agent session]
- Fetched `origin`: two new commits by Atishay Jain — `2330a99` "Updated features added to frontend" + merge commit `9795f26` (pushed 2026-10-01). Fast-forwarded local `main` from `c03d2c5` to `9795f26`.
- What that update added (frontend): standalone `/login` page; app shell (`AppLayout` = Sidebar + BottomNav + MoreMenu) wrapping all in-app pages; public `/feed` with demo posts + `PostCard`/`ShareModal`; `/search` discover page with follow-request TODOs; `/profile` (+ edit/share modals, local-only `updateUser`); `/messages` (+ `MessagesContext` demo inbox in localStorage); `GuestGuard`/`GuestPrompt` replacing the old auth redirect; many "wire me to the API" TODO markers across the new pages.
- Server side: only the default port changed 4000 → 3001 (`server/server.js` fallback, `server/.env`, Vite proxy). No new backend endpoints.
- Refreshed `AGENTS.md` to match the new structure; committed and pushed `AGENTS.md` + `CHANGELOG.md`.
- Files: `AGENTS.md`, `CHANGELOG.md` (docs only).
- Verified: `git log` / `git diff` inspection of the incoming commits against the working tree.

### 2026-10-05 — Project notes + this changelog added   [Hermes agent session]
- Read the whole codebase and created two root files: `AGENTS.md` (project map, stack, how-to-run, known issues — maintained by the agent) and `CHANGELOG.md` (this file).
- Seeded the changelog with the full git history (24 commits at that point, 2026-07-12 → 2026-09-18).
- Standing arrangement: both files are updated on every future feature/change request for this project.
- Files: `AGENTS.md`, `CHANGELOG.md` (both new; committed & pushed the same day — see the sync entry above).
- Verified: codebase read directly from source; history from `git log`; secret scan of notes (no credentials copied).

## Git history backfill

All commits in `main` as of 2026-10-05 **after syncing the teammate pushes** (26 total; from `git log`, newest first — direct copy of the repo's GitHub history):

| Date | Author | Commit | Change |
|------|--------|--------|--------|
| 2026-10-01 | Atishay Jain | `9795f26` | Merge branch 'main' of https://github.com/adhiraj-singh-10088/qna-boot |
| 2026-10-01 | Atishay Jain | `2330a99` | Updated features added to frontend |
| 2026-09-18 | adhiraj-singh-10088 | `c03d2c5` | Merge branch 'main' of https://github.com/adhiraj-singh-10088/qna-boot |
| 2026-09-18 | adhiraj-singh-10088 | `94bc1fb` | i |
| 2026-09-18 | Atishay Jain | `0b774f0` | API connected |
| 2026-09-10 | ADITYA GANGULY | `9c71f61` | Added tidb cloud database certificates |
| 2026-09-10 | ADITYA GANGULY | `925629d` | Modified the connections |
| 2026-09-10 | ADITYA GANGULY | `4025fe2` | attached the additional database testing modules in comments |
| 2026-09-10 | ADITYA GANGULY | `2f624c9` | added final .env for db connection |
| 2026-09-10 | ADITYA GANGULY | `c545fab` | Update DB_PASSWORD in .env file |
| 2026-09-09 | ADITYA GANGULY | `4ba26fb` | Update DB_PASSWORD in .env file |
| 2026-09-09 | ADITYA GANGULY | `1cc474a` | Modified the authentication api using cloud hosting |
| 2026-09-09 | ADITYA GANGULY | `a186a01` | Modified the authentication api |
| 2026-09-09 | Atishay Jain | `55f9536` | Added username feature |
| 2026-09-09 | Atishay Jain | `54726ad` | Moved files to new folder structure |
| 2026-09-09 | Atishay Jain | `7925904` | Addeed DOB in create account form |
| 2026-09-09 | adhiraj-singh-10088 | `888046c` | updated auth api |
| 2026-09-09 | adhiraj-singh-10088 | `986f92f` | added authentication api |
| 2026-09-09 | adhiraj-singh-10088 | `4adbc27` | initiated backend |
| 2026-09-05 | Atishay Jain | `9861c71` | Add inkspace frontend |
| 2026-09-01 | ADITYA GANGULY | `b038b85` | Add files via upload |
| 2026-09-01 | ADITYA GANGULY | `5f13956` | Delete Blog Posting Platform/Blog Posting Platform.docx |
| 2026-09-01 | ADITYA GANGULY | `2ac50c1` | Add files via upload |
| 2026-07-28 | adhiraj-singh-10088 | `0380840` | Create Backend Architecture Design.pdf |
| 2026-07-12 | adhiraj-singh-10088 | `c075a13` | initialised |
| 2026-07-12 | Adhiraj | `1e28e0f` | Initial commit |
