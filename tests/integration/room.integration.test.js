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

describe("Integration Suite: Room API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/rooms denies when no token", async () => {
    const response = await request(app).get("/api/rooms");

    expect(response.statusCode).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  test("GET /api/rooms returns room list for finance role", async () => {
    const token = signToken({ userId: 3, username: "finance01", role: "finance" });
    pool.query.mockResolvedValueOnce([[{ room_id: 1, room_number: "A101" }]]);

    const response = await request(app)
      .get("/api/rooms")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("POST /api/rooms rejects finance role", async () => {
    const token = signToken({ userId: 3, username: "finance01", role: "finance" });

    const response = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${token}`)
      .send({ roomNumber: "C303", typeId: 1, status: "available" });

    expect(response.statusCode).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  test("POST /api/rooms validates payload", async () => {
    const token = signToken({ userId: 2, username: "staff01", role: "staff" });

    const response = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${token}`)
      .send({ roomNumber: "C303" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("PUT /api/rooms/:id updates room", async () => {
    const token = signToken({ userId: 1, username: "admin01", role: "admin" });
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const response = await request(app)
      .put("/api/rooms/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ roomNumber: "A101", typeId: 1, status: "occupied" });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.roomId).toBe(1);
  });
});
