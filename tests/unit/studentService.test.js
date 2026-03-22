jest.mock("../../src/db/pool", () => ({
  query: jest.fn(),
}));

const pool = require("../../src/db/pool");
const studentService = require("../../src/services/studentService");

describe("studentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listStudents returns rows", async () => {
    const rows = [{ student_id: 1, full_name: "Niran S." }];
    pool.query.mockResolvedValueOnce([rows]);

    const result = await studentService.listStudents();

    expect(result).toEqual(rows);
  });

  test("createStudent throws INVALID_USER when user not found", async () => {
    pool.query.mockResolvedValueOnce([[]]);

    await expect(
      studentService.createStudent({ userId: 99, roomId: 1, fullName: "Test User", phone: "0800000000" })
    ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_USER" });
  });

  test("createStudent throws INVALID_ROOM when room not found", async () => {
    pool.query.mockResolvedValueOnce([[{ user_id: 1 }]]);
    pool.query.mockResolvedValueOnce([[]]);

    await expect(
      studentService.createStudent({ userId: 1, roomId: 99, fullName: "Test User", phone: "0800000000" })
    ).rejects.toMatchObject({ statusCode: 400, code: "INVALID_ROOM" });
  });

  test("createStudent throws STUDENT_ALREADY_ASSIGNED", async () => {
    pool.query.mockResolvedValueOnce([[{ user_id: 1 }]]);
    pool.query.mockResolvedValueOnce([[{ room_id: 1 }]]);
    pool.query.mockResolvedValueOnce([[{ student_id: 10 }]]);

    await expect(
      studentService.createStudent({ userId: 1, roomId: 1, fullName: "Test User", phone: "0800000000" })
    ).rejects.toMatchObject({ statusCode: 409, code: "STUDENT_ALREADY_ASSIGNED" });
  });

  test("createStudent throws ROOM_ALREADY_ASSIGNED", async () => {
    pool.query.mockResolvedValueOnce([[{ user_id: 1 }]]);
    pool.query.mockResolvedValueOnce([[{ room_id: 1 }]]);
    pool.query.mockResolvedValueOnce([[]]);
    pool.query.mockResolvedValueOnce([[{ student_id: 11 }]]);

    await expect(
      studentService.createStudent({ userId: 1, roomId: 1, fullName: "Test User", phone: "0800000000" })
    ).rejects.toMatchObject({ statusCode: 409, code: "ROOM_ALREADY_ASSIGNED" });
  });

  test("createStudent inserts and updates room status", async () => {
    pool.query.mockResolvedValueOnce([[{ user_id: 1 }]]);
    pool.query.mockResolvedValueOnce([[{ room_id: 1 }]]);
    pool.query.mockResolvedValueOnce([[]]);
    pool.query.mockResolvedValueOnce([[]]);
    pool.query.mockResolvedValueOnce([{ insertId: 20 }]);
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await studentService.createStudent({
      userId: 1,
      roomId: 1,
      fullName: "Niran S.",
      phone: "0812345678",
    });

    expect(result).toEqual({
      studentId: 20,
      userId: 1,
      roomId: 1,
      fullName: "Niran S.",
      phone: "0812345678",
    });
    expect(pool.query).toHaveBeenLastCalledWith("UPDATE rooms SET status = 'occupied' WHERE room_id = ?", [1]);
  });
});
