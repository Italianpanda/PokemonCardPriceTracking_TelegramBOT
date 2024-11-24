import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function setupDatabase() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY,
      username TEXT,
      is_admin INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS wars (
      war_id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_spots INTEGER,
      price_per_spot REAL,
      prize TEXT,
      status TEXT DEFAULT 'open'
    );

    CREATE TABLE IF NOT EXISTS war_spots (
      war_id INTEGER,
      spot_number INTEGER,
      user_id INTEGER,
      paid INTEGER DEFAULT 0,
      FOREIGN KEY (war_id) REFERENCES wars(war_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS tracked_cards (
      card_id INTEGER PRIMARY KEY AUTOINCREMENT,
      set_name TEXT,
      card_name TEXT,
      last_price REAL,
      last_update TIMESTAMP
    );
  `);
}

export function getDb() {
  return db;
}