# QnA Boot

## Run the web app

### Prerequisites

- Node.js and npm
- A configured MySQL database
- A server environment file at `server/.env` with the database and JWT settings

### Install dependencies

From the project root, install dependencies for both applications:

```bash
cd client
npm install

cd ../server
npm install
```

### Start the backend

Open a terminal in the project root and run:

```bash
cd server
npm run dev
```

The API runs on `http://localhost:3001` by default. Use `npm start` instead of
`npm run dev` to run the backend without file watching.

### Start the frontend

Open a second terminal in the project root and run:

```bash
cd client
npm run dev
```

Vite prints the frontend URL in the terminal, usually `http://localhost:5173`.
Open that URL in a browser while the backend is running.

## Production build & Vercel deployment

The repo deploys to **Vercel as a single project** (one domain): the Vite client
is built as static files, and the whole Express API runs as one Node serverless
function (`api/index.mjs`, wired by `vercel.json`).

### Project setup (Vercel dashboard)

1. Import this GitHub repo. Keep the **Root Directory** as the repository root —
   do *not* point it at `client/` or `server/`; the root `vercel.json` wires
   everything (build, output, function, rewrites).
2. Add the environment variables under **Settings → Environment Variables**
   (Production **and** Preview):

   | Variable | Value |
   | --- | --- |
   | `DB_HOST` | TiDB Cloud host (e.g. `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`) |
   | `DB_PORT` | `4000` |
   | `DB_USER` | TiDB Cloud username |
   | `DB_PASSWORD` | TiDB Cloud password |
   | `DB_NAME` | `qna` |
   | `JWT_SECRET` | long random string (`openssl rand -hex 48`) |
   | `JWT_EXPIRES_IN` | `1h` (optional) |

   Optional: `CORS_ORIGINS` (only needed when client and API are on different
   origins), `DB_CONNECTION_LIMIT`, `DB_CONNECT_TIMEOUT`, `UPLOADS_DIR`,
   `RATE_LIMIT_AUTH_MAX`, `RATE_LIMIT_API_MAX`.
3. Deploy, then open `https://<your-app>.vercel.app/api/health` — expect
   `{"ok":true,"db":"connected"}`. If it reports `missing_env` (with the list)
   or `db: "unreachable"` (with an error code), fix the corresponding
   environment variables and redeploy.

### What the deployment config does

- `vercel.json` builds `client/` → `client/dist` (static), and routes
  `/auth/*`, `/api/*`, `/uploads/*` to the serverless function (the Express app
  in `server/app.js`); all other paths fall back to the SPA's `index.html`.
- `regions: ["sin1"]` co-locates the function with the TiDB cluster
  (Singapore) — change or remove it if you move the database.
- Node.js version is pinned to 22.x via the root `package.json` (`engines`).

### Serverless notes

- **Uploads are ephemeral:** Vercel's filesystem is read-only except `/tmp`.
  Cover/avatar uploads fall back to a per-instance temp directory (files don't
  survive redeploys or cold starts), or the API answers 503 when nothing is
  writable. Use object storage (e.g. Vercel Blob) for durable images.
- **The database is strictly environment-configured** — there are no in-code
  credential fallbacks. A misconfigured deployment fails visibly (`/api/health`)
  instead of silently connecting somewhere unexpected.
- Rate limiting uses per-instance memory (fine for this project; a shared
  store would be needed for strict global limits).

## Production frontend build (manual)

```bash
cd client
npm run build
npm run preview
```
