const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const pool = require("../../src/db/pool");
const app = require("../../src/app");

const JWT_SECRET = process.env.JWT_SECRET || "replace-with-strong-secret";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

describe("Integration API เบื้องต้น", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/health ควรตอบสถานะพร้อมใช้งาน", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "UP", service: "hotel-management-api" });
  });

  test("GET /api/rooms โดยไม่มีโทเคนต้องถูกปฏิเสธ", async () => {
    const response = await request(app).get("/api/rooms");

    expect(response.statusCode).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  test("POST /api/login สำเร็จ และใช้โทเคนเรียก GET /api/rooms ได้", async () => {
    pool.query.mockResolvedValueOnce([
      [
        {
          user_id: 1,
          username: "admin01",
          password: "password123",
          role: "admin",
        },
      ],
    ]);

    pool.query.mockResolvedValueOnce([[]]);

    const loginResponse = await request(app)
      .post("/api/login")
      .send({ username: "admin01", password: "password123" });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.token).toBeTruthy();

    const roomsResponse = await request(app)
      .get("/api/rooms")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);

    expect(roomsResponse.statusCode).toBe(200);
    expect(Array.isArray(roomsResponse.body.data)).toBe(true);
  });

  test("POST /api/room-types ด้วย role staff ต้องถูกปฏิเสธ", async () => {
    const staffToken = signToken({ userId: 2, username: "staff01", role: "staff" });

    const response = await request(app)
      .post("/api/room-types")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        typeName: "Suite",
        baseRent: 5000,
        waterUnitRate: 20,
        electricUnitRate: 8,
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  test("POST /api/room-types ด้วย role admin ควรสำเร็จ", async () => {
    const adminToken = signToken({ userId: 1, username: "admin01", role: "admin" });

    pool.query.mockResolvedValueOnce([{ insertId: 99 }]);

    const response = await request(app)
      .post("/api/room-types")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        typeName: "Suite",
        baseRent: 5000,
        waterUnitRate: 20,
        electricUnitRate: 8,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.data.typeId).toBe(99);
    expect(response.body.data.typeName).toBe("Suite");
  });
});
