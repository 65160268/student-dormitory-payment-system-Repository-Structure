const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

const pool = require("../../src/db/pool");
const authService = require("../../src/services/authService");

describe("authService.login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwt.sign.mockReturnValue("mock-token");
  });

  test("throws INVALID_CREDENTIALS when username does not exist", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    await expect(authService.login("unknown", "password123")).rejects.toMatchObject({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  });

  test("returns token and user info with plain-text password match", async () => {
    pool.query.mockResolvedValueOnce([
      [{ user_id: 1, username: "admin01", password: "password123", role: "admin" }],
    ]);

    const result = await authService.login("admin01", "password123");

    expect(result.token).toBe("mock-token");
    expect(result.user).toEqual({ userId: 1, username: "admin01", role: "admin" });
    expect(jwt.sign).toHaveBeenCalledTimes(1);
  });

  test("uses bcrypt.compare when password is a hash", async () => {
    pool.query.mockResolvedValueOnce([
      [{ user_id: 2, username: "staff01", password: "$2b$10$hash", role: "staff" }],
    ]);
    bcrypt.compare.mockResolvedValueOnce(true);

    const result = await authService.login("staff01", "secure-pass");

    expect(result.token).toBe("mock-token");
    expect(bcrypt.compare).toHaveBeenCalledWith("secure-pass", "$2b$10$hash");
  });

  test("throws INVALID_CREDENTIALS when bcrypt.compare fails", async () => {
    pool.query.mockResolvedValueOnce([
      [{ user_id: 2, username: "staff01", password: "$2b$10$hash", role: "staff" }],
    ]);
    bcrypt.compare.mockResolvedValueOnce(false);

    await expect(authService.login("staff01", "wrong-pass")).rejects.toMatchObject({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  });

  test("throws INVALID_CREDENTIALS when plain-text password mismatch", async () => {
    pool.query.mockResolvedValueOnce([
      [{ user_id: 3, username: "finance01", password: "correct", role: "finance" }],
    ]);

    await expect(authService.login("finance01", "wrong")).rejects.toMatchObject({
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  });

  test("signs token payload with user id username and role", async () => {
    pool.query.mockResolvedValueOnce([
      [{ user_id: 10, username: "staff02", password: "secret", role: "staff" }],
    ]);

    await authService.login("staff02", "secret");

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        userId: 10,
        username: "staff02",
        role: "staff",
      },
      expect.any(String),
      expect.objectContaining({ expiresIn: expect.any(String) })
    );
  });
});
