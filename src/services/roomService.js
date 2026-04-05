const pool = require("../db/pool");

class RoomError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const roomService = {
  async listRooms() {
    const [rows] = await pool.query("SELECT * FROM rooms");
    return rows;
  },

  async createRoom(data) {
    try {
      const [result] = await pool.query("INSERT INTO rooms SET ?", [
        {
          room_number: data.roomNumber,
          type_id: data.typeId,
          status: data.status,
        },
      ]);
      return {
        roomId: result.insertId,
        roomNumber: data.roomNumber,
        typeId: data.typeId,
        status: data.status,
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new RoomError(409, "ROOM_NUMBER_EXISTS", "Room number already exists");
      }
      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        throw new RoomError(400, "INVALID_ROOM_TYPE", "Invalid room type");
      }
      throw error;
    }
  },

  async updateRoom(roomId, data) {
    try {
      const [result] = await pool.query("UPDATE rooms SET ? WHERE room_id = ?", [
        {
          room_number: data.roomNumber,
          type_id: data.typeId,
          status: data.status,
        },
        roomId,
      ]);

      if (result.affectedRows === 0) {
        throw new RoomError(404, "ROOM_NOT_FOUND", "Room not found");
      }

      return {
        roomId,
        roomNumber: data.roomNumber,
        typeId: data.typeId,
        status: data.status,
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new RoomError(409, "ROOM_NUMBER_EXISTS", "Room number already exists");
      }
      throw error;
    }
  },
};

module.exports = roomService;
