const express = require("express");
const request = require("supertest");

function mountRoute(route, beforeRouteMiddleware) {
  const app = express();
  app.use(express.json());
  if (beforeRouteMiddleware) {
    app.use(beforeRouteMiddleware);
  }
  app.use("/", route);
  return app;
}

function mockAuthPass() {
  jest.doMock("../../src/middleware/authMiddleware", () => ({
    authMiddleware: (req, res, next) => next(),
    roleMiddleware: () => (req, res, next) => next(),
  }));
}

describe("invoiceRoutes extra coverage", () => {
  test("GET / returns 500 on unexpected error", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/invoiceService", () => ({
      listInvoices: jest.fn().mockRejectedValue(new Error("db down")),
      createInvoice: jest.fn(),
    }));

    const route = require("../../src/middleware/invoiceRoutes");
    const app = mountRoute(route);

    const res = await request(app).get("/");

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe("SERVER_ERROR");
  });

  test("POST / maps known 400 error", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/invoiceService", () => ({
      listInvoices: jest.fn(),
      createInvoice: jest.fn().mockRejectedValue({
        statusCode: 400,
        code: "METER_READING_NOT_FOUND",
        message: "no meter",
      }),
    }));

    const route = require("../../src/middleware/invoiceRoutes");
    const app = mountRoute(route);

    const res = await request(app).post("/").send({ roomId: 1, dueDate: "2026-04-01" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("METER_READING_NOT_FOUND");
  });

  test("POST / maps known 404 error", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/invoiceService", () => ({
      listInvoices: jest.fn(),
      createInvoice: jest.fn().mockRejectedValue({
        statusCode: 404,
        code: "ROOM_NOT_FOUND",
        message: "room missing",
      }),
    }));

    const route = require("../../src/middleware/invoiceRoutes");
    const app = mountRoute(route);

    const res = await request(app).post("/").send({ roomId: 99, dueDate: "2026-04-01" });

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe("ROOM_NOT_FOUND");
  });
});

