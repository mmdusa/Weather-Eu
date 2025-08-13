const OM_BASE = "https://api.open-meteo.com/v1/forecast";
const GEO_BASE = "https://geocoding-api.open-meteo.com/v1/search";

export type GeoResult = {
  name: string;
  country_code?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

export async function geocodeCity(q: string, count = 5): Promise<GeoResult[]> {
  const url = `${GEO_BASE}?name=${encodeURIComponent(
    q
  )}&count=${count}&language=it&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return data?.results ?? [];
}

export type Combined = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    relative_humidity_2m?: number;
    surface_pressure?: number;
    weather_code?: number;
  };
  daily: {
    time: string[];
    weathercode: number[];
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
  const res = await fetch(url);
  if (!res.ok) throw new Error("Forecast fetch failed");
  return res.json();
}

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
  if ([95].includes(code)) return "⛈️";
  if ([96, 97, 99].includes(code)) return "⛈️⚡";
  return "🌡️";
}
