import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

let dbInstance = null;
let poolInstance = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.MYSQL_URL || "";
}

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl());
}

export function getDb() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!dbInstance) {
    poolInstance = mysql.createPool({
      uri: getDatabaseUrl(),
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
    });

    dbInstance = drizzle(poolInstance);
  }

  return dbInstance;
}
