import { createClient } from '@libsql/client';

// Turso database credentials
// These should be set as Vercel environment variables:
// - TURSO_DATABASE_URL: libsql://rootvi-annabelly22.aws-eu-west-1.turso.io
// - TURSO_AUTH_TOKEN: (your auth token)

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Check for missing credentials
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.warn('Warning: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables not set');
}

// Initialize tables if they don't exist
export async function initTables() {
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
    await db.execute(sql);
  }
}

export default db;
