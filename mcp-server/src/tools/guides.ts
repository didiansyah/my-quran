/**
 * Guide tools: F14 Hajj & Umrah, F15 Ramadhan
 */

import hajjData from "../data/hajj-guide.json" with { type: "json" };
import umrahData from "../data/umrah-guide.json" with { type: "json" };
import ramadanData from "../data/ramadan.json" with { type: "json" };

interface GuideStep {
  step: number;
  title_en: string;
  title_id: string;
  description_en: string;
  description_id: string;
  dua_arabic: string;
  dua_transliteration: string;
  dua_translation_en: string;
  dua_translation_id: string;
}

const hajjSteps = hajjData as GuideStep[];
const umrahSteps = umrahData as GuideStep[];

export async function getHajjGuide(step?: number, language = "en"): Promise<string> {
  if (step !== undefined) {
    const s = hajjSteps.find((s) => s.step === step);
    if (!s) return `❌ Step ${step} not found. Hajj has ${hajjSteps.length} steps (1-${hajjSteps.length}).`;
    return formatStep(s, language, "Hajj");
  }

  const title = language === "id" ? "Panduan Hajj" : "Hajj Guide";
  const lines = [
    `🕋 *${title}* — ${hajjSteps.length} Steps`,
    ``,
    ...hajjSteps.map((s) => {
      const t = language === "id" ? s.title_id : s.title_en;
      const d = language === "id" ? s.description_id : s.description_en;
      const preview = d.length > 120 ? d.slice(0, 120) + "..." : d;
      return `*${s.step}.* ${t}\n   ${preview}`;
    }),
    ``,
    `_Use \`hajj_guide\` with a step number for full details + duas._`,
  ];
  return lines.join("\n");
}

export async function getUmrahGuide(step?: number, language = "en"): Promise<string> {
  if (step !== undefined) {
    const s = umrahSteps.find((s) => s.step === step);
    if (!s) return `❌ Step ${step} not found. Umrah has ${umrahSteps.length} steps (1-${umrahSteps.length}).`;
    return formatStep(s, language, "Umrah");
  }

  const title = language === "id" ? "Panduan Umrah" : "Umrah Guide";
  const lines = [
    `🕋 *${title}* — ${umrahSteps.length} Steps`,
    ``,
    ...umrahSteps.map((s) => {
      const t = language === "id" ? s.title_id : s.title_en;
      const d = language === "id" ? s.description_id : s.description_en;
      const preview = d.length > 120 ? d.slice(0, 120) + "..." : d;
      return `*${s.step}.* ${t}\n   ${preview}`;
    }),
    ``,
    `_Use \`umrah_guide\` with a step number for full details + duas._`,
  ];
  return lines.join("\n");
}

export async function getTarawihInfo(language = "en"): Promise<string> {
  const t = ramadanData.tarawih as any;
  const title = language === "id" ? t.title_id : t.title_en;
  const desc = language === "id" ? t.description_id : t.description_en;
  const tips = language === "id" ? t.tips_id : t.tips_en;

  return [
    `🌙 *${title}*`,
    ``,
    desc,
    ``,
    `📿 Rak'ahs: ${t.rakahs}`,
    `🕐 Time: ${t.timing}`,
    ``,
    `💡 Tips:`,
    ...tips.map((tip: string) => `• ${tip}`),
  ].join("\n");
}

export async function getLaylatulQadrInfo(language = "en"): Promise<string> {
  const l = ramadanData.laylatul_qadr as any;
  const title = language === "id" ? l.title_id : l.title_en;
  const desc = language === "id" ? l.description_id : l.description_en;
  const duaRec = language === "id" ? l.dua_recommended_id : l.dua_recommended_en;
  const signs = language === "id" ? l.signs_id : l.signs_en;

  return [
    `🌟 *${title}*`,
    ``,
    desc,
    ``,
    `🤲 *Recommended Dua:*`,
    l.dua_recommended_arabic,
    `_${l.dua_recommended_transliteration}_`,
    duaRec,
    ``,
    `🔍 *Signs:*`,
    ...signs.map((s: string) => `• ${s}`),
  ].join("\n");
}

export async function getRamadanDua(type: "sahur" | "iftar", language = "en"): Promise<string> {
  const key = type === "sahur" ? "imsak" : "iftar";
  const data = ramadanData[key as keyof typeof ramadanData] as any;

  const title = language === "id" ? data.title_id : data.title_en;
  const desc = language === "id" ? data.description_id : data.description_en;
  const duaAr = type === "sahur" ? data.dua_sahur_arabic : data.dua_iftar_arabic;
  const duaTr = type === "sahur" ? data.dua_sahur_transliteration : data.dua_iftar_transliteration;
  const duaEnId = type === "sahur"
    ? (language === "id" ? data.dua_sahur_id : data.dua_sahur_en)
    : (language === "id" ? data.dua_iftar_id : data.dua_iftar_en);

  return [
    `🌙 *${title}*`,
    ``,
    desc,
    ``,
    `🤲 *Dua:*`,
    duaAr,
    `_${duaTr}_`,
    duaEnId,
  ].join("\n");
}

function formatStep(s: GuideStep, language: string, guide: string): string {
  const title = language === "id" ? s.title_id : s.title_en;
  const desc = language === "id" ? s.description_id : s.description_en;
  const label = language === "id" ? "Panduan" : "Guide";

  const lines = [
    `🕋 *${label} ${guide} — Step ${s.step}: ${title}*`,
    ``,
    desc,
  ];

  if (s.dua_arabic) {
    const duaTrans = language === "id" ? s.dua_translation_id : s.dua_translation_en;
    lines.push(
      ``,
      `🤲 *Dua:*`,
      s.dua_arabic,
      s.dua_transliteration ? `_${s.dua_transliteration}_` : "",
      duaTrans
    );
  }

  return lines.filter(Boolean).join("\n");
}
