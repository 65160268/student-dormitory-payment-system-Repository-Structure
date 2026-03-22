jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
}));

const pool = require("../../src/db/pool");
const roomTypeService = require("../../src/services/roomTypeService");

describe("roomTypeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listRoomTypes returns rows", async () => {
    const rows = [{ type_id: 1, type_name: "Standard" }];
    pool.query.mockResolvedValueOnce([rows]);

    const result = await roomTypeService.listRoomTypes();

    expect(result).toEqual(rows);
  });

  test("createRoomType inserts and returns created room type", async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 12 }]);

    const result = await roomTypeService.createRoomType({
      typeName: "Suite",
      baseRent: 6500,
      waterUnitRate: 20,
      electricUnitRate: 8,
    });

    expect(result).toEqual({
      typeId: 12,
      typeName: "Suite",
      baseRent: 6500,
      waterUnitRate: 20,
      electricUnitRate: 8,
    });
  });

  test("createRoomType maps duplicate entry to ROOM_TYPE_EXISTS", async () => {
    pool.query.mockRejectedValueOnce({ code: "ER_DUP_ENTRY" });

    await expect(
      roomTypeService.createRoomType({
        typeName: "Standard",
        baseRent: 3500,
        waterUnitRate: 18,
        electricUnitRate: 7,
      })
    ).rejects.toMatchObject({ statusCode: 409, code: "ROOM_TYPE_EXISTS" });
  });
});
