/**
 * Prayer times tool: F5
 * Worldwide support via city name or GPS coordinates.
 */

import * as aladhan from "../services/aladhan.js";

export async function getPrayerTimes(
  city?: string,
  country?: string,
  lat?: number,
  lng?: number,
  date?: string,
  method?: string | number
): Promise<string> {
  let data: aladhan.PrayerTimesResult;

  if (lat !== undefined && lng !== undefined) {
    data = await aladhan.getPrayerTimesByCoords(lat, lng, date, method);
  } else if (city) {
    data = await aladhan.getPrayerTimesByCity(city, country, date, method);
  } else {
    throw new Error("Either city or coordinates (lat+lng) must be provided");
  }

  const { timings, date: dateInfo, meta } = data;

  const locationStr = city
    ? `${city}${country ? `, ${country}` : ""}`
    : `${meta.latitude.toFixed(2)}, ${meta.longitude.toFixed(2)}`;

  return [
    `🕌 *Prayer Times — ${locationStr}*`,
    ``,
    `📅 ${dateInfo.gregorian.day} ${dateInfo.gregorian.month.en} ${dateInfo.gregorian.year}`,
    `🌙 ${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year} H`,
    ``,
    `🌅 Imsak:    *${timings.Imsak}*`,
    `🌄 Fajr:     *${timings.Fajr}*`,
    `☀️ Sunrise:  ${timings.Sunrise}`,
    `☀️ Dhuhr:    *${timings.Dhuhr}*`,
    `🌤️ Asr:      *${timings.Asr}*`,
    `🌇 Maghrib:  *${timings.Maghrib}*`,
    `🌙 Isha:     *${timings.Isha}*`,
    ``,
    `🕌 Method: ${meta.method.name}`,
    `🕐 Timezone: ${meta.timezone}`,
  ].join("\n");
}

export async function getQibla(lat: number, lng: number): Promise<string> {
  const data = await aladhan.getQiblaDirection(lat, lng);

  return [
    `🕋 *Qibla Direction*`,
    ``,
    `📍 Location: ${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`,
    `🧭 Bearing: *${data.direction.toFixed(2)}°* from True North`,
    ``,
    `_Face this direction for prayer._`,
  ].join("\n");
}

export async function getHijriDate(): Promise<string> {
  const data = await aladhan.getHijriDate();

  return [
    `🌙 *Hijri Date*`,
    ``,
    `📅 Hijri: *${data.hijri.day} ${data.hijri.month.en} ${data.hijri.year} H*`,
    `🗓️ Gregorian: ${data.gregorian.day} ${data.gregorian.month.en} ${data.gregorian.year}`,
    ``,
    data.hijri.holidays.length > 0
      ? `🎉 Holidays: ${data.hijri.holidays.join(", ")}`
      : "",
  ].join("\n");
}
