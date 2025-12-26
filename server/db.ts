import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@shared/schema';

const sqlite = new Database('hospital.db');
export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
export async function initializeDatabase() {
  // Create tables manually since we're not using migrations for this simple setup
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS medical_item_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BDT',
      description TEXT,
      is_outpatient INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('outpatient', 'inpatient')),
      session_id TEXT NOT NULL,
      bill_data TEXT NOT NULL,
      days_admitted INTEGER DEFAULT 1,
      total REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BDT',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  console.log('SQLite database initialized successfully');
}

export { sqlite };