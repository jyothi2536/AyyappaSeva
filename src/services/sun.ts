// Sunrise / sunset calculation (NOAA "sunrise equation"), computed on-device.
// Accurate to about a minute; no network or location permission needed.

/** Sree Dharma Sastha (Ayyappa) Temple, 5910 Bethelview Road, Cumming, GA. */
export const TEMPLE_LOCATION = { latitude: 34.1637, longitude: -84.1985, timeZone: "America/New_York" };

const rad = Math.PI / 180;

/** Sunrise and sunset for the calendar day `y-m-d` (month 1-12) at a location. */
export function sunTimes(
  y: number,
  m: number,
  d: number,
  lat = TEMPLE_LOCATION.latitude,
  lng = TEMPLE_LOCATION.longitude,
): { sunrise: Date; sunset: Date } | null {
  const jdNoon = Date.UTC(y, m - 1, d, 12) / 86_400_000 + 2440587.5;
  const n = Math.round(jdNoon - 2451545.0 + 0.0008);
  const jStar = n - lng / 360;
  const M = (357.5291 + 0.98560028 * jStar) % 360;
  const C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const jTransit = 2451545 + jStar + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
  const sinDec = Math.sin(lambda * rad) * Math.sin(23.4397 * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosW = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * sinDec) / (Math.cos(lat * rad) * cosDec);
  if (cosW < -1 || cosW > 1) return null;
  const w = Math.acos(cosW) / rad;
  const toDate = (j: number) => new Date((j - 2440587.5) * 86_400_000);
  return { sunrise: toDate(jTransit - w / 360), sunset: toDate(jTransit + w / 360) };
}

/** "7:54 AM" in the phone's local time zone (matches where the devotee is). */
export function formatLocalTime(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** "7:54 AM" in the temple's time zone. */
export function formatTempleTime(date: Date) {
  try {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: TEMPLE_LOCATION.timeZone,
    });
  } catch {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
}
