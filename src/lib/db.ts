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

  // SSL is required on Railway and any cloud PostgreSQL provider.
  // Enable automatically in production or when DATABASE_SSL=true.
  // rejectUnauthorized:false is safe here because Railway uses self-signed certs.
  const isProduction = process.env.NODE_ENV === "production";
  const sslExplicit = process.env.DATABASE_SSL;

  let ssl: boolean | { rejectUnauthorized: boolean } = false;
  if (sslExplicit === "true" || (isProduction && sslExplicit !== "false")) {
    ssl = { rejectUnauthorized: false };
  }

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl,
  });
}

export const db: Pool =
  process.env.NODE_ENV === "production"
    ? createPool()
    : (globalThis._pgPool ??= createPool());
