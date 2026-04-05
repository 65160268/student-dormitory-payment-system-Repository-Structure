const express = require("express");
const authService = require("../services/authService");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Missing username or password" } });
    }

    const result = await authService.login(username, password);
    res.json({ token: result.token, user: result.user });
  } catch (error) {
    if (error.statusCode === 401) {
      res.status(401).json({ error: { code: error.code, message: error.message } });
    } else {
      res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
    }
  }
});

module.exports = router;
