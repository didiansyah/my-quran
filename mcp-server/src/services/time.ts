/**
 * Time utility to convert local time + timezone to ISO 8601 absolute timestamp.
 * Uses standard Intl.DateTimeFormat to find offsets.
 */

export function getIsoTimestamp(dateStr: string, timeStr: string, timezone: string): string {
  // dateStr: YYYY-MM-DD
  // timeStr: HH:mm
  // timezone: Asia/Jakarta
  
  // 1. Create a date object
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  
  // 2. Use Intl.DateTimeFormat to find what the local time would be at that UTC moment
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  // 3. Iteratively find the offset
  let targetDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  
  for (let i = 0; i < 3; i++) {
    const parts = formatter.formatToParts(targetDate);
    const p: Record<string, any> = {};
    parts.forEach(part => p[part.type] = part.value);
    
    // Month in Intl is 1-based string
    const lYear = parseInt(p.year);
    const lMonth = parseInt(p.month);
    const lDay = parseInt(p.day);
    const lHour = parseInt(p.hour) === 24 ? 0 : parseInt(p.hour);
    const lMinute = parseInt(p.minute);
    
    const currentLocal = Date.UTC(lYear, lMonth - 1, lDay, lHour, lMinute);
    const requestedLocal = Date.UTC(year, month - 1, day, hour, minute);
    
    const diff = requestedLocal - currentLocal;
    if (diff === 0) break;
    targetDate = new Date(targetDate.getTime() + diff);
  }

  return targetDate.toISOString();
}
