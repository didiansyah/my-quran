/**
 * Location-based tools: F13 Mosque Finder, F15 Imsak
 */

import { findNearbyMosques, formatMosques } from "../services/overpass.js";
import * as aladhan from "../services/aladhan.js";

export async function findMosques(
  lat: number,
  lng: number,
  radius = 5000,
  limit = 10
): Promise<string> {
  const mosques = await findNearbyMosques(lat, lng, radius, limit);
  return formatMosques(mosques, lat, lng);
}

export async function getImsakTimes(city: string, country?: string): Promise<string> {
  const data = await aladhan.getPrayerTimesByCity(city, country);

  return [
    `🌅 *Imsak & Fajr Times — ${city}${country ? `, ${country}` : ""}*`,
    ``,
    `📅 ${data.date.gregorian.day} ${data.date.gregorian.month.en} ${data.date.gregorian.year}`,
    `🌙 ${data.date.hijri.day} ${data.date.hijri.month.en} ${data.date.hijri.year} H`,
    ``,
    `🌅 Imsak (stop eating): *${data.timings.Imsak}*`,
    `🌄 Fajr (prayer): *${data.timings.Fajr}*`,
    `🌇 Maghrib (iftar): *${data.timings.Maghrib}*`,
    ``,
    `_Imsak is typically 10 minutes before Fajr. Use this time to stop eating for the fast._`,
  ].join("\n");
}
