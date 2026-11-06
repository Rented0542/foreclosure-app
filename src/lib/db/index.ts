import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import * as schema from "./schema";

const url = process.env.DATABASE_URL || "";
let db: any;
let sqliteDb: Database.Database | null = null;

if (url.startsWith("postgres")) {
  // Postgres path: lazy import to avoid requiring pg when not used
  const { Pool } = require("pg");
  const { drizzle } = require("drizzle-orm/node-postgres");
  const pool = new Pool({ connectionString: url });
  db = drizzle(pool, { schema });
} else {
  const file = process.env.SQLITE_FILE || join(process.cwd(), "data", "app.db");
  mkdirSync(dirname(file), { recursive: true });
  sqliteDb = new Database(file);
  sqliteDb.pragma("journal_mode = WAL");
  db = drizzleSqlite(sqliteDb, { schema });
}

export { db, schema, sqliteDb };

export function initDb() {
  // create tables if not exist (sqlite)
  if (sqliteDb) {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member', team_id TEXT, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS properties (id TEXT PRIMARY KEY, source TEXT NOT NULL, external_id TEXT, address TEXT NOT NULL, city TEXT, state TEXT, zip TEXT, price REAL, beds REAL, baths REAL, sqft REAL, type TEXT, status TEXT, auction_date TEXT, url TEXT, raw TEXT, review_status TEXT NOT NULL DEFAULT 'unreviewed', reviewed_by TEXT, notes TEXT, first_seen INTEGER NOT NULL, last_seen INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS prospects (id TEXT PRIMARY KEY, name TEXT NOT NULL, handle TEXT, contact_channel TEXT, contact_value TEXT, source TEXT NOT NULL, intent_summary TEXT, budget_min REAL, budget_max REAL, target_cities TEXT, consent_status TEXT NOT NULL DEFAULT 'unknown', consent_at INTEGER, do_not_contact INTEGER NOT NULL DEFAULT 0, notes TEXT, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS matches (id TEXT PRIMARY KEY, property_id TEXT NOT NULL, prospect_id TEXT NOT NULL, score REAL NOT NULL, reasons TEXT, status TEXT NOT NULL DEFAULT 'suggested', created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS outreach (id TEXT PRIMARY KEY, prospect_id TEXT NOT NULL, channel TEXT NOT NULL, message TEXT NOT NULL, sent_at INTEGER, provider_msg_id TEXT, delivery_status TEXT, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS scans (id TEXT PRIMARY KEY, source TEXT NOT NULL, started_at INTEGER NOT NULL, finished_at INTEGER, items_found INTEGER NOT NULL DEFAULT 0, items_new INTEGER NOT NULL DEFAULT 0, error TEXT);
      CREATE TABLE IF NOT EXISTS audit_log (id TEXT PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, entity TEXT, metadata TEXT, created_at INTEGER NOT NULL);
    `);
  }
}