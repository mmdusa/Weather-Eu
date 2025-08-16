// src/lib/weather.ts
const OM_BASE = "https://api.open-meteo.com/v1/forecast";
const GEO_BASE = "https://geocoding-api.open-meteo.com/v1/search";

// --- tiny helper: fetch with timeout ---
async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, ms = 10_000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(input, { ...init, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export type GeoResult = {
  name: string;
  country_code?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

export async function geocodeCity(q: string, count = 5): Promise<GeoResult[]> {
  const url = `${GEO_BASE}?name=${encodeURIComponent(q)}&count=${count}&language=it&format=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Geocoding failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  // API returns { results?: [...] }; normalize to array
  return Array.isArray(data?.results) ? data.results : [];
}

export type Combined = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    relative_humidity_2m?: number;
    surface_pressure?: number;
    weather_code?: number; // Open-Meteo uses snake_case here
  };
  daily: {
    time: string[];
    weathercode: number[]; // daily uses 'weathercode' (no underscore)
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum?: number[];
    windspeed_10m_max?: number[];
    sunrise?: string[];
    sunset?: string[];
  };
  timezone: string;
};

export async function fetchCombined(
  lat: number,
  lon: number,
  tz = "Europe/Rome"
): Promise<Combined> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: tz,
    current: [
      "temperature_2m",
      "apparent_temperature",
      "wind_speed_10m",
      "relative_humidity_2m",
      "surface_pressure",
      "weather_code",
    ].join(","),
    daily: [
      "weathercode",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "windspeed_10m_max",
      "sunrise",
      "sunset",
    ].join(","),
  });

  const url = `${OM_BASE}?${params.toString()}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Forecast fetch failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Minimal WMO → emoji mapping
export function wmoIcon(code: number): string {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65].includes(code)) return "🌧️";
  if ([66, 67].includes(code)) return "🌧️❄️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([80, 81, 82].includes(code)) return "🌧️";
  if ([85, 86].includes(code)) return "🌨️";
  if (code === 95) return "⛈️";
  if ([96, 99].includes(code)) return "⛈️⚡";
  return "🌡️";
}
