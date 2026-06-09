/**
 * SQLite cache for frequently accessed Quran data.
 * Mitigates API instability by caching surahs and search results.
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "..", "data", "quran-cache.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS surah_cache (
        surah_number INTEGER PRIMARY KEY,
        language TEXT NOT NULL,
        data TEXT NOT NULL,
        cached_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS ayah_cache (
        surah_number INTEGER NOT NULL,
        ayah_number INTEGER NOT NULL,
        language TEXT NOT NULL,
        data TEXT NOT NULL,
        cached_at INTEGER NOT NULL,
        PRIMARY KEY (surah_number, ayah_number, language)
      );
      CREATE TABLE IF NOT EXISTS search_cache (
        query TEXT NOT NULL,
        language TEXT NOT NULL,
        data TEXT NOT NULL,
        cached_at INTEGER NOT NULL,
        PRIMARY KEY (query, language)
      );
    `);
  }
  return db;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function getCachedSurah(surahNumber: number, language: string): string | null {
  const row = getDb()
    .prepare("SELECT data, cached_at FROM surah_cache WHERE surah_number = ? AND language = ?")
    .get(surahNumber, language) as { data: string; cached_at: number } | undefined;

  if (row && Date.now() - row.cached_at < CACHE_TTL) return row.data;
  return null;
}

export function setCachedSurah(surahNumber: number, language: string, data: string): void {
  getDb()
    .prepare(
      "INSERT OR REPLACE INTO surah_cache (surah_number, language, data, cached_at) VALUES (?, ?, ?, ?)"
    )
    .run(surahNumber, language, data, Date.now());
}

export function getCachedSearch(query: string, language: string): string | null {
  const row = getDb()
    .prepare("SELECT data, cached_at FROM search_cache WHERE query = ? AND language = ?")
    .get(query, language) as { data: string; cached_at: number } | undefined;

  if (row && Date.now() - row.cached_at < CACHE_TTL) return row.data;
  return null;
}

export function setCachedSearch(query: string, language: string, data: string): void {
  getDb()
    .prepare(
      "INSERT OR REPLACE INTO search_cache (query, language, data, cached_at) VALUES (?, ?, ?, ?)"
    )
    .run(query, language, data, Date.now());
}

export function closeCache(): void {
  if (db) {
    db.close();
    db = null;
  }
}
