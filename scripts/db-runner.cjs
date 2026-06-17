const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const ROOT_DIR = path.resolve(__dirname, "..");
const TRACKING_TABLE = "schema_migrations";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function createPool() {
  loadEnvFile(path.join(ROOT_DIR, ".env.local"));
  loadEnvFile(path.join(ROOT_DIR, ".env"));

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  return new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
  });
}

function getFiles(kind) {
  const config =
    kind === "migrate"
      ? {
          dir: path.join(ROOT_DIR, "database", "migrations"),
          prefix: "V",
          label: "migration",
        }
      : {
          dir: path.join(ROOT_DIR, "database", "seeds"),
          prefix: "S",
          label: "seed",
        };

  const pattern = new RegExp(
    `^(${config.prefix}\\d{3})__(.+)\\.sql$`,
    "i"
  );

  return fs
    .readdirSync(config.dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const match = entry.name.match(pattern);
      if (!match) {
        return null;
      }

      return {
        version: match[1].toUpperCase(),
        description: match[2].replace(/_/g, " "),
        fileName: entry.name,
        filePath: path.join(config.dir, entry.name),
        label: config.label,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.version.localeCompare(b.version));
}

async function trackingTableExists(client) {
  const result = await client.query(
    `SELECT to_regclass('public.${TRACKING_TABLE}') AS table_name`
  );

  return Boolean(result.rows[0]?.table_name);
}

async function getExecutedVersions(client) {
  const exists = await trackingTableExists(client);
  if (!exists) {
    return new Set();
  }

  const result = await client.query(
    `SELECT version FROM ${TRACKING_TABLE} ORDER BY version`
  );

  return new Set(result.rows.map((row) => row.version));
}

async function recordExecution(client, file) {
  await client.query(
    `INSERT INTO ${TRACKING_TABLE} (version, description)
     VALUES ($1, $2)
     ON CONFLICT (version) DO NOTHING`,
    [file.version, file.description]
  );
}

async function executeFile(client, file) {
  const sql = fs.readFileSync(file.filePath, "utf8");
  const startedAt = Date.now();

  console.log(`-> Running ${file.version} ${file.description}`);
  await client.query("BEGIN");

  try {
    await client.query(sql);
    await recordExecution(client, file);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  }

  console.log(
    `   Applied ${file.fileName} in ${Date.now() - startedAt}ms`
  );
}

async function run(kind) {
  const files = getFiles(kind);

  if (files.length === 0) {
    throw new Error(`No ${kind === "migrate" ? "migration" : "seed"} files found.`);
  }

  const pool = createPool();
  const client = await pool.connect();

  try {
    console.log(`Foundry database ${kind} started`);
    console.log(`Directory: ${path.relative(ROOT_DIR, path.dirname(files[0].filePath))}`);

    if (kind === "seed" && !(await trackingTableExists(client))) {
      throw new Error(
        "schema_migrations table does not exist. Run npm run migrate before npm run seed."
      );
    }

    const executed = await getExecutedVersions(client);
    let applied = 0;
    let skipped = 0;

    for (const file of files) {
      if (executed.has(file.version)) {
        console.log(`-> Skipping ${file.version} ${file.description}`);
        skipped += 1;
        continue;
      }

      await executeFile(client, file);
      executed.add(file.version);
      applied += 1;
    }

    console.log(
      `Foundry database ${kind} complete: ${applied} applied, ${skipped} skipped.`
    );
  } finally {
    client.release();
    await pool.end();
  }
}

const command = process.argv[2];

if (!["migrate", "seed"].includes(command)) {
  console.error("Usage: node scripts/db-runner.cjs <migrate|seed>");
  process.exit(1);
}

run(command).catch((error) => {
  console.error(`Foundry database ${command} failed.`);
  console.error(error.message);

  if (error.position) {
    console.error(`SQL position: ${error.position}`);
  }

  if (error.code) {
    console.error(`PostgreSQL code: ${error.code}`);
  }

  process.exit(1);
});
