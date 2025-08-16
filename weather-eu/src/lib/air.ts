// src/lib/air.ts
const AQ_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";

export type AirPoint = {
  time: string;
  pm10?: number;
  pm2_5?: number;
  carbon_monoxide?: number;
  us_aqi?: number;
};

export async function fetchAir(lat: number, lon: number, tz = "Europe/Rome") {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: tz,
    hourly: ["pm10", "pm2_5", "carbon_monoxide", "us_aqi"].join(","),
  });
  const res = await fetch(`${AQ_BASE}?${params}`);
  if (!res.ok) throw new Error(`Air fetch failed: ${res.status}`);
  const data = await res.json();

  // pick the latest hour
  const i = data.hourly?.time?.length ? data.hourly.time.length - 1 : 0;
  const point: AirPoint = {
    time: data.hourly?.time?.[i],
    pm10: data.hourly?.pm10?.[i],
    pm2_5: data.hourly?.pm2_5?.[i],
    carbon_monoxide: data.hourly?.carbon_monoxide?.[i],
    us_aqi: data.hourly?.us_aqi?.[i],
  };
  return { point, raw: data };
}
