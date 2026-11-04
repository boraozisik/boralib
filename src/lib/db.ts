import "server-only";
import { createClient, type Client, type InValue } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

// Where the data lives:
// - TURSO_DATABASE_URL set   -> the hosted Turso database (used on Netlify, and
//                               locally if you want to work on the real data).
// - TURSO_DATABASE_URL unset -> a local file at data/library.db (for experiments).
function createDbClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) {
    return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  if (process.env.NETLIFY) {
    throw new Error("TURSO_DATABASE_URL is not set. Add it in Netlify's environment variables.");
  }
  const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return createClient({ url: `file:${path.join(/*turbopackIgnore: true*/ dir, "library.db")}` });
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS books (
     id               INTEGER PRIMARY KEY AUTOINCREMENT,
     title            TEXT NOT NULL,
     author           TEXT NOT NULL,
     genre            TEXT NOT NULL DEFAULT '',
     status           TEXT NOT NULL DEFAULT 'to-read',
     cover            TEXT,
     notes            TEXT NOT NULL DEFAULT '',
     notes_updated_at TEXT,
     created_at       TEXT NOT NULL DEFAULT (datetime('now')),
     updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  // Cover images are stored in the database (resized in the browser first),
  // so no separate file storage is needed.
  `CREATE TABLE IF NOT EXISTS covers (
     id         TEXT PRIMARY KEY,
     mime       TEXT NOT NULL,
     data       BLOB NOT NULL,
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
];

// Reuse one client (and one schema check) per server process / dev hot reload.
const globalForDb = globalThis as unknown as {
  __libraryDb?: { client: Client; ready: Promise<unknown> };
};

function getDb() {
  if (!globalForDb.__libraryDb) {
    const client = createDbClient();
    const ready = client.batch(SCHEMA, "write");
    // Don't cache a failed setup; retry on the next request.
    ready.catch(() => (globalForDb.__libraryDb = undefined));
    globalForDb.__libraryDb = { client, ready };
  }
  return globalForDb.__libraryDb;
}

export async function db() {
  const { client, ready } = getDb();
  await ready;
  return client;
}

/** Runs a query and returns the rows as plain objects. */
export async function query<T>(sql: string, args: InValue[] | Record<string, InValue> = []) {
  const rs = await (await db()).execute({ sql, args });
  return rs.rows.map((row) => ({ ...row }) as T);
}

export async function run(sql: string, args: InValue[] | Record<string, InValue> = []) {
  return (await db()).execute({ sql, args });
}