describe("paymentRoutes extra coverage", () => {
  test("POST / maps known validation error to 400", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/paymentService", () => ({
      listPayments: jest.fn(),
      createPayment: jest.fn().mockRejectedValue({
        statusCode: 400,
        code: "INVALID_INVOICE",
        message: "Invalid invoice",
      }),
      verifyPayment: jest.fn(),
    }));

    const route = require("../../src/middleware/paymentRoutes");
    const app = mountRoute(route);

    const res = await request(app).post("/").send({
      invoiceId: 1,
      financeId: 1,
      paymentDate: "2026-01-01",
      slipImage: null,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("INVALID_INVOICE");
  });

  test("POST / returns 500 on unexpected error", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/paymentService", () => ({
      listPayments: jest.fn(),
      createPayment: jest.fn().mockRejectedValue(new Error("unexpected")),
      verifyPayment: jest.fn(),
    }));

    const route = require("../../src/middleware/paymentRoutes");
    const app = mountRoute(route);

    const res = await request(app).post("/").send({
      invoiceId: 1,
      financeId: 1,
      paymentDate: "2026-01-01",
      slipImage: null,
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe("SERVER_ERROR");
  });

  test("PATCH /:id/verify returns 500 on unexpected error", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/paymentService", () => ({
      listPayments: jest.fn(),
      createPayment: jest.fn(),
      verifyPayment: jest.fn().mockRejectedValue(new Error("boom")),
    }));

    const route = require("../../src/middleware/paymentRoutes");
    const app = mountRoute(route);

    const res = await request(app).patch("/10/verify").send({ verifyStatus: "verified" });

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe("SERVER_ERROR");
  });

  test("PATCH /:id/verify maps not found error to 404", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/paymentService", () => ({
      listPayments: jest.fn(),
      createPayment: jest.fn(),
      verifyPayment: jest.fn().mockRejectedValue({
        statusCode: 404,
        code: "PAYMENT_NOT_FOUND",
        message: "not found",
      }),
    }));

    const route = require("../../src/middleware/paymentRoutes");
    const app = mountRoute(route);

    const res = await request(app).patch("/10/verify").send({ verifyStatus: "verified" });

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe("PAYMENT_NOT_FOUND");
  });

  test("PATCH /:id/verify returns 400 when verifyStatus is missing", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/paymentService", () => ({
      listPayments: jest.fn(),
      createPayment: jest.fn(),
      verifyPayment: jest.fn(),
    }));

    const route = require("../../src/middleware/paymentRoutes");
    const app = mountRoute(route);

    const res = await request(app).patch("/10/verify").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("roomRoutes extra coverage", () => {
  test("POST / creates room and returns 201", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/roomService", () => ({
      listRooms: jest.fn(),
      createRoom: jest.fn().mockResolvedValue({
        roomId: 1,
        roomNumber: "A101",
        typeId: 1,
        status: "available",
      }),
      updateRoom: jest.fn(),
    }));

    const route = require("../../src/middleware/roomRoutes");
    const app = mountRoute(route);

    const res = await request(app).post("/").send({
      roomNumber: "A101",
      typeId: 1,
      status: "available",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.roomId).toBe(1);
  });

  test("POST / maps duplicate room error to 409", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/roomService", () => ({
      listRooms: jest.fn(),
      createRoom: jest.fn().mockRejectedValue({
        statusCode: 409,
        code: "ROOM_NUMBER_EXISTS",
        message: "duplicate",
      }),
      updateRoom: jest.fn(),
    }));

    const route = require("../../src/middleware/roomRoutes");
    const app = mountRoute(route);

    const res = await request(app).post("/").send({
      roomNumber: "A101",
      typeId: 1,
      status: "available",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe("ROOM_NUMBER_EXISTS");
  });

  test("POST / maps invalid type error to 400", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/roomService", () => ({
      listRooms: jest.fn(),
      createRoom: jest.fn().mockRejectedValue({
        statusCode: 400,
        code: "INVALID_ROOM_TYPE",
        message: "invalid",
      }),
      updateRoom: jest.fn(),
    }));

    const route = require("../../src/middleware/roomRoutes");
    const app = mountRoute(route);

    const res = await request(app).post("/").send({
      roomNumber: "A101",
      typeId: 1,
      status: "available",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("INVALID_ROOM_TYPE");
  });

  test("GET / returns 500 on unexpected error", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/roomService", () => ({
      listRooms: jest.fn().mockRejectedValue(new Error("db down")),
      createRoom: jest.fn(),
      updateRoom: jest.fn(),
    }));

    const route = require("../../src/middleware/roomRoutes");
    const app = mountRoute(route);

    const res = await request(app).get("/");

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe("SERVER_ERROR");
  });

  test("PUT /:id returns 500 on unexpected error", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/roomService", () => ({
      listRooms: jest.fn(),
      createRoom: jest.fn(),
      updateRoom: jest.fn().mockRejectedValue(new Error("unexpected")),
    }));

    const route = require("../../src/middleware/roomRoutes");
    const app = mountRoute(route);

    const res = await request(app).put("/8").send({
      roomNumber: "B201",
      typeId: 1,
      status: "available",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe("SERVER_ERROR");
  });

  test("PUT /:id returns 400 when required fields are missing", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/roomService", () => ({
      listRooms: jest.fn(),
      createRoom: jest.fn(),
      updateRoom: jest.fn(),
    }));

    const route = require("../../src/middleware/roomRoutes");
    const app = mountRoute(route);

    const res = await request(app).put("/8").send({ roomNumber: "A101" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("PUT /:id maps not found to 404", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/roomService", () => ({
      listRooms: jest.fn(),
      createRoom: jest.fn(),
      updateRoom: jest.fn().mockRejectedValue({
        statusCode: 404,
        code: "ROOM_NOT_FOUND",
        message: "not found",
      }),
    }));

    const route = require("../../src/middleware/roomRoutes");
    const app = mountRoute(route);

    const res = await request(app).put("/8").send({
      roomNumber: "A101",
      typeId: 1,
      status: "occupied",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe("ROOM_NOT_FOUND");
  });

  test("PUT /:id maps duplicate or invalid errors to their status code", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/roomService", () => ({
      listRooms: jest.fn(),
      createRoom: jest.fn(),
      updateRoom: jest.fn().mockRejectedValue({
        statusCode: 409,
        code: "ROOM_NUMBER_EXISTS",
        message: "duplicate",
      }),
    }));

    const route = require("../../src/middleware/roomRoutes");
    const app = mountRoute(route);

    const res = await request(app).put("/8").send({
      roomNumber: "A101",
      typeId: 1,
      status: "occupied",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe("ROOM_NUMBER_EXISTS");
  });
});

describe("roomTypeRoutes extra coverage", () => {
  test("POST / maps duplicate room type to 409", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/roomTypeService", () => ({
      createRoomType: jest.fn().mockRejectedValue({
        statusCode: 409,
        code: "ROOM_TYPE_EXISTS",
        message: "duplicate",
      }),
    }));

    const route = require("../../src/middleware/roomTypeRoutes");
    const app = mountRoute(route);

    const res = await request(app).post("/").send({
      typeName: "Deluxe",
      baseRent: 5000,
      waterUnitRate: 18,
      electricUnitRate: 7,
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe("ROOM_TYPE_EXISTS");
  });

  test("POST / returns 500 on unexpected error", async () => {
    jest.resetModules();
    mockAuthPass();
    jest.doMock("../../src/services/roomTypeService", () => ({
      createRoomType: jest.fn().mockRejectedValue(new Error("unexpected")),
    }));

    const route = require("../../src/middleware/roomTypeRoutes");
    const app = mountRoute(route);

    const res = await request(app).post("/").send({
      typeName: "Deluxe",
      baseRent: 5000,
      waterUnitRate: 18,
      electricUnitRate: 7,
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe("SERVER_ERROR");
  });
});

describe("meterReadingRoutes extra coverage", () => {
  test("POST / returns 500 when request body is invalid runtime", async () => {
    jest.resetModules();
    mockAuthPass();

    const route = require("../../src/middleware/meterReadingRoutes");
    const app = mountRoute(route, (req, res, next) => {
      if (req.method === "POST" && req.path === "/") {
        req.body = null;
      }
      next();
    });

    const res = await request(app).post("/").send({ any: "value" });

    expect(res.statusCode).toBe(500);
    expect(res.body.error.code).toBe("SERVER_ERROR");
  });
});
