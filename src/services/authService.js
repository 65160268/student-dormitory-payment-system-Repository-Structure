const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

const JWT_SECRET = process.env.JWT_SECRET || "replace-with-strong-secret";

class AuthError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const authService = {
  async login(username, password) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      throw new AuthError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const user = rows[0];
    let isPasswordValid;

    // Check if password is a hash
    if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text comparison
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      throw new AuthError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        role: user.role,
      },
    };
  },
};

module.exports = authService;
