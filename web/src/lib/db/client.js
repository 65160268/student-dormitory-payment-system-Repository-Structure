import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const globalDb = globalThis;

if (!globalDb.__dormDbState) {
  globalDb.__dormDbState = {
    dbInstance: null,
    poolInstance: null,
  };
}

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

  if (!globalDb.__dormDbState.dbInstance) {
    globalDb.__dormDbState.poolInstance = mysql.createPool({
      uri: getDatabaseUrl(),
      waitForConnections: true,
      connectionLimit: 5,
      maxIdle: 5,
      idleTimeout: 60000,
      queueLimit: 0,
    });

    globalDb.__dormDbState.dbInstance = drizzle(globalDb.__dormDbState.poolInstance);
  }

  return globalDb.__dormDbState.dbInstance;
}

export function getDbRuntimeInfo() {
  const pool = globalDb.__dormDbState.poolInstance;

  return {
    configured: isDatabaseConfigured(),
    hasPool: Boolean(pool),
    hasDbInstance: Boolean(globalDb.__dormDbState.dbInstance),
    allConnections: pool?._allConnections?.length ?? null,
    freeConnections: pool?._freeConnections?.length ?? null,
    queueSize: pool?._connectionQueue?.length ?? null,
  };
}
