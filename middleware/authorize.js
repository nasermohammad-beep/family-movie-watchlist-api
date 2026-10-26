export function authorizeModification(req, res, next) {
  if (req.user?.role === "parent") {
    return next();
  }

  if (
    req.user?.role === "child" &&
    String(req.params?.userId) === String(req.user?.id)
  ) {
    return next();
  }

  return res.status(403).json({ error: "Access denied" });
}
