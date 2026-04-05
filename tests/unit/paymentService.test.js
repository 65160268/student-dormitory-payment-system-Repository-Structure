jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const pool = require("../../src/db/pool");
const paymentService = require("../../src/services/paymentService");

describe("paymentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listPayments returns rows", async () => {
    const rows = [{ payment_id: 1, verify_status: "pending" }];
    pool.query.mockResolvedValueOnce([rows]);

    const result = await paymentService.listPayments();

    expect(result).toEqual(rows);
  });

  test("createPayment throws INVALID_FINANCE_USER", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    await expect(
      paymentService.createPayment({
        invoiceId: 1,
        financeId: 99,
        paymentDate: "2026-03-08 10:15:00",
        slipImage: null,
      })
    ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_FINANCE_USER" });
  });

  test("createPayment maps missing invoice to INVALID_INVOICE", async () => {
    pool.query.mockResolvedValueOnce([[{ user_id: 3 }]]);
    pool.query.mockRejectedValueOnce({ code: "ER_NO_REFERENCED_ROW_2" });

    await expect(
      paymentService.createPayment({
        invoiceId: 999,
        financeId: 3,
        paymentDate: "2026-03-08 10:15:00",
        slipImage: null,
      })
    ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_INVOICE" });
  });

  test("createPayment rethrows unexpected insert errors", async () => {
    pool.query.mockResolvedValueOnce([[{ user_id: 3 }]]);
    pool.query.mockRejectedValueOnce({ code: "ER_BAD_NULL_ERROR" });

    await expect(
      paymentService.createPayment({
        invoiceId: 1,
        financeId: 3,
        paymentDate: "2026-03-08 10:15:00",
        slipImage: null,
      })
    ).rejects.toMatchObject({ code: "ER_BAD_NULL_ERROR" });
  });

  test("verifyPayment updates status and commits transaction", async () => {
    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };

    pool.getConnection.mockResolvedValueOnce(connection);
    connection.query
      .mockResolvedValueOnce([[{ payment_id: 1, invoice_id: 77 }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await paymentService.verifyPayment(1, "verified");

    expect(result).toEqual({ paymentId: 1, verifyStatus: "verified" });
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.release).toHaveBeenCalledTimes(1);
  });

  test("verifyPayment rolls back when payment not found", async () => {
    const connection = {
      beginTransaction: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValueOnce([[]]),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      release: jest.fn(),
    };

    pool.getConnection.mockResolvedValueOnce(connection);

    await expect(paymentService.verifyPayment(999, "verified")).rejects.toMatchObject({
      statusCode: 404,
      code: "PAYMENT_NOT_FOUND",
    });

    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.release).toHaveBeenCalledTimes(1);
  });
});
