const request = require("supertest");

jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
}));

const pool = require("../../src/db/pool");
const app = require("../../src/app");

describe("Integration Suite: Auth API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/login returns 400 when username/password missing", async () => {
    const response = await request(app).post("/api/login").send({ username: "admin01" });

    expect(response.statusCode).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("POST /api/login returns 401 for invalid credentials", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    const response = await request(app)
      .post("/api/login")
      .send({ username: "unknown", password: "wrong" });

    expect(response.statusCode).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  test("POST /api/login returns token for valid credentials", async () => {
    pool.query.mockResolvedValueOnce([
      [{ user_id: 1, username: "admin01", password: "password123", role: "admin" }],
    ]);

    const response = await request(app)
      .post("/api/login")
      .send({ username: "admin01", password: "password123" });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.role).toBe("admin");
  });
});
