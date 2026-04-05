const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "replace-with-strong-secret";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing token" } });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid token" } });
  }
};

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Access denied" } });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware, JWT_SECRET };
