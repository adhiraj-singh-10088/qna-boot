import db from "./utils/db.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => res.send("Hey Chat"));

app.use("/auth", authRouter);
app.use("/posts", postsRouter);

const PORT = process.env.PORT || 3036;
// app.get('/check-db', async (req, res) => {
//   try {
//     // Re-use whatever database pool import Adhiraj created (e.g., db or pool)
//     const [rows] = await db.execute('SELECT 1 + 1 AS result');
//     res.json({ status: 'Database connected!', data: rows });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
