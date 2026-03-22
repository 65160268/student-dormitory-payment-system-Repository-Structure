jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
}));

const pool = require("../../src/db/pool");
const roomService = require("../../src/services/roomService");

describe("roomService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listRooms returns rows from database", async () => {
    const rows = [{ room_id: 1, room_number: "A101" }];
    pool.query.mockResolvedValueOnce([rows]);

    const result = await roomService.listRooms();

    expect(result).toEqual(rows);
  });

  test("createRoom inserts and returns created room", async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 7 }]);

    const result = await roomService.createRoom({
      roomNumber: "B201",
      typeId: 2,
      status: "available",
    });

    expect(result).toEqual({
      roomId: 7,
      roomNumber: "B201",
      typeId: 2,
      status: "available",
    });
  });

  test("createRoom maps duplicate key to ROOM_NUMBER_EXISTS", async () => {
    pool.query.mockRejectedValueOnce({ code: "ER_DUP_ENTRY" });

    await expect(
      roomService.createRoom({ roomNumber: "A101", typeId: 1, status: "available" })
    ).rejects.toMatchObject({ statusCode: 409, code: "ROOM_NUMBER_EXISTS" });
  });

  test("createRoom maps invalid foreign key to INVALID_ROOM_TYPE", async () => {
    pool.query.mockRejectedValueOnce({ code: "ER_NO_REFERENCED_ROW_2" });

    await expect(
      roomService.createRoom({ roomNumber: "X999", typeId: 999, status: "available" })
    ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_ROOM_TYPE" });
  });

  test("updateRoom throws ROOM_NOT_FOUND when no rows affected", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    await expect(
      roomService.updateRoom(999, { roomNumber: "A999", typeId: 1, status: "available" })
    ).rejects.toMatchObject({ statusCode: 404, code: "ROOM_NOT_FOUND" });
  });

  test("updateRoom maps duplicate key to ROOM_NUMBER_EXISTS", async () => {
    pool.query.mockRejectedValueOnce({ code: "ER_DUP_ENTRY" });

    await expect(
      roomService.updateRoom(1, { roomNumber: "A101", typeId: 1, status: "occupied" })
    ).rejects.toMatchObject({ statusCode: 409, code: "ROOM_NUMBER_EXISTS" });
  });

  test("updateRoom succeeds and returns updated room", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await roomService.updateRoom(3, {
      roomNumber: "C301",
      typeId: 2,
      status: "maintenance",
    });

    expect(result).toEqual({
      roomId: 3,
      roomNumber: "C301",
      typeId: 2,
      status: "maintenance",
    });
  });
});
