import "dotenv/config";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const MIGRATIONS_DIR = resolve(__dirname, "migrations");

const MIGRATION_FILES = [
  "001_initial_schema.sql",
  "002_spots_add_category_fields.sql",
];

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  console.log("🚀 Running migrations...");

  for (const file of MIGRATION_FILES) {
    const sql = readFileSync(resolve(MIGRATIONS_DIR, file), "utf-8");
    console.log(`  → ${file}`);
    await client.query(sql);
  }

  console.log("✅ Migrations complete.");
  await client.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
