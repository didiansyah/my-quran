/**
 * Quran tools: F1 (daily ayah), F2 (search), F3 (browse surah)
 */

import * as quranApi from "../services/alquran-cloud.js";
import * as cache from "../services/cache.js";
import { getEdition, SUPPORTED_LANGUAGES } from "../services/languages.js";

export async function getDailyAyah(language: string): Promise<string> {
  const ayah = await quranApi.getRandomAyah(language);

  return [
    `📖 *Daily Ayah*`,
    ``,
    `*${ayah.surahName} (${ayah.surahEnglishName}) — ${ayah.surahNumber}:${ayah.ayahNumber}*`,
    ``,
    `${ayah.arabic}`,
    ``,
    `> ${ayah.translation}`,
    ``,
    `_📌 ${language === "id" ? "Semoga bermanfaat. Jazakallahu khairan." : "May it benefit you. Jazakallahu khairan."}_`,
  ].join("\n");
}

export async function searchQuran(
  query: string,
  language: string,
  limit: number
): Promise<string> {
  // Check if it's a reference like "Al-Baqarah:255"
  const ref = quranApi.parseSurahRef(query);
  if (ref && ref.ayah) {
    const ayah = await quranApi.getAyah(ref.surah, ref.ayah, language);
    if (!ayah) return `❌ ${language === "id" ? "Ayat tidak ditemukan" : "Verse not found"}: ${query}`;
    return [
      `🔍 *${ayah.surahName} ${ayah.surahNumber}:${ayah.ayahNumber}*`,
      ``,
      ayah.arabic,
      ``,
      `> ${ayah.translation}`,
    ].join("\n");
  }

  if (ref) {
    const result = await quranApi.getSurah(ref.surah, 0, 10, language);
    return [
      `📖 *${result.surah.name} (${result.surah.englishName})* — ${result.total} ${language === "id" ? "ayat" : "verses"}`,
      ``,
      ...result.ayahs.map((a) => [
        `*${a.ayahNumber}.* ${a.arabic}`,
        `> ${a.translation}`,
        ``,
      ]).flat(),
      result.total > 10 ? `_${language === "id" ? `Menampilkan 10 dari ${result.total} ayat. Gunakan \`get_surah\` untuk navigasi.` : `Showing 10 of ${result.total} verses. Use \`get_surah\` to navigate.`}_` : "",
    ].join("\n");
  }

  // Keyword search
  const cacheKey = `${query}:${language}:${limit}`;
  const cached = cache.getCachedSearch(cacheKey, language);
  if (cached) return cached;

  const results = await quranApi.searchQuran(query, language, limit);

  if (results.length === 0) {
    return `❌ ${language === "id" ? `Tidak ditemukan ayat yang cocok dengan` : `No verses matching`} "${query}". ${language === "id" ? "Coba kata kunci lain." : "Try different keywords."}`;
  }

  const output = [
    `🔍 *${language === "id" ? "Hasil pencarian" : "Search results"}: "${query}"* — ${results.length} ${language === "id" ? "ayat ditemukan" : "verses found"}`,
    ``,
    ...results.map((a) => [
      `📖 *${a.surahName} ${a.surahNumber}:${a.ayahNumber}*`,
      a.arabic,
      `> ${a.translation}`,
      ``,
    ]).flat(),
  ].join("\n");

  cache.setCachedSearch(cacheKey, language, output);
  return output;
}

export async function listSurahs(language: string): Promise<string> {
  const surahs = await quranApi.listSurahs(language);

  const lines = [`📚 ${language === "id" ? "114 Surah dalam Al-Quran" : "114 Surahs of the Quran"}`, ``];

  for (const s of surahs) {
    const name = language === "id" ? s.name : s.englishName;
    const revelation = s.revelationType === "Meccan" ? "Makkiyah" : "Madaniyah";
    lines.push(`${s.number}. *${name}* — ${s.numberOfAyahs} ${language === "id" ? "ayat" : "verses"} · ${revelation}`);
  }

  return lines.join("\n");
}

export async function getSurah(
  surah: string,
  offset: number,
  limit: number,
  language: string
): Promise<string> {
  const ref = quranApi.parseSurahRef(surah);
  if (!ref) {
    return `❌ ${language === "id" ? `Surah tidak valid` : `Invalid surah`}: "${surah}". ${language === "id" ? "Gunakan nomor (1-114) atau nama surah (contoh: \"Al-Baqarah\")." : "Use number (1-114) or surah name (e.g. \"Al-Baqarah\")."}`;
  }

  const result = await quranApi.getSurah(ref.surah, offset, Math.min(limit, 10), language);

  const header = [
    `📖 *${result.surah.name} (${result.surah.englishName})*`,
    `📄 ${result.total} ${language === "id" ? "ayat" : "verses"} · ${result.surah.revelationType === "Meccan" ? "Makkiyah" : "Madaniyah"}`,
    `📍 ${language === "id" ? "Ayat" : "Verses"} ${offset + 1}-${Math.min(offset + limit, result.total)} ${language === "id" ? "dari" : "of"} ${result.total}`,
    ``,
  ].join("\n");

  const verses = result.ayahs.map((a) => [
    `*${a.ayahNumber}.* ${a.arabic}`,
    `> ${a.translation}`,
    ``,
  ]).flat();

  return [header, ...verses].join("\n");
}
