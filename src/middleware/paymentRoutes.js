const express = require("express");
const paymentService = require("../services/paymentService");
const { authMiddleware, roleMiddleware } = require("./authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["admin", "finance"]), async (req, res) => {
  try {
    const payments = await paymentService.listPayments();
    res.json({ data: payments });
  } catch (error) {
    res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
  }
});

router.post("/", authMiddleware, roleMiddleware(["admin", "finance"]), async (req, res) => {
  try {
    const { invoiceId, financeId, paymentDate, slipImage } = req.body;

    if (!invoiceId || !financeId || !paymentDate) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Missing required fields" } });
    }

    const payment = await paymentService.createPayment({
      invoiceId,
      financeId,
      paymentDate,
      slipImage,
    });
    res.status(201).json({ data: { ...payment, verifyStatus: "pending" } });
  } catch (error) {
    if (error.statusCode === 400) {
      res.status(400).json({ error: { code: error.code, message: error.message } });
    } else {
      res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
    }
  }
});

router.patch("/:id/verify", authMiddleware, roleMiddleware(["admin", "finance"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { verifyStatus } = req.body;

    if (!verifyStatus || !["pending", "verified", "rejected"].includes(verifyStatus)) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid verify status" } });
    }

    const result = await paymentService.verifyPayment(id, verifyStatus);
    res.json({ data: result });
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({ error: { code: error.code, message: error.message } });
    } else {
      res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
    }
  }
});

module.exports = router;
