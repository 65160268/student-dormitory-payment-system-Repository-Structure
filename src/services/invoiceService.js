const pool = require("../db/pool");

class InvoiceError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const invoiceService = {
  async listInvoices() {
    const [rows] = await pool.query("SELECT * FROM invoices");
    return rows;
  },

  async createInvoice(data) {
    // Check if room exists
    const [roomRows] = await pool.query(
      "SELECT * FROM rooms WHERE room_id = ?",
      [data.roomId]
    );
    if (roomRows.length === 0) {
      throw new InvoiceError(404, "ROOM_NOT_FOUND", "Room not found");
    }

    const room = roomRows[0];

    // Get meter reading
    const [meterRows] = await pool.query(
      "SELECT * FROM meter_readings WHERE room_id = ? ORDER BY reading_date DESC LIMIT 1",
      [data.roomId]
    );
    if (meterRows.length === 0) {
      throw new InvoiceError(400, "METER_READING_NOT_FOUND", "Meter reading not found");
    }

    const meter = meterRows[0];

    // Calculate usage
    const waterUsage = meter.curr_water - meter.prev_water;
    const electricUsage = meter.curr_electric - meter.prev_electric;

    // Validate meter data
    if (waterUsage < 0 || electricUsage < 0) {
      throw new InvoiceError(400, "INVALID_METER_DATA", "Invalid meter data");
    }

    // Calculate totals
    const baseRent = room.base_rent || 0;
    const totalWater = waterUsage * (room.water_unit_rate || 0);
    const totalElectric = electricUsage * (room.electric_unit_rate || 0);
    const grandTotal = baseRent + totalWater + totalElectric;

    // Create invoice with retry for duplicate
    let invoiceId;
    let retries = 3;

    while (retries > 0) {
      try {
        const invoiceNo = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
        
        const [result] = await pool.query("INSERT INTO invoices SET ?", [
          {
            invoice_no: invoiceNo,
            room_id: data.roomId,
            status: "pending",
            due_date: data.dueDate,
            base_rent: baseRent,
            water_usage: waterUsage,
            total_water: totalWater,
            electric_usage: electricUsage,
            total_electric: totalElectric,
            grand_total: grandTotal,
          },
        ]);
        invoiceId = result.insertId;
        break;
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY" && retries > 1) {
          retries--;
          continue;
        }
        throw error;
      }
    }

    return {
      invoiceId,
      roomNumber: room.room_number,
      totalRent: baseRent,
      totalWater,
      totalElectric,
      grandTotal,
      status: "pending",
    };
  },
};

module.exports = invoiceService;
