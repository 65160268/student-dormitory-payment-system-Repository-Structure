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

describe("Integration Suite: Meter Reading API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/meter-readings returns list for finance role", async () => {
    const token = signToken({ userId: 3, username: "finance01", role: "finance" });
    pool.query.mockResolvedValueOnce([[{ reading_id: 1, room_id: 1 }]]);

    const response = await request(app)
      .get("/api/meter-readings")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("POST /api/meter-readings rejects finance role", async () => {
    const token = signToken({ userId: 3, username: "finance01", role: "finance" });

    const response = await request(app)
      .post("/api/meter-readings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        roomId: 1,
        staffId: 2,
        prevWater: 10,
        currWater: 12,
        prevElectric: 100,
        currElectric: 105,
        readingDate: "2026-03-01",
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  test("POST /api/meter-readings validates required fields", async () => {
    const token = signToken({ userId: 2, username: "staff01", role: "staff" });

    const response = await request(app)
      .post("/api/meter-readings")
      .set("Authorization", `Bearer ${token}`)
      .send({ roomId: 1, staffId: 2 });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("POST /api/meter-readings creates reading", async () => {
    const token = signToken({ userId: 2, username: "staff01", role: "staff" });

    pool.query.mockResolvedValueOnce([[{ user_id: 2 }]]);
    pool.query.mockResolvedValueOnce([{ insertId: 333 }]);

    const response = await request(app)
      .post("/api/meter-readings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        roomId: 1,
        staffId: 2,
        prevWater: 50,
        currWater: 58,
        prevElectric: 120,
        currElectric: 132,
        readingDate: "2026-03-01",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.readingId).toBe(333);
  });
});
