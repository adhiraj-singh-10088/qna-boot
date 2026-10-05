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
