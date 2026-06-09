/**
 * Inspirational Quotes tool: F12
 * Quran quotes + Hadith by theme or random.
 */

import quotesData from "../data/quotes.json" with { type: "json" };

interface Quote {
  theme: string;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_id: string;
  source: string;
  type: "quran" | "hadith";
}

const quotes = quotesData as Quote[];
const themes = [...new Set(quotes.map((q) => q.theme))];

export async function getQuote(theme?: string, language = "en"): Promise<string> {
  let pool = quotes;

  if (theme) {
    pool = quotes.filter((q) => q.theme === theme);
    if (pool.length === 0) {
      return `❌ ${language === "id" ? `Tema tidak ditemukan` : `Theme not found`}: "${theme}". ${language === "id" ? "Tema tersedia" : "Available themes"}: ${themes.join(", ")}`;
    }
  }

  const quote = pool[Math.floor(Math.random() * pool.length)];
  const translation = language === "id" ? quote.translation_id : quote.translation_en;
  const typeLabel = quote.type === "quran" ? "Quran" : "Hadith";

  return [
    `💬 *${language === "id" ? "Kutipan Inspiratif" : "Inspirational Quote"}${theme ? ` — ${theme}` : ""}*`,
    ``,
    quote.arabic,
    ``,
    `_**${quote.transliteration}**_`,
    ``,
    translation,
    ``,
    `📚 _${typeLabel}: ${quote.source}_`,
  ].join("\n");
}

export async function listQuoteThemes(language = "en"): Promise<string> {
  return [
    `🏷️ *${language === "id" ? "Tema Kutipan" : "Quote Themes"}*`,
    ``,
    ...themes.map((t) => `• *${t}* (${quotes.filter((q) => q.theme === t).length})`),
  ].join("\n");
}
