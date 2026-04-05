const pool = require("../db/pool");

class StudentError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const studentService = {
  async listStudents() {
    const [rows] = await pool.query("SELECT * FROM students");
    return rows;
  },

  async createStudent(data) {
    // Check if user exists
    const [userRows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      data.userId,
    ]);
    if (userRows.length === 0) {
      throw new StudentError(400, "INVALID_USER", "User not found");
    }

    // Check if room exists
    const [roomRows] = await pool.query("SELECT * FROM rooms WHERE room_id = ?", [
      data.roomId,
    ]);
    if (roomRows.length === 0) {
      throw new StudentError(400, "INVALID_ROOM", "Room not found");
    }

    // Check if student is already assigned
    const [existingStudentRows] = await pool.query(
      "SELECT * FROM students WHERE user_id = ?",
      [data.userId]
    );
    if (existingStudentRows.length > 0) {
      throw new StudentError(409, "STUDENT_ALREADY_ASSIGNED", "Student already assigned");
    }

    // Check if room is already assigned
    const [occupiedRoomRows] = await pool.query(
      "SELECT * FROM students WHERE room_id = ?",
      [data.roomId]
    );
    if (occupiedRoomRows.length > 0) {
      throw new StudentError(409, "ROOM_ALREADY_ASSIGNED", "Room already assigned");
    }

    // Create student
    const [result] = await pool.query("INSERT INTO students SET ?", [
      {
        user_id: data.userId,
        room_id: data.roomId,
        full_name: data.fullName,
        phone: data.phone,
      },
    ]);

    // Update room status
    await pool.query("UPDATE rooms SET status = 'occupied' WHERE room_id = ?", [
      data.roomId,
    ]);

    return {
      studentId: result.insertId,
      userId: data.userId,
      roomId: data.roomId,
      fullName: data.fullName,
      phone: data.phone,
    };
  },
};

module.exports = studentService;
