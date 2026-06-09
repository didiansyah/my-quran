/**
 * Personalization tool: F7
 *
 * Stores user preferences in SQLite:
 * - Language preference
 * - City for prayer times
 * - Last read surah/ayah
 * - Reading streak
 * - Daily ayah time preference
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "..", "data", "user-prefs.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS prefs (
        user_id TEXT PRIMARY KEY,
        language TEXT DEFAULT 'en',
        city TEXT,
        country TEXT,
        last_read_surah INTEGER,
        last_read_ayah INTEGER,
        reading_streak INTEGER DEFAULT 0,
        last_active_date TEXT,
        daily_ayah_time TEXT DEFAULT '07:00',
        preferred_method INTEGER DEFAULT 2,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }
  return db;
}

export interface UserPrefs {
  language: string;
  city?: string;
  country?: string;
  lastReadSurah?: number;
  lastReadAyah?: number;
  readingStreak: number;
  dailyAyahTime: string;
  preferredMethod: number;
}

export function getUserPrefs(userId: string): UserPrefs {
  const row = getDb()
    .prepare("SELECT * FROM prefs WHERE user_id = ?")
    .get(userId) as any;

  if (!row) {
    return {
      language: "en",
      readingStreak: 0,
      dailyAyahTime: "07:00",
      preferredMethod: 2,
    };
  }

  // Update streak if active today
  const today = new Date().toISOString().split("T")[0];
  if (row.last_active_date !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const newStreak = row.last_active_date === yesterday ? row.reading_streak + 1 : 1;
    getDb()
      .prepare("UPDATE prefs SET reading_streak = ?, last_active_date = ? WHERE user_id = ?")
      .run(newStreak, today, userId);
    row.reading_streak = newStreak;
  }

  return {
    language: row.language || "en",
    city: row.city || undefined,
    country: row.country || undefined,
    lastReadSurah: row.last_read_surah || undefined,
    lastReadAyah: row.last_read_ayah || undefined,
    readingStreak: row.reading_streak || 0,
    dailyAyahTime: row.daily_ayah_time || "07:00",
    preferredMethod: row.preferred_method || 2,
  };
}

export function setUserPref(userId: string, key: string, value: string | number): void {
  const validKeys = [
    "language", "city", "country", "last_read_surah", "last_read_ayah",
    "daily_ayah_time", "preferred_method",
  ];

  if (!validKeys.includes(key)) {
    throw new Error(`Invalid preference key: ${key}. Valid: ${validKeys.join(", ")}`);
  }

  getDb()
    .prepare(`
      INSERT INTO prefs (user_id, ${key}, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET ${key} = excluded.${key}, updated_at = datetime('now')
    `)
    .run(userId, value);
}

export function formatUserPrefs(prefs: UserPrefs): string {
  const parts: string[] = [
    `⚙️ *Your Preferences*`,
    ``,
    `🌐 Language: *${prefs.language}*`,
    prefs.city ? `🕌 City: *${prefs.city}${prefs.country ? `, ${prefs.country}` : ""}*` : `🕌 City: _not set_`,
    `📖 Reading Streak: *${prefs.readingStreak} day${prefs.readingStreak !== 1 ? "s" : ""}*`,
    `⏰ Daily Ayah Time: *${prefs.dailyAyahTime}*`,
  ];

  if (prefs.lastReadSurah) {
    parts.push(`📍 Last Read: Surah ${prefs.lastReadSurah}${prefs.lastReadAyah ? `:${prefs.lastReadAyah}` : ""}`);
  }

  parts.push(``, `_Use \`set_preference\` to update._`);
  return parts.join("\n");
}
