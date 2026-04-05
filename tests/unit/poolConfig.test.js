describe("db pool config", () => {
  afterEach(() => {
    jest.resetModules();
    delete process.env.DB_HOST;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
  });

  test("uses env variables when provided", () => {
    process.env.DB_HOST = "db-host";
    process.env.DB_USER = "db-user";
    process.env.DB_PASSWORD = "db-pass";
    process.env.DB_NAME = "db-name";

    const createPool = jest.fn(() => ({ mocked: true }));
    jest.doMock("mysql2/promise", () => ({ createPool }));

    const pool = require("../../src/db/pool");

    expect(createPool).toHaveBeenCalledWith({
      host: "db-host",
      user: "db-user",
      password: "db-pass",
      database: "db-name",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    expect(pool).toEqual({ mocked: true });
  });

  test("falls back to default values", () => {
    const createPool = jest.fn(() => ({ mocked: true }));
    jest.doMock("mysql2/promise", () => ({ createPool }));

    require("../../src/db/pool");

    expect(createPool).toHaveBeenCalledWith({
      host: "localhost",
      user: "root",
      password: "",
      database: "dorm_system",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  });
});
