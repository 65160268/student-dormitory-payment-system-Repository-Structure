const pool = require("../db/pool");

class PaymentError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const paymentService = {
  async listPayments() {
    const [rows] = await pool.query("SELECT * FROM payments");
    return rows;
  },

  async createPayment(data) {
    // Check if finance user exists
    const [financeUser] = await pool.query(
      "SELECT * FROM users WHERE user_id = ?",
      [data.financeId]
    );
    if (financeUser.length === 0) {
      throw new PaymentError(400, "INVALID_FINANCE_USER", "Finance user not found");
    }

    try {
      const [result] = await pool.query("INSERT INTO payments SET ?", [
        {
          invoice_id: data.invoiceId,
          finance_id: data.financeId,
          payment_date: data.paymentDate,
          slip_image: data.slipImage,
        },
      ]);
      return { paymentId: result.insertId };
    } catch (error) {
      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        throw new PaymentError(400, "INVALID_INVOICE", "Invoice not found");
      }
      throw error;
    }
  },

  async verifyPayment(paymentId, verifyStatus) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [paymentRows] = await connection.query(
        "SELECT * FROM payments WHERE payment_id = ?",
        [paymentId]
      );

      if (paymentRows.length === 0) {
        throw new PaymentError(404, "PAYMENT_NOT_FOUND", "Payment not found");
      }

      await connection.query(
        "UPDATE payments SET verify_status = ? WHERE payment_id = ?",
        [verifyStatus, paymentId]
      );

      const payment = paymentRows[0];
      await connection.query(
        "UPDATE invoices SET status = 'paid' WHERE invoice_id = ?",
        [payment.invoice_id]
      );

      await connection.commit();

      return {
        paymentId: payment.payment_id,
        verifyStatus,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = paymentService;
