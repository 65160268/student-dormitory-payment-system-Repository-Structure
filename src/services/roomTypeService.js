const pool = require("../db/pool");

class RoomTypeError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const roomTypeService = {
  async listRoomTypes() {
    const [rows] = await pool.query("SELECT * FROM room_types");
    return rows;
  },

  async createRoomType(data) {
    try {
      const [result] = await pool.query("INSERT INTO room_types SET ?", [data]);
      return {
        typeId: result.insertId,
        typeName: data.typeName,
        baseRent: data.baseRent,
        waterUnitRate: data.waterUnitRate,
        electricUnitRate: data.electricUnitRate,
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new RoomTypeError(409, "ROOM_TYPE_EXISTS", "Room type already exists");
      }
      throw error;
    }
  },
};

module.exports = roomTypeService;
