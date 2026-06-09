/**
 * Daily duas tool: F6
 * Returns original Arabic + translations. Language selects display language.
 */

import duasData from "../data/duas.json" with { type: "json" };
import duasExtra from "../data/duas-extra.json" with { type: "json" };

interface Dua {
  category: string;
  arabic: string;
  transliteration: string;
  translation_id: string;
  translation_en: string;
  source: string;
}

const duas: Dua[] = [...(duasData as Dua[]), ...(duasExtra as Dua[])];
const categories = [...new Set(duas.map((d) => d.category))];

export async function getDua(
  category?: string,
  random = true,
  language = "en"
): Promise<string> {
  let pool = duas;

  if (category) {
    pool = duas.filter((d) => d.category === category);
    if (pool.length === 0) {
      return `❌ ${language === "id" ? `Kategori doa tidak ditemukan` : `Dua category not found`}: "${category}". ${language === "id" ? "Kategori tersedia" : "Available categories"}: ${categories.join(", ")}`;
    }
  }

  const dua = random ? pool[Math.floor(Math.random() * pool.length)] : pool[0];
  const translation = language === "id" ? dua.translation_id : dua.translation_en;

  return [
    `🤲 *${language === "id" ? "Doa Harian" : "Daily Dua"}${category ? ` — ${category}` : ""}*`,
    ``,
    dua.arabic,
    ``,
    `_**${dua.transliteration}**_`,
    ``,
    translation,
    ``,
    `📚 _${language === "id" ? "Sumber" : "Source"}: ${dua.source}_`,
  ].join("\n");
}

export async function listDuaCategories(language = "en"): Promise<string> {
  return [
    `📋 *${language === "id" ? "Kategori Doa Harian" : "Daily Dua Categories"}*`,
    ``,
    ...categories.map(
      (c) => {
        const count = duas.filter((d) => d.category === c).length;
        return `• *${c}* — ${count} ${language === "id" ? "doa" : "duas"}`;
      }
    ),
  ].join("\n");
}
