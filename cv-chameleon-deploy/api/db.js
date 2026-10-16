import { createClient } from '@libsql/client';

// Lazy-initialized database client
let db = null;

function getDb() {
  if (!db) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    }
    db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return db;
}

// Initialize tables if they don't exist
export async function initTables() {
  const client = getDb();
  const statements = [
    `CREATE TABLE IF NOT EXISTS cv_resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      resume_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS cv_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      timestamp TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS cv_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    )`
  ];

  for (const sql of statements) {
    await client.execute(sql);
  }
}

export default { execute: (...args) => getDb().execute(...args) };
