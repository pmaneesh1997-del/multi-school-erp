import "server-only";

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@/lib/db/schema";

const globalForMysql = globalThis as typeof globalThis & {
  mysqlPool?: mysql.Pool;
};

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and configure MySQL.");
  }

  const pool = globalForMysql.mysqlPool ?? mysql.createPool(databaseUrl);
  if (process.env.NODE_ENV !== "production") globalForMysql.mysqlPool = pool;

  return drizzle(pool, { schema, mode: "default" });
}
