// =============================================================================
// DATABASE CLIENT — PostgreSQL pool (server-side only)
// =============================================================================
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }
  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
  });
}

export const db: Pool =
  process.env.NODE_ENV === "production"
    ? createPool()
    : (globalThis._pgPool ??= createPool());
