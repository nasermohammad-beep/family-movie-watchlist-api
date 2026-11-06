import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  findByUsername,
  findById,
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
} from "./utils/db.js";
import { authenticate } from "./middleware/authenticate.js";
import { authorizeModification } from "./middleware/authorize.js";

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "family-movie-secret-key";

app.use(express.json());

function parseId(id) {
  const n = Number(id);
  return Number.isNaN(n) ? id : n;
}

/* --- Auth Route --- */
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = findByUsername(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  let match = false;
  if (user.passwordHash) {
    match = await bcrypt.compare(password, user.passwordHash).catch(() => false);
  }
  if (!match && user._password && user._password === password) {
    match = true;
  }
  if (!match && user.password && user.password === password) {
    match = true;
  }

  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return res.status(200).json({ token });
});

/* --- Watchlist Routes --- */
app.use("/api/watchlist", authenticate);

// GET /api/watchlist/:userId
app.get("/api/watchlist/:userId", (req, res) => {
  const userId = parseId(req.params.userId);
  const watchlist = getWatchlist(userId);

  if (watchlist === null) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.status(200).json(watchlist);
});

// POST /api/watchlist/:userId/movies
app.post("/api/watchlist/:userId/movies", authorizeModification, (req, res) => {
  const userId = parseId(req.params.userId);
  const movie = addMovie(userId, req.body || {});

  if (!movie) {
    return res.status(404).json({ error: "User not found" });
  }
  return res.status(201).json(movie);
});

// PUT /api/watchlist/:userId/movies/:movieId
app.put("/api/watchlist/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const userId = parseId(req.params.userId);
  const movieId = parseId(req.params.movieId);
  const updated = updateMovie(userId, movieId, req.body || {});

  if (!updated) {
    return res.status(404).json({ error: "Movie or user not found" });
  }
  return res.status(200).json(updated);
});

// DELETE /api/watchlist/:userId/movies/:movieId
app.delete("/api/watchlist/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const userId = parseId(req.params.userId);
  const movieId = parseId(req.params.movieId);
  const deleted = deleteMovie(userId, movieId);

  if (!deleted) {
    return res.status(404).json({ error: "Movie or user not found" });
  }
  return res.status(200).json({ message: "Movie removed from watchlist" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on port " + PORT);
});

export default app;
