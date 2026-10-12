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

The API runs on `http://localhost:3036` by default. Use `npm start` instead of
`npm run dev` to run the backend without file watching.

### Start the frontend

Open a second terminal in the project root and run:

```bash
cd client
npm run dev
```

Vite prints the frontend URL in the terminal, usually `http://localhost:5173`.
Open that URL in a browser while the backend is running.

## Production frontend build

```bash
cd client
npm run build
npm run preview
```

The backend can be started separately with:

```bash
cd server
npm start
```
