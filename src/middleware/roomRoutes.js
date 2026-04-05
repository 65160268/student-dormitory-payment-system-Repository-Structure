const express = require("express");
const roomService = require("../services/roomService");
const { authMiddleware, roleMiddleware } = require("./authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["admin", "finance", "staff"]), async (req, res) => {
  try {
    const rooms = await roomService.listRooms();
    res.json({ data: rooms });
  } catch (error) {
    res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
  }
});

// Validation before role check
router.post("/", (req, res, next) => {
  const { roomNumber, typeId, status } = req.body;

  if (!roomNumber || !typeId || !status) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Missing required fields" } });
  }
  next();
}, authMiddleware, roleMiddleware(["admin", "manager"]), async (req, res) => {
  try {
    const { roomNumber, typeId, status } = req.body;
    const room = await roomService.createRoom({ roomNumber, typeId, status });
    res.status(201).json({ data: room });
  } catch (error) {
    if (error.statusCode === 409) {
      res.status(409).json({ error: { code: error.code, message: error.message } });
    } else if (error.statusCode === 400) {
      res.status(400).json({ error: { code: error.code, message: error.message } });
    } else {
      res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
    }
  }
});

router.put("/:id", authMiddleware, roleMiddleware(["admin", "manager"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, typeId, status } = req.body;

    if (!roomNumber || !typeId || !status) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Missing required fields" } });
    }

    const room = await roomService.updateRoom(parseInt(id), { roomNumber, typeId, status });
    res.json({ data: room });
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({ error: { code: error.code, message: error.message } });
    } else if (error.statusCode === 409 || error.statusCode === 400) {
      res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    } else {
      res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
    }
  }
});

module.exports = router;
