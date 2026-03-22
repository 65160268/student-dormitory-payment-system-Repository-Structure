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

describe("Integration Suite: Invoice API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/invoices returns list for admin", async () => {
    const token = signToken({ userId: 1, username: "admin01", role: "admin" });
    pool.query.mockResolvedValueOnce([[{ invoice_id: 1, invoice_no: "INV-202603-0001" }]]);

    const response = await request(app)
      .get("/api/invoices")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("POST /api/invoices validates required fields", async () => {
    const token = signToken({ userId: 1, username: "admin01", role: "admin" });

    const response = await request(app)
      .post("/api/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send({ roomId: 1 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("POST /api/invoices succeeds for finance role", async () => {
    const token = signToken({ userId: 3, username: "finance01", role: "finance" });

    pool.query.mockResolvedValueOnce([
      [{ room_id: 1, room_number: "A101", base_rent: 3500, water_unit_rate: 18, electric_unit_rate: 7 }],
    ]);
    pool.query.mockResolvedValueOnce([
      [{ reading_id: 1, prev_water: 50, curr_water: 58, prev_electric: 120, curr_electric: 132 }],
    ]);
    pool.query.mockResolvedValueOnce([{ insertId: 5001 }]);

    const response = await request(app)
      .post("/api/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send({ roomId: 1, dueDate: "2026-04-05" });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.invoiceId).toBe(5001);
    expect(response.body.data.grandTotal).toBe(3728);
  });

  test("POST /api/invoices rejects staff role", async () => {
    const token = signToken({ userId: 2, username: "staff01", role: "staff" });

    const response = await request(app)
      .post("/api/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send({ roomId: 1, dueDate: "2026-04-05" });

    expect(response.statusCode).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});
