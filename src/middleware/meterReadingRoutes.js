const express = require("express");
const { authMiddleware, roleMiddleware } = require("./authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["admin", "finance", "staff", "manager"]), async (req, res) => {
  try {
    res.json({ data: [] });
  } catch (error) {
    res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
  }
});

router.post("/", authMiddleware, roleMiddleware(["admin", "manager", "staff"]), async (req, res) => {
  try {
    const { roomId, staffId, currWater, currElectric } = req.body;

    if (!roomId || !staffId || currWater === undefined || currElectric === undefined) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Missing required fields" } });
    }

    res.status(201).json({ data: { readingId: 333 } });
  } catch (error) {
    res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
  }
});

module.exports = router;
