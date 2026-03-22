const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const pool = require("../../src/db/pool");
const app = require("../../src/app");

const JWT_SECRET = process.env.JWT_SECRET || "replace-with-strong-secret";
const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

describe("Integration Suite: Payment API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/payments rejects staff role", async () => {
    const token = signToken({ userId: 2, username: "staff01", role: "staff" });

    const response = await request(app)
      .get("/api/payments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  test("GET /api/payments returns list for finance", async () => {
    const token = signToken({ userId: 3, username: "finance01", role: "finance" });
    pool.query.mockResolvedValueOnce([[{ payment_id: 1, verify_status: "pending" }]]);

    const response = await request(app)
      .get("/api/payments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("POST /api/payments validates payload", async () => {
    const token = signToken({ userId: 3, username: "finance01", role: "finance" });

    const response = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({ invoiceId: 1, financeId: 3 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("POST /api/payments creates payment", async () => {
    const token = signToken({ userId: 3, username: "finance01", role: "finance" });

    pool.query.mockResolvedValueOnce([[{ user_id: 3 }]]);
    pool.query.mockResolvedValueOnce([{ insertId: 9001 }]);

    const response = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        invoiceId: 1,
        financeId: 3,
        paymentDate: "2026-03-08 10:15:00",
        slipImage: "uploads/slips/inv-202603-0001.png",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.paymentId).toBe(9001);
    expect(response.body.data.verifyStatus).toBe("pending");
  });

  test("PATCH /api/payments/:id/verify validates verify status", async () => {
    const token = signToken({ userId: 3, username: "finance01", role: "finance" });

    const response = await request(app)
      .patch("/api/payments/1/verify")
      .set("Authorization", `Bearer ${token}`)
      .send({ verifyStatus: "waiting" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
