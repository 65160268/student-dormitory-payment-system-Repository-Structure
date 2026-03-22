jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
}));

const pool = require("../../src/db/pool");
const invoiceService = require("../../src/services/invoiceService");

describe("invoiceService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listInvoices returns rows", async () => {
    const rows = [{ invoice_id: 1, invoice_no: "INV-202603-0001" }];
    pool.query.mockResolvedValueOnce([rows]);

    const result = await invoiceService.listInvoices();

    expect(result).toEqual(rows);
  });

  test("createInvoice throws ROOM_NOT_FOUND when room does not exist", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    await expect(invoiceService.createInvoice({ roomId: 99, dueDate: "2026-04-01" })).rejects.toMatchObject({
      statusCode: 404,
      code: "ROOM_NOT_FOUND",
    });
  });

  test("createInvoice throws METER_READING_NOT_FOUND when no meter data", async () => {
    pool.query.mockResolvedValueOnce([
      [{ room_id: 1, base_rent: 3500, water_unit_rate: 18, electric_unit_rate: 7 }],
    ]);
    pool.query.mockResolvedValueOnce([[]]);

    await expect(invoiceService.createInvoice({ roomId: 1, dueDate: "2026-04-01" })).rejects.toMatchObject({
      statusCode: 400,
      code: "METER_READING_NOT_FOUND",
    });
  });

  test("createInvoice throws INVALID_METER_DATA for negative usage", async () => {
    pool.query.mockResolvedValueOnce([
      [{ room_id: 1, base_rent: 3500, water_unit_rate: 18, electric_unit_rate: 7 }],
    ]);
    pool.query.mockResolvedValueOnce([
      [{ prev_water: 20, curr_water: 10, prev_electric: 100, curr_electric: 90 }],
    ]);

    await expect(invoiceService.createInvoice({ roomId: 1, dueDate: "2026-04-01" })).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_METER_DATA",
    });
  });

  test("createInvoice calculates totals and returns invoice", async () => {
    pool.query.mockResolvedValueOnce([
      [
        {
          room_id: 1,
          room_number: "A101",
          base_rent: 3500,
          water_unit_rate: 18,
          electric_unit_rate: 7,
        },
      ],
    ]);
    pool.query.mockResolvedValueOnce([
      [{ prev_water: 50, curr_water: 58, prev_electric: 120, curr_electric: 132 }],
    ]);
    pool.query.mockResolvedValueOnce([{ insertId: 1001 }]);

    const result = await invoiceService.createInvoice({ roomId: 1, dueDate: "2026-04-01" });

    expect(result.invoiceId).toBe(1001);
    expect(result.totalRent).toBe(3500);
    expect(result.totalWater).toBe(144);
    expect(result.totalElectric).toBe(84);
    expect(result.grandTotal).toBe(3728);
    expect(result.status).toBe("pending");
  });

  test("createInvoice retries invoice number on duplicate key", async () => {
    pool.query.mockResolvedValueOnce([
      [{ room_id: 1, base_rent: 3500, water_unit_rate: 18, electric_unit_rate: 7 }],
    ]);
    pool.query.mockResolvedValueOnce([
      [{ prev_water: 50, curr_water: 55, prev_electric: 100, curr_electric: 105 }],
    ]);
    pool.query.mockRejectedValueOnce({ code: "ER_DUP_ENTRY" });
    pool.query.mockResolvedValueOnce([{ insertId: 2002 }]);

    const result = await invoiceService.createInvoice({ roomId: 1, dueDate: "2026-04-15" });

    expect(result.invoiceId).toBe(2002);
    expect(pool.query).toHaveBeenCalledTimes(4);
  });
});
