module.exports = function (req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Accès admin refusé" });
  }
  next();
};
