import dotenv from "dotenv";
import app from "./app.js";

/*
 * Local dev entry point: runs the Express app on a port.
 * On Vercel the same app is served by the api/index.mjs serverless function
 * (server.js itself is never executed there).
 */

dotenv.config();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
