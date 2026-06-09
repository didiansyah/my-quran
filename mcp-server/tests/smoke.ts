/**
 * My-Quran v0.4.0 — Full Smoke Test (Phase 1-3)
 */

import { getDailyAyah, searchQuran, listSurahs, getSurah } from "../src/tools/quran.js";
import { getPrayerTimes, getQibla, getHijriDate } from "../src/tools/prayer.js";
import { getDua, listDuaCategories } from "../src/tools/dua.js";
import { askQuestion } from "../src/tools/question.js";
import { getQuote, listQuoteThemes } from "../src/tools/quotes.js";
import { calculateZakat, formatZakatResult } from "../src/tools/zakat.js";
import { getUserPrefs, setUserPref, formatUserPrefs } from "../src/tools/personalization.js";
import { findMosques, getImsakTimes } from "../src/tools/location.js";
import { getHajjGuide, getUmrahGuide, getTarawihInfo, getLaylatulQadrInfo, getRamadanDua } from "../src/tools/guides.js";

async function test(name: string, fn: () => Promise<string> | string) {
  try {
    const result = await fn();
    const short = typeof result === "string" ? result.replace(/\n/g, " ").slice(0, 200) : "";
    console.log(`✅ ${name}: ${short}...`);
  } catch (err: any) {
    console.log(`❌ ${name}: ${err.message}`);
  }
}

async function main() {
  console.log("=== My-Quran v0.4.0 — Phase 1-3 Smoke Test ===\n");

  // Phase 1-2 (existing)
  await test("F1: Daily Ayah", () => getDailyAyah("en"));
  await test("F5: Prayer Times (London)", () => getPrayerTimes("London", "UK"));
  await test("F6: Dua (anxiety)", () => getDua("anxiety", false, "en"));
  await test("F7: Preferences", () => formatUserPrefs(getUserPrefs("test")));
  await test("F8: Qibla (Makkah)", () => getQibla(21.4225, 39.8262));
  await test("F11: Zakat", () => {
    const i = { cash: 10000, goldGrams: 0, silverGrams: 0, tradeGoods: 0, goldPricePerGram: 65, silverPricePerGram: 0.85, currency: "USD" };
    return formatZakatResult(i, calculateZakat(i), "USD");
  });
  await test("F12: Quote (patience)", () => getQuote("patience", "en"));

  // Phase 3 — F13: Mosque Finder
  await test("F13: Mosques (Makkah)", () => findMosques(21.4225, 39.8262, 10000, 5));
  await test("F13: Mosques (London)", () => findMosques(51.5074, -0.1278, 5000, 5));

  // Phase 3 — F14: Hajj & Umrah
  await test("F14: Hajj overview", () => getHajjGuide(undefined, "en"));
  await test("F14: Hajj step 5 (Arafah)", () => getHajjGuide(5, "en"));
  await test("F14: Umrah overview", () => getUmrahGuide(undefined, "id"));
  await test("F14: Umrah step 2 (Talbiyah)", () => getUmrahGuide(2, "en"));

  // Phase 3 — F15: Ramadhan
  await test("F15: Imsak (Dubai)", () => getImsakTimes("Dubai", "UAE"));
  await test("F15: Tarawih info", () => getTarawihInfo("en"));
  await test("F15: Laylatul Qadr", () => getLaylatulQadrInfo("id"));
  await test("F15: Sahur dua", () => getRamadanDua("sahur", "en"));
  await test("F15: Iftar dua", () => getRamadanDua("iftar", "id"));

  console.log("\n=== Done ===");
}

main();
