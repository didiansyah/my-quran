/**
 * Al-Adhan API client
 * Docs: https://aladhan.com/prayer-times-api
 * Base URL: https://api.aladhan.com/v1
 *
 * Provides Islamic prayer times (worldwide), Qibla direction, and Hijri calendar.
 * Free, no API key required.
 */

const BASE_URL = "https://api.aladhan.com/v1";

export interface PrayerTimesResult {
  date: {
    readable: string;
    timestamp: string;
    gregorian: { date: string; format: string; day: string; month: { number: number; en: string }; year: string };
    hijri: { date: string; format: string; day: string; month: { number: number; en: string; ar: string }; year: string };
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: { id: number; name: string };
    latitudeAdjustmentMethod: string;
    midnightMode: string;
    school: string;
  };
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    LastThird: string;
    Firstthird: string;
  };
}

export interface QiblaResult {
  latitude: number;
  longitude: number;
  direction: number;  // degrees from true north
}

export interface HijriResult {
  hijri: { day: number; month: { en: string; ar: string; number: number }; year: number; date: string; holidays: string[] };
  gregorian: { date: string; day: string; month: { en: string }; year: string };
}

/** Convert YYYY-MM-DD to DD-MM-YYYY for aladhan API */
function toDmyDate(date?: string): string {
  const raw = date || new Date().toISOString().split("T")[0];
  const [y, m, d] = raw.split("-");
  return `${d}-${m}-${y}`;
}

export async function getPrayerTimesByCity(
  city: string,
  country?: string,
  date?: string,
  method?: number
): Promise<PrayerTimesResult> {
  const dateParam = toDmyDate(date);
  const methodParam = method || 2; // default: ISNA (North America), commonly used worldwide
  const countryParam = country ? `&country=${encodeURIComponent(country)}` : "";
  const url = `${BASE_URL}/timingsByCity/${dateParam}?city=${encodeURIComponent(city)}${countryParam}&method=${methodParam}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Al-Adhan API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.data;
}

export async function getPrayerTimesByCoords(
  lat: number,
  lng: number,
  date?: string,
  method?: number
): Promise<PrayerTimesResult> {
  const dateParam = toDmyDate(date);
  const methodParam = method || 2;
  const url = `${BASE_URL}/timings/${dateParam}?latitude=${lat}&longitude=${lng}&method=${methodParam}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Al-Adhan API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.data;
}

export async function getQiblaDirection(lat: number, lng: number): Promise<QiblaResult> {
  const url = `${BASE_URL}/qibla/${lat}/${lng}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Al-Adhan API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.data;
}

export async function getHijriDate(): Promise<HijriResult> {
  const res = await fetch(`${BASE_URL}/gToH`);
  if (!res.ok) throw new Error(`Al-Adhan API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.data;
}
