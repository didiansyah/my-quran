/**
 * Islamic Q&A tool: F4
 *
 * Uses the Quran text as grounding for Islamic questions.
 * Multi-language keyword extraction for global users.
 */

import * as quranApi from "../services/alquran-cloud.js";

export async function askQuestion(
  question: string,
  language: string
): Promise<string> {
  const keywords = extractKeywords(question, language);
  if (keywords.length === 0) {
    if (language === "id") {
      return `🤔 Silakan ajukan pertanyaan yang lebih spesifik tentang Islam, Quran, atau topik keislaman.`;
    }
    return `🤔 Please ask a more specific question about Islam, the Quran, or Islamic topics.`;
  }

  const results = await quranApi.searchQuran(keywords.join(" "), language, 5);

  if (results.length === 0) {
    const msg = language === "id"
      ? `Tidak ditemukan ayat yang relevan. Coba ajukan pertanyaan dengan kata kunci yang berbeda.`
      : `No relevant verses found. Try asking with different keywords.`;
    return [
      `🔍 *${language === "id" ? "Pencarian untuk" : "Search for"}: "${question}"*`,
      ``,
      msg,
    ].join("\n");
  }

  return [
    `🔍 *${language === "id" ? "Ayat terkait" : "Related verses"}: "${question}"*`,
    ``,
    ...results.map((a) => [
      `📖 *${a.surahName} ${a.surahNumber}:${a.ayahNumber}*`,
      a.arabic,
      `> ${a.translation}`,
      ``,
    ]).flat(),
    `💡 _${language === "id" ? "Gunakan ayat-ayat di atas sebagai referensi. Untuk tanya lebih lanjut, sebutkan nomor surah dan ayat." : "Use the verses above as reference. For follow-up questions, mention the surah and verse number."}_`,
  ].join("\n");
}

function extractKeywords(question: string, language: string): string[] {
  const lowered = question.toLowerCase();

  // Multi-language Quranic keyword map — maps to actual Quran terms
  const keywordMap: Record<string, string[]> = {
    patience: ["sabar", "patient", "patience", "sabr", "geduld", "paciencia", "pazienza"],
    prayer: ["sholat", "prayer", "salat", "sembahyang", "gebet", "prière", "oración", "preghiera", "namaz"],
    fasting: ["puasa", "fasting", "sawm", "ramadhan", "ramadan", "jeûne", "ayuno", "ramazan"],
    charity: ["zakat", "charity", "sedekah", "alms", "caridad", "carità", "sadaqah"],
    pilgrimage: ["haji", "hajj", "umrah", "umroh", "pilgrimage", "pèlerinage"],
    supplication: ["doa", "dua", "supplication", "bittgebet", "invocation", "preghiera"],
    paradise: ["surga", "paradise", "heaven", "jannah", "paradis", "paraíso", "paradiso"],
    hell: ["neraka", "hell", "jahannam", "enfer", "hölle", "inferno"],
    mother: ["ibu", "mother", "orang tua", "parent", "mère", "mutter", "madre", "genitori"],
    knowledge: ["ilmu", "knowledge", "belajar", "savoir", "wissen", "conocimiento", "conoscenza"],
    sustenance: ["rezeki", "sustenance", "rizq", "provision", "rizki"],
    repentance: ["taubat", "repent", "ampun", "forgive", "pardon", "perdono", "perdón"],
    marriage: ["nikah", "marriage", "menikah", "mariage", "heirat", "matrimonio"],
    modesty: ["jilbab", "hijab", "aurat", "modesty", "voile", "pudore", "velo"],
    halal: ["halal", "haram", "lawful", "unlawful", "permis", "interdit", "lícito"],
    character: ["akhlak", "moral", "character", "ethics", "éthique", "ética"],
    sincerity: ["ikhlas", "sincere", "sincerity", "sincérité", "sinceridad"],
    trust: ["tawakal", "tawakkal", "trust in god", "reliance", "confiance"],
    gratitude: ["syukur", "grateful", "gratitude", "dankbarkeit", "gratitudine"],
    death: ["mati", "death", "kematian", "wafat", "tod", "mort", "muerte", "morte"],
    judgment: ["kiamat", "judgment day", "akhir", "resurrection", "apocalisse"],
    prophet: ["nabi", "prophet", "rasul", "muhammad", "messenger", "prophète", "profeta"],
    mercy: ["rahmat", "mercy", "rahman", "raheem", "miséricorde", "misericordia"],
    justice: ["adil", "justice", "keadilan", "gerechtigkeit", "justicia", "giustizia"],
    love: ["cinta", "love", "kasih", "amour", "amor", "amore", "liebe"],
    anger: ["marah", "anger", "murka", "colère", "rabbia", "ira", "zorn"],
    fear: ["takut", "fear", "khawf", "peur", "miedo", "paura", "angst"],
    peace: ["damai", "peace", "salam", "paix", "paz", "pace", "frieden"],
    unity: ["persatuan", "unity", "ukhuwah", "brotherhood", "unité", "unidad"],
  };

  // Check for multi-word Quranic phrases first
  const phrases: [RegExp, string][] = [
    [/\bno compulsion in religion\b/, "no compulsion in religion"],
    [/\btidak ada paksaan dalam agama\b/, "paksaan agama"],
    [/\bthe truth has come\b/, "truth"],
    [/\bkill(ing)? (the|a) (soul|person)\b/, "killing"],
    [/\bmembunuh (jiwa|orang)\b/, "membunuh"],
    [/\bdo not despair\b/, "despair"],
    [/\bjangan (berputus asa|putus asa)\b/, "putus asa"],
    [/\bAllah does not burden\b/, "burden"],
    [/\bAllah tidak membebani\b/, "beban"],
  ];

  for (const [regex, keyword] of phrases) {
    if (regex.test(lowered)) {
      return [keyword];
    }
  }

  // Check keyword map
  const matched: string[] = [];
  for (const [key, terms] of Object.entries(keywordMap)) {
    for (const term of terms) {
      if (lowered.includes(term)) {
        matched.push(key);
        break;
      }
    }
  }

  if (matched.length > 0) return matched.slice(0, 3);

  // Fallback: extract 3 most significant words (4+ chars, skip stop words)
  const stopWords = new Set([
    "what", "how", "why", "who", "when", "where", "is", "the", "a", "an", "in", "of", "to",
    "was", "were", "are", "do", "does", "did", "will", "can", "could", "should", "would",
    "about", "with", "from", "this", "that", "does", "say", "tell", "mean",
    "apa", "bagaimana", "kenapa", "mengapa", "siapa", "kapan", "dimana",
    "apakah", "yang", "dan", "itu", "ini", "dalam", "untuk", "dari", "tentang", "pada",
    "le", "la", "les", "des", "de", "du", "un", "une", "der", "die", "das", "den",
    "che", "cosa", "come", "quando", "dove", "perché", "chi",
    "qué", "cómo", "cuándo", "dónde", "por qué", "quién",
  ]);

  const words = lowered.split(/\s+/).filter((w) => w.length > 3 && !stopWords.has(w));
  return words.slice(0, 3);
}
