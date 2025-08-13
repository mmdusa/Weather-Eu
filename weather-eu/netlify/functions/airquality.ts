// netlify/functions/airquality.ts
import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  try {
    const lat = event.queryStringParameters?.lat;
    const lon = event.queryStringParameters?.lon;
    const city = event.queryStringParameters?.city; // optional fallback
    const key = process.env.OPENAQ_KEY;

    if (!lat || !lon) {
      return { statusCode: 400, body: "Missing lat/lon" };
    }

    // 1) try by coordinates (larger radius, nearest first)
    const byCoordsUrl =
      `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}` +
      `&radius=25000&order_by=distance&limit=5`;

    const headers: Record<string, string> = {};
    if (key) headers["X-API-Key"] = key;

    let r = await fetch(byCoordsUrl, { headers });
    let j = await r.json();

    // 2) fallback by city (if nothing found and city provided)
    if ((!j?.results || j.results.length === 0) && city) {
      const byCityUrl =
        `https://api.openaq.org/v2/latest?city=${encodeURIComponent(city)}` +
        `&country=IT&limit=5`;
      r = await fetch(byCityUrl, { headers });
      j = await r.json();
    }

    // Flatten common pollutants to a compact map (keep most recent)
    const wanted = new Set(["pm25", "pm10", "no2", "o3", "so2", "co"]);
    const map = new Map<
      string,
      { parameter: string; value: number; unit: string; lastUpdated?: string }
    >();

    for (const res of j?.results ?? []) {
      for (const m of res.measurements ?? []) {
        const p = String(m.parameter).toLowerCase();
        if (!wanted.has(p)) continue;
        const prev = map.get(p);
        if (
          !prev ||
          (m.lastUpdated &&
            (!prev.lastUpdated ||
              new Date(m.lastUpdated) > new Date(prev.lastUpdated)))
        ) {
          map.set(p, {
            parameter: p.toUpperCase(),
            value: m.value,
            unit: m.unit,
            lastUpdated: m.lastUpdated,
          });
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // allow your app to call this function in dev/preview/prod
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ measurements: Array.from(map.values()) }),
    };
  } catch (e: any) {
    console.error(e);
    return { statusCode: 500, body: "Airquality function error" };
  }
};

export { handler };
