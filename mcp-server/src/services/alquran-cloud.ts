/**
 * Al-Quran Cloud API client
 * Docs: https://alquran.cloud/api
 * Base URL: https://api.alquran.cloud/v1
 *
 * Provides Quran text, translations (ID/EN), and tafsir.
 * Free, no API key required.
 */

import { getEdition, SUPPORTED_LANGUAGES } from "./languages.js";

const BASE_URL = "https://api.alquran.cloud/v1";

export interface Ayah {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
  };
  numberInSurah: number;
  juz: number;
  page: number;
}

export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

export interface AyahResult {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahNumber: number;
  arabic: string;
  translation: string;
  tafsir?: string;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 3600 * 1000; // 1 hour

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) return cached.data;
  return null;
}

function setToCache(key: string, data: any) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

async function fetchJson<T>(url: string): Promise<T> {
  const cached = getFromCache<T>(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Al-Quran API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  setToCache(url, data.data);
  return data.data as T;
}

export async function getSurah(surahNumber: number, offset = 0, limit = 10, language = "id"): Promise<{
  surah: SurahInfo;
  ayahs: AyahResult[];
  total: number;
}> {
  const edition = getEdition(language);
  const cacheKey = `surah-${surahNumber}-${edition}`;
  
  interface SurahResponse {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: Array<{ number: number; text: string; numberInSurah: number; juz: number; page: number }>;
  }

  // Combined fetch to avoid double-fetching full text sequentially or redundantly
  const fullSurah = await fetchJson<SurahResponse>(`${BASE_URL}/surah/${surahNumber}/editions/quran-uthmani,${edition}`);
  
  // Data from Al-Quran Cloud 'editions' endpoint comes as an array of editions
  const editionsData = fullSurah as unknown as any[];
  const arabicEdition = editionsData.find(e => e.edition.type === "quran");
  const translationEdition = editionsData.find(e => e.edition.type === "translation");

  const surah: SurahInfo = {
    number: arabicEdition.number,
    name: arabicEdition.name,
    englishName: arabicEdition.englishName,
    englishNameTranslation: arabicEdition.englishNameTranslation,
    revelationType: arabicEdition.revelationType,
    numberOfAyahs: arabicEdition.numberOfAyahs,
  };

  const allAyahs = arabicEdition.ayahs;
  const total = allAyahs.length;
  const paginated = allAyahs.slice(offset, offset + limit);
  const translations = translationEdition.ayahs;

  const ayahs: AyahResult[] = paginated.map((a: any, index: number) => ({
    surahNumber: surah.number,
    surahName: surah.name,
    surahEnglishName: surah.englishName,
    ayahNumber: a.numberInSurah,
    arabic: a.text,
    translation: translations[offset + index]?.text || "",
  }));

  return { surah, ayahs, total };
}

export async function listSurahs(language = "id"): Promise<SurahInfo[]> {
  return fetchJson<SurahInfo[]>(`${BASE_URL}/surah`);
}

export async function searchQuran(
  query: string,
  language = "id",
  limit = 5
): Promise<AyahResult[]> {
  const edition = getEdition(language);
  const url = `${BASE_URL}/search/${encodeURIComponent(query)}/${edition}/all`;

  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Al-Quran API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const payload = data.data as {
    count: number;
    matches: Array<{
      surah: SurahInfo;
      ayah: Ayah;
      text: string;
    }>;
  };

  return payload.matches.slice(0, limit).map((m) => ({
    surahNumber: m.surah.number,
    surahName: m.surah.name,
    surahEnglishName: m.surah.englishName,
    ayahNumber: m.ayah.numberInSurah,
    arabic: m.ayah.text,
    translation: m.text,
  }));
}

export async function getAyah(
  surahNumber: number,
  ayahNumber: number,
  language = "id"
): Promise<AyahResult | null> {
  const edition = getEdition(language);

  // Optimized parallel fetch
  const [arabicData, translationData] = await Promise.all([
    fetchJson<Ayah>(`${BASE_URL}/ayah/${surahNumber}:${ayahNumber}`),
    fetchJson<{ text: string }>(`${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/${edition}`),
  ]);

  return {
    surahNumber: arabicData.surah.number,
    surahName: arabicData.surah.name,
    surahEnglishName: arabicData.surah.englishName,
    ayahNumber: arabicData.numberInSurah,
    arabic: arabicData.text,
    translation: translationData.text,
  };
}

export async function getRandomAyah(language = "id"): Promise<AyahResult> {
  const edition = getEdition(language);

  const arabicData = await fetchJson<Ayah>(`${BASE_URL}/ayah/random`);
  const translationData = await fetchJson<{ text: string }>(
    `${BASE_URL}/ayah/${arabicData.surah.number}:${arabicData.numberInSurah}/${edition}`
  );

  return {
    surahNumber: arabicData.surah.number,
    surahName: arabicData.surah.name,
    surahEnglishName: arabicData.surah.englishName,
    ayahNumber: arabicData.numberInSurah,
    arabic: arabicData.text,
    translation: translationData.text,
  };
}

const SURAH_NAMES: Record<string, number> = {
  "al-fatihah": 1, "al-baqarah": 2, "ali-imran": 3, "an-nisa": 4, "al-maidah": 5,
  "al-anam": 6, "al-araf": 7, "al-anfal": 8, "at-taubah": 9, "yunus": 10,
  "hud": 11, "yusuf": 12, "ar-rad": 13, "ibrahim": 14, "al-hijr": 15,
  "an-nahl": 16, "al-isra": 17, "al-kahf": 18, "maryam": 19, "taha": 20,
  "al-anbiya": 21, "al-hajj": 22, "al-muminun": 23, "an-nur": 24, "al-furqan": 25,
  "asy-syuara": 26, "an-naml": 27, "al-qasas": 28, "al-ankabut": 29, "ar-rum": 30,
  "luqman": 31, "as-sajdah": 32, "al-ahzab": 33, "saba": 34, "fatir": 35,
  "yasin": 36, "as-saffat": 37, "sad": 38, "az-zumar": 39, "gafir": 40,
  "fussilat": 41, "asy-syura": 42, "az-zukhruf": 43, "ad-dukhan": 44, "al-jasiyah": 45,
  "al-ahqaf": 46, "muhammad": 47, "al-fath": 48, "al-hujurat": 49, "qaf": 50,
  "az-zariyat": 51, "at-tur": 52, "an-najm": 53, "al-qamar": 54, "ar-rahman": 55,
  "al-waqiah": 56, "al-hadid": 57, "al-mujadilah": 58, "al-hasyr": 59, "al-mumtahanah": 60,
  "as-saff": 61, "al-jumuah": 62, "al-munafiqun": 63, "at-tagabun": 64, "at-talaq": 65,
  "at-tahrim": 66, "al-mulk": 67, "al-qalam": 68, "al-haqqah": 69, "al-maarij": 70,
  "nuh": 71, "al-jinn": 72, "al-muzzammil": 73, "al-muddassir": 74, "al-qiyamah": 75,
  "al-insan": 76, "al-mursalat": 77, "an-naba": 78, "an-naziat": 79, "abasa": 80,
  "at-takwir": 81, "al-infitar": 82, "al-mutaffifin": 83, "al-insyiqaq": 84, "al-buruj": 85,
  "at-tariq": 86, "al-ala": 87, "al-gasyiyah": 88, "al-fajr": 89, "al-balad": 90,
  "asy-syams": 91, "al-lail": 92, "ad-duha": 93, "asy-syarh": 94, "at-tin": 95,
  "al-alaq": 96, "al-qadr": 97, "al-bayyinah": 98, "az-zalzalah": 99, "al-adiyat": 100,
  "al-qariah": 101, "at-takasur": 102, "al-asr": 103, "al-humazah": 104, "al-fil": 105,
  "quraisy": 106, "al-maun": 107, "al-kausar": 108, "al-kafirun": 109, "an-nasr": 110,
  "al-lahab": 111, "al-ikhlas": 112, "al-falaq": 113, "an-nas": 114,
};

// Fuzzy matching for surah names
function findSurahFuzzy(query: string): number | null {
  const norm = query.toLowerCase().replace(/[^a-z]/g, "");
  
  // Exact or normalized match
  if (SURAH_NAMES[norm]) return SURAH_NAMES[norm];
  
  // Basic fuzzy logic: check if name starts with or contains query, 
  // or handle common variants like 'baqoroh' vs 'baqarah'
  const entries = Object.entries(SURAH_NAMES);
  
  const substitutions: Record<string, string> = { 'o': 'a', 'u': 'a', 'q': 'k', 'sh': 'sy' };
  const fuzzyNorm = (s: string) => s.split('').map(c => substitutions[c] || c).join('');
  const target = fuzzyNorm(norm);

  for (const [name, num] of entries) {
    const cleanName = name.replace(/[^a-z]/g, "");
    if (cleanName.includes(norm) || norm.includes(cleanName)) return num;
    if (fuzzyNorm(cleanName).includes(target)) return num;
  }

  return null;
}

export function parseSurahRef(query: string): { surah: number; ayah?: number } | null {
  const trimmed = query.trim();

  const colonMatch = trimmed.match(/^(.+?):(\d+)$/i);
  if (colonMatch) {
    const nameOrNum = colonMatch[1].trim();
    const ayah = parseInt(colonMatch[2]);
    const surahNum = parseInt(nameOrNum);
    if (!isNaN(surahNum) && surahNum >= 1 && surahNum <= 114) {
      return { surah: surahNum, ayah };
    }
    const num = findSurahFuzzy(nameOrNum);
    if (num) return { surah: num, ayah };
    return null;
  }

  const numOnly = parseInt(trimmed);
  if (!isNaN(numOnly) && numOnly >= 1 && numOnly <= 114) {
    return { surah: numOnly };
  }

  const num = findSurahFuzzy(trimmed);
  if (num) return { surah: num };

  return null;
}
