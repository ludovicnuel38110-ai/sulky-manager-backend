const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      "SECRET_KEY_SULKY_MANAGER" // ⚠️ DOIT ÊTRE IDENTIQUE
    );

    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};
