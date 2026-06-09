/**
 * Language → Al-Quran Cloud edition mapping.
 * Maps user-friendly language codes to the best available translation edition.
 *
 * API provides 124 editions: https://api.alquran.cloud/v1/edition
 */

const EDITION_MAP: Record<string, string> = {
  en: "en.sahih",
  id: "id.indonesian",
  fr: "fr.hamidullah",
  de: "de.bubenheim",
  es: "es.cortes",
  tr: "tr.diyanet",
  ur: "ur.jalandhry",
  ru: "ru.kuliev",
  zh: "zh.jian",
  bn: "bn.bengali",
  fa: "fa.fooladvand",
  ja: "ja.japanese",
  ko: "ko.korean",
  pt: "pt.elhayek",
  nl: "nl.keyzer",
  it: "it.piccardo",
  ro: "ro.grigore",
  sv: "sv.bernstrom",
  no: "no.berg",
  pl: "pl.bielawskiego",
  az: "az.musayev",
  cs: "cs.hrbek",
  dv: "dv.divehi",
  ha: "ha.gumi",
  hi: "hi.hindi",
  ku: "ku.asan",
  ml: "ml.abdulhameed",
  sq: "sq.ahmeti",
  so: "so.abduh",
  sw: "sw.barwani",
  tg: "tg.ayubi",
  th: "th.thai",
  tt: "tt.nugman",
  ug: "ug.saleh",
  uz: "uz.sodik",
  // Arabic tafsir (not translation, but useful)
  ar: "ar.jalalayn",
};

/** Get the API edition for a language code. Falls back to en.sahih. */
export function getEdition(lang: string): string {
  const key = lang.toLowerCase().split("-")[0]; // "en-US" → "en"
  return EDITION_MAP[key] || "en.sahih";
}

/** List of supported language codes */
export const SUPPORTED_LANGUAGES = Object.keys(EDITION_MAP).sort();
