/**
 * Prayer times tool: F5
 * Worldwide support via city name or GPS coordinates.
 */

import * as aladhan from "../services/aladhan.js";
import { getIsoTimestamp } from "../services/time.js";

export async function getPrayerTimes(
  city?: string,
  country?: string,
  lat?: number,
  lng?: number,
  date?: string,
  method?: string | number,
  timezoneOverride?: string
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
  const tz = timezoneOverride || meta.timezone;
  const gDate = dateInfo.gregorian;
  const isoDate = `${gDate.year}-${String(gDate.month.number).padStart(2, '0')}-${String(gDate.day).padStart(2, '0')}`;

  const getTzTime = (time: string) => {
    try {
      const cleanTime = time.split(' ')[0];
      return getIsoTimestamp(isoDate, cleanTime, tz);
    } catch {
      return "UTC error";
    }
  };

  const locationStr = city
    ? `${city}${country ? `, ${country}` : ""}`
    : `${meta.latitude.toFixed(2)}, ${meta.longitude.toFixed(2)}`;

  return [
    `\uD83D\uDD4C *Prayer Times \u2014 ${locationStr}*`,
    ``,
    `\uD83D\uDCC5 ${dateInfo.gregorian.day} ${dateInfo.gregorian.month.en} ${dateInfo.gregorian.year}`,
    `\uD83C\uDF19 ${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year} H`,
    ``,
    `\uD83C\uDF05 Imsak:    *${timings.Imsak}* (${getTzTime(timings.Imsak)})`,
    `\uD83C\uDF04 Fajr:     *${timings.Fajr}* (${getTzTime(timings.Fajr)})`,
    `☀️ Sunrise:  ${timings.Sunrise} (${getTzTime(timings.Sunrise)})`,
    `☀️ Dhuhr:    *${timings.Dhuhr}* (${getTzTime(timings.Dhuhr)})`,
    `🌤️ Asr:      *${timings.Asr}* (${getTzTime(timings.Asr)})`,
    `🌇 Maghrib:  *${timings.Maghrib}* (${getTzTime(timings.Maghrib)})`,
    `🌙 Isha:     *${timings.Isha}* (${getTzTime(timings.Isha)})`,
    ``,
    `\uD83D\uDD4C Method: ${meta.method.name}`,
    `\uD83D\uDD50 Timezone: ${tz}`,
  ].join("\n");
}

export async function getQibla(lat: number, lng: number): Promise<string> {
  const data = await aladhan.getQiblaDirection(lat, lng);

  return [
    `\uD83D\uDDFB *Qibla Direction*`,
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
