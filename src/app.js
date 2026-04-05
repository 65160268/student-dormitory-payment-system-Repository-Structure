const express = require("express");
const authRoutes = require("./middleware/authRoutes");
const roomRoutes = require("./middleware/roomRoutes");
const roomTypeRoutes = require("./middleware/roomTypeRoutes");
const paymentRoutes = require("./middleware/paymentRoutes");
const invoiceRoutes = require("./middleware/invoiceRoutes");
const meterReadingRoutes = require("./middleware/meterReadingRoutes");

const app = express();

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "UP", service: "hotel-management-api" });
});

// Routes
app.use("/api", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/room-types", roomTypeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/meter-readings", meterReadingRoutes);

module.exports = app;
