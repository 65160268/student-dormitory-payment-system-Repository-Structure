const express = require("express");
const roomTypeService = require("../services/roomTypeService");
const { authMiddleware, roleMiddleware } = require("./authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const { typeName, baseRent, waterUnitRate, electricUnitRate } = req.body;

    const roomType = await roomTypeService.createRoomType({
      typeName,
      baseRent,
      waterUnitRate,
      electricUnitRate,
    });
    res.status(201).json({ data: roomType });
  } catch (error) {
    if (error.statusCode === 409) {
      res.status(409).json({ error: { code: error.code, message: error.message } });
    } else {
      res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
    }
  }
});

module.exports = router;
