import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "family-movie-secret-key";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
