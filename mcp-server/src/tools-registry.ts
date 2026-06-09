/**
 * Tool Registry — shared between stdio and HTTP transports.
 * All 22 tools registered once.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { getDailyAyah, searchQuran, listSurahs, getSurah } from "./tools/quran.js";
import { getPrayerTimes, getQibla, getHijriDate } from "./tools/prayer.js";
import { getDua, listDuaCategories } from "./tools/dua.js";
import { askQuestion } from "./tools/question.js";
import { getQuote, listQuoteThemes } from "./tools/quotes.js";
import { calculateZakat, formatZakatResult } from "./tools/zakat.js";
import { getUserPrefs, setUserPref, formatUserPrefs } from "./tools/personalization.js";
import { findMosques, getImsakTimes } from "./tools/location.js";
import { getHajjGuide, getUmrahGuide, getTarawihInfo, getLaylatulQadrInfo, getRamadanDua } from "./tools/guides.js";
import { getEdition, SUPPORTED_LANGUAGES } from "./services/languages.js";
import * as quranApi from "./services/alquran-cloud.js";

export function registerAllTools(server: McpServer): void {
  // F1
  server.tool("get_daily_ayah", "Get a random daily Quran verse with Arabic text and translation. 35+ languages.", {
    language: z.string().default("en").describe(`Language code. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`),
    reciter: z.string().optional().describe("Audio reciter code (e.g. 'ar.alafasy'). Omit for text-only."),
  }, async ({ language, reciter }) => {
    const ayah = await quranApi.getRandomAyah(language);
    let text = [`📖 *Daily Ayah*`, ``, `*${ayah.surahName} (${ayah.surahEnglishName}) — ${ayah.surahNumber}:${ayah.ayahNumber}*`, ``, ayah.arabic, ``, `> ${ayah.translation}`];
    if (reciter) text.push(``, `🔊 [Listen](https://cdn.alquran.cloud/media/audio/ayah/${reciter}/${ayah.surahNumber}_${ayah.ayahNumber}.mp3)`);
    text.push(``, `_📌 May it benefit you. Jazakallahu khairan._`);
    return { content: [{ type: "text", text: text.join("\n") }] };
  });

  // F2
  server.tool("search_quran", "Search Quran by keyword, surah name, or reference (e.g. 'Al-Baqarah:255').", {
    query: z.string().describe("Search term or reference"),
    language: z.string().default("en").describe("Translation language"),
    limit: z.number().min(1).max(10).default(5),
  }, async ({ query, language, limit }) => {
    const result = await searchQuran(query, language, limit);
    return { content: [{ type: "text", text: result }] };
  });

  // F3
  server.tool("list_surahs", "List all 114 surahs.", {
    language: z.string().default("en"),
  }, async ({ language }) => ({ content: [{ type: "text", text: await listSurahs(language) }] }));

  server.tool("get_surah", "Read a surah verse by verse with pagination.", {
    surah: z.string().describe("Surah number (1-114) or name"),
    offset: z.number().min(0).default(0),
    limit: z.number().min(1).max(10).default(10),
    language: z.string().default("en"),
  }, async ({ surah, offset, limit, language }) => {
    const result = await getSurah(surah, offset, limit, language);
    return { content: [{ type: "text", text: result }] };
  });

  // F4
  server.tool("ask_question", "Ask an Islamic question — Quran-grounded answers.", {
    question: z.string().describe("Your question"),
    language: z.string().default("en"),
  }, async ({ question, language }) => ({ content: [{ type: "text", text: await askQuestion(question, language) }] }));

  // F5
  server.tool("get_prayer_times", "Prayer times for any city worldwide or GPS coordinates.", {
    city: z.string().optional(), country: z.string().optional(),
    lat: z.number().min(-90).max(90).optional(), lng: z.number().min(-180).max(180).optional(),
    date: z.string().optional(), method: z.number().min(0).max(23).optional(),
  }, async (args) => {
    const result = await getPrayerTimes(args.city, args.country, args.lat, args.lng, args.date, args.method);
    return { content: [{ type: "text", text: result }] };
  });

  // F6
  server.tool("get_dua", "Get duas by category.", {
    category: z.enum(["morning","evening","travel","eating","sleep","protection","forgiveness","anxiety","sickness","rain","mosque","new_moon","parents","success"]).optional(),
    random: z.boolean().default(true), language: z.string().default("en"),
  }, async ({ category, random, language }) => ({ content: [{ type: "text", text: await getDua(category, random, language) }] }));

  server.tool("list_dua_categories", "List dua categories.", {
    language: z.string().default("en"),
  }, async ({ language }) => ({ content: [{ type: "text", text: await listDuaCategories(language) }] }));

  // F7
  server.tool("get_preferences", "Get your saved preferences.", {
    user_id: z.string(),
  }, async ({ user_id }) => ({ content: [{ type: "text", text: formatUserPrefs(getUserPrefs(user_id)) }] }));

  server.tool("set_preference", "Save a preference.", {
    user_id: z.string(),
    key: z.enum(["language","city","country","daily_ayah_time","preferred_method"]),
    value: z.string(),
  }, async ({ user_id, key, value }) => {
    setUserPref(user_id, key, key === "preferred_method" ? parseInt(value) : value);
    return { content: [{ type: "text", text: `✅ *${key}* → *${value}*\n\n${formatUserPrefs(getUserPrefs(user_id))}` }] };
  });

  // F8
  server.tool("get_qibla", "Qibla direction from GPS.", {
    lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
  }, async ({ lat, lng }) => ({ content: [{ type: "text", text: await getQibla(lat, lng) }] }));

  // F9
  server.tool("get_99names", "99 Names of Allah.", {
    language: z.string().default("en"),
  }, async ({ language }) => {
    const names = await import("./data/99names.json", { with: { type: "json" } });
    const data = names.default as any[];
    const out = data.map(n => `${n.number}. *${n.arabic}* — ${n.transliteration}\n   _${language === "id" ? n.translation_id : n.translation_en}_`).join("\n\n");
    return { content: [{ type: "text", text: `📿 *99 Names of Allah*\n\n${out}` }] };
  });

  // F10
  server.tool("get_hijri_date", "Today's Hijri date.", {}, async () => ({ content: [{ type: "text", text: await getHijriDate() }] }));

  // F11
  server.tool("calculate_zakat", "Zakat calculator — any currency.", {
    cash: z.number().min(0), gold_grams: z.number().min(0).default(0), silver_grams: z.number().min(0).default(0),
    trade_goods: z.number().min(0).default(0), gold_price_per_gram: z.number().min(0), silver_price_per_gram: z.number().min(0).default(0),
    currency: z.string().default("USD"),
  }, async (args) => {
    const input = { cash: args.cash, goldGrams: args.gold_grams, silverGrams: args.silver_grams, tradeGoods: args.trade_goods, goldPricePerGram: args.gold_price_per_gram, silverPricePerGram: args.silver_price_per_gram, currency: args.currency };
    return { content: [{ type: "text", text: formatZakatResult(input, calculateZakat(input), args.currency) }] };
  });

  // F12
  server.tool("get_quote", "Inspirational Quran/Hadith quote.", {
    theme: z.string().optional(), language: z.string().default("en"),
  }, async ({ theme, language }) => ({ content: [{ type: "text", text: await getQuote(theme, language) }] }));

  server.tool("list_quote_themes", "Quote themes.", {
    language: z.string().default("en"),
  }, async ({ language }) => ({ content: [{ type: "text", text: await listQuoteThemes(language) }] }));

  // F13
  server.tool("find_mosques", "Find nearby mosques worldwide via OpenStreetMap.", {
    lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
    radius: z.number().min(500).max(50000).default(5000), limit: z.number().min(1).max(20).default(10),
  }, async ({ lat, lng, radius, limit }) => ({ content: [{ type: "text", text: await findMosques(lat, lng, radius, limit) }] }));

  // F14
  server.tool("hajj_guide", "Step-by-step Hajj guide (10 steps).", {
    step: z.number().min(1).max(10).optional(), language: z.string().default("en"),
  }, async ({ step, language }) => ({ content: [{ type: "text", text: await getHajjGuide(step, language) }] }));

  server.tool("umrah_guide", "Step-by-step Umrah guide (6 steps).", {
    step: z.number().min(1).max(6).optional(), language: z.string().default("en"),
  }, async ({ step, language }) => ({ content: [{ type: "text", text: await getUmrahGuide(step, language) }] }));

  // F15
  server.tool("get_imsak_times", "Imsak & Fajr times for Ramadan.", {
    city: z.string(), country: z.string().optional(),
  }, async ({ city, country }) => ({ content: [{ type: "text", text: await getImsakTimes(city, country) }] }));

  server.tool("tarawih_info", "Tarawih prayer guide.", {
    language: z.string().default("en"),
  }, async ({ language }) => ({ content: [{ type: "text", text: await getTarawihInfo(language) }] }));

  server.tool("laylatul_qadr_info", "Laylatul Qadr info + recommended dua.", {
    language: z.string().default("en"),
  }, async ({ language }) => ({ content: [{ type: "text", text: await getLaylatulQadrInfo(language) }] }));

  server.tool("ramadan_dua", "Sahur or Iftar dua.", {
    type: z.enum(["sahur","iftar"]), language: z.string().default("en"),
  }, async ({ type, language }) => ({ content: [{ type: "text", text: await getRamadanDua(type, language) }] }));

  // Audio
  server.tool("get_ayah_audio", "Audio recitation URL for an ayah.", {
    surah: z.number().min(1).max(114), ayah: z.number().min(1), reciter: z.string().default("ar.alafasy"),
  }, async ({ surah, ayah, reciter }) => ({
    content: [{ type: "text", text: `🔊 *Ayah Audio*\n\n📖 Surah ${surah}, Ayah ${ayah}\n🎙️ ${reciter}\n\n[Listen](https://cdn.alquran.cloud/media/audio/ayah/${reciter}/${surah}_${ayah}.mp3)` }],
  }));
}
