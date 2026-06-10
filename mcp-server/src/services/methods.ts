/**
 * Al-Adhan Calculation Methods Mapping
 * Docs: https://aladhan.com/calculation-methods
 */

export const CALCULATION_METHODS: Record<string, number> = {
  "karachi": 1,
  "isna": 2,
  "mwl": 3,
  "makkah": 4,
  "egypt": 5,
  "tehran": 7,
  "gulf": 10,
  "singapore": 11,
  "muis": 11,
  "france": 12,
  "turkey": 13,
  "russia": 14,
  "moonsighting": 15,
  "dubai": 16,
  "kuwait": 17,
  "qatar": 18,
  "jordan": 19,
  "kemenag": 20,
  "indonesia": 20,
};

export const COUNTRY_DEFAULT_METHODS: Record<string, number> = {
  "indonesia": 20,
  "singapore": 11,
  "brunei": 11,
  "malaysia": 11, // JAKIM often matches MUIS or method 3 with adjustments, 11 is common in the region
  "turkey": 13,
  "egypt": 5,
  "kuwait": 17,
  "qatar": 18,
  "jordan": 19,
  "uae": 16,
  "russia": 14,
  "france": 12,
  "usa": 2,
  "canada": 2,
  "uk": 3,
};

/**
 * Resolves a method ID from a string or number, with country-based fallback.
 */
export function resolveMethod(method?: string | number, country?: string): number {
  if (typeof method === "number") return method;
  
  if (typeof method === "string") {
    const slug = method.toLowerCase().trim();
    if (CALCULATION_METHODS[slug]) return CALCULATION_METHODS[slug];
    const parsed = parseInt(slug);
    if (!isNaN(parsed)) return parsed;
  }

  if (country) {
    const slug = country.toLowerCase().trim();
    if (COUNTRY_DEFAULT_METHODS[slug]) return COUNTRY_DEFAULT_METHODS[slug];
  }

  return 2; // Default to ISNA
}
