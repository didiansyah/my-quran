/**
 * OpenStreetMap Overpass API client for mosque finding.
 * Free, no API key required.
 * Docs: https://wiki.openstreetmap.org/wiki/Overpass_API
 */

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export interface Mosque {
  name: string;
  lat: number;
  lng: number;
  distance: number; // meters
  address?: string;
}

/**
 * Find mosques near a GPS coordinate using OSM Overpass API.
 */
export async function findNearbyMosques(
  lat: number,
  lng: number,
  radius = 5000,
  limit = 10,
  retries = 2
): Promise<Mosque[]> {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
    );
    out center ${limit};
  `;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 1000));
      }

      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "MyQuran/0.4.0",
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!res.ok) {
        if (res.status === 504 && attempt < retries) continue; // Retry on gateway timeout
        throw new Error(`Overpass API error: ${res.status}`);
      }

      const data = await res.json();
      const elements: any[] = data.elements || [];

      return elements
        .map((el): Mosque | null => {
          const name = el.tags?.name || "Unnamed Mosque";
          const elLat = el.lat || el.center?.lat;
          const elLng = el.lon || el.center?.lon;
          if (!elLat || !elLng) return null;

          const distance = haversineDistance(lat, lng, elLat, elLng);
          const parts = [
            el.tags?.["addr:street"],
            el.tags?.["addr:city"],
            el.tags?.["addr:country"],
          ].filter(Boolean) as string[];
          const address = parts.length > 0 ? parts.join(", ") : undefined;

          return { name, lat: elLat, lng: elLng, distance: Math.round(distance), address };
        })
        .filter((m): m is Mosque => m !== null)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) continue;
    }
  }

  throw lastError || new Error("Overpass API failed after retries");
}

/**
 * Haversine distance between two GPS points in meters.
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatMosques(mosques: Mosque[], lat: number, lng: number): string {
  if (mosques.length === 0) {
    return [
      `🕌 *Mosque Finder*`,
      ``,
      `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      ``,
      `No mosques found within radius. Try increasing the search radius.`,
    ].join("\n");
  }

  return [
    `🕌 *Mosque Finder* — ${mosques.length} found`,
    ``,
    `📍 Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    ``,
    ...mosques.map((m, i) => {
      const distKm = (m.distance / 1000).toFixed(1);
      const line = `*${i + 1}.* ${m.name}`;
      const sub = [
        `   📍 ${distKm} km away`,
        m.address ? `   📫 ${m.address}` : null,
      ].filter(Boolean).join("\n");
      return `${line}\n${sub}`;
    }),
  ].join("\n");
}
