const express = require("express");
const invoiceService = require("../services/invoiceService");
const { authMiddleware, roleMiddleware } = require("./authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["admin", "finance", "manager"]), async (req, res) => {
  try {
    const invoices = await invoiceService.listInvoices();
    res.json({ data: invoices });
  } catch (error) {
    res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
  }
});

router.post("/", authMiddleware, roleMiddleware(["admin", "finance"]), async (req, res) => {
  try {
    const { roomId, dueDate } = req.body;

    if (!roomId || !dueDate) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Missing required fields" } });
    }

    const invoice = await invoiceService.createInvoice({ roomId, dueDate });
    res.status(201).json({ data: invoice });
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 400) {
      res.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    } else {
      res.status(500).json({ error: { code: "SERVER_ERROR", message: error.message } });
    }
  }
});

module.exports = router;
