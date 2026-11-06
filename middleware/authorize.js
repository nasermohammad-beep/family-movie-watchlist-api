export function authorizeModification(req, res, next) {
  const user = req.user;
  const targetUserId = req.params.userId;

  if (
    !user ||
    (user.role !== "parent" &&
      (user.role !== "child" || String(targetUserId) !== String(user.id)))
  ) {
    return res.status(403).json({ error: "Access denied" });
  }

  next();
}
