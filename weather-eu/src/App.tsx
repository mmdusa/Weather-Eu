import { useEffect, useState } from "react";
import {
  fetchCombined,
  geocodeCity,
  wmoIcon,
  type Combined,
} from "./lib/weather";
import RadarMap from "./components/RadarMap";
import ForecastCard from "./components/ForecastCard";
import CurrentHero from "./components/CurrentHero";
import StatGrid from "./components/StatGrid";
import Navbar, { type Suggest, type TabKey } from "./components/Navbar";
import Footer from "./components/Footer";

type Loc = { name: string; lat: number; lon: number };

export default function App() {
  const [q, setQ] = useState("Torino, Piemonte, IT");
  const [loc, setLoc] = useState<Loc>({
    name: "Torino, Piemonte, IT",
    lat: 45.0703,
    lon: 7.6869,
  });
  const [data, setData] = useState<Combined | null>(null);
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggests, setSuggests] = useState<Suggest[]>([]);
  const [tab, setTab] = useState<TabKey>("ten");

  const [airQuality, setAirQuality] = useState<any[]>([]);

  // suggestions
  useEffect(() => {
    if (!q || q.length < 3) {
      setSuggests([]);
      return;
    }
    const id = setTimeout(async () => {
      try {
        const res = await geocodeCity(q, 5);
        setSuggests(
          res.map((r) => ({
            label: `${r.name}${r.admin1 ? ", " + r.admin1 : ""}${
              r.country_code ? ", " + r.country_code : ""
            }`,
            lat: r.latitude,
            lon: r.longitude,
          }))
        );
      } catch {}
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  // fetch weather
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const d = await fetchCombined(loc.lat, loc.lon, "Europe/Rome");
        setData(d);
        const dd = d.daily;
        // Ensure cards are sorted by date
        setDays(
          dd.time
            .map((date, i) => ({
              date,
              code: dd.weathercode[i],
              icon: wmoIcon(dd.weathercode[i]),
              tmax: dd.temperature_2m_max[i],
              tmin: dd.temperature_2m_min[i],
              precip: dd.precipitation_sum?.[i] ?? 0,
              wind: dd.windspeed_10m_max?.[i] ?? 0,
            }))
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .slice(0, 10)
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [loc.lat, loc.lon]);

  // fetch air quality (OpenAQ) — try by coordinates first, then by city name
  useEffect(() => {
    const API =
      "3d41c96a098073e2390a249b718f6c7b179db2f5064e7ec59ee95d4e604399a4";

    // try coords with larger radius and order by distance
    const byCoords = async () => {
      const url =
        `https://api.openaq.org/v2/latest?coordinates=${loc.lat},${loc.lon}` +
        `&radius=25000&order_by=distance&limit=5`;
      const res = await fetch(url, { headers: { "X-API-Key": API } });
      const json = await res.json();
      return json.results ?? [];
    };

    // fallback: try by city name (first token before comma)
    const byCity = async () => {
      const city = loc.name.split(",")[0].trim();
      const url =
        `https://api.openaq.org/v2/latest?city=${encodeURIComponent(city)}` +
        `&country=IT&limit=5`;
      const res = await fetch(url, { headers: { "X-API-Key": API } });
      const json = await res.json();
      return json.results ?? [];
    };

    (async () => {
      try {
        let results = await byCoords();
        if (!results.length) results = await byCity();

        // flatten and keep common pollutants
        const wanted = new Set(["pm25", "pm10", "no2", "o3", "so2", "co"]);
        const map = new Map<
          string,
          { parameter: string; value: number; unit: string }
        >();

        for (const r of results) {
          for (const m of r.measurements ?? []) {
            const p = String(m.parameter).toLowerCase();
            if (!wanted.has(p)) continue;
            // keep the most recent value per parameter
            if (
              !map.has(p) ||
              (m.lastUpdated &&
                new Date(m.lastUpdated) >
                  new Date((map.get(p) as any)?.lastUpdated ?? 0))
            ) {
              map.set(p, {
                parameter: p.toUpperCase(),
                value: m.value,
                unit: m.unit,
              });
            }
          }
        }

        setAirQuality(Array.from(map.values()));
      } catch (e) {
        console.error("Air quality fetch error:", e);
        setAirQuality([]);
      }
    })();
  }, [loc]);

  const sunrise = data?.daily.sunrise?.[0];
  const sunset = data?.daily.sunset?.[0];

  const handleTabChange = (t: TabKey) => {
    setTab(t);
    const map: Record<TabKey, string> = {
      dashboard: "section-dashboard",
      today: "section-today",
      ten: "section-ten",
      radar: "section-radar",
    };
    const el = document.getElementById(map[t]);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar
        q={q}
        setQ={setQ}
        suggests={suggests}
        onPick={(s) => {
          setLoc({ name: s.label, lat: s.lat, lon: s.lon });
          setQ(s.label);
          setSuggests([]);
        }}
        current={tab}
        onTabChange={handleTabChange}
      />

      <main className="container py-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        <section id="section-dashboard" className="md:col-span-2 hidden" />

        {/* LEFT COLUMN */}
        <section id="section-today" className="space-y-4">
          <CurrentHero
            city={loc.name}
            nowC={data?.current.temperature_2m ?? 0}
            feelsC={data?.current.apparent_temperature ?? 0}
            code={data?.current.weather_code}
            sunrise={sunrise}
            sunset={sunset}
          />

          <div className="card p-5">
            <h3 className="text-lg font-semibold mb-4">
              Il meteo di oggi a {loc.name}
            </h3>
            <StatGrid
              items={[
                {
                  label: "Max/Min",
                  value: data
                    ? `${Math.round(
                        data.daily.temperature_2m_max[0]
                      )}° / ${Math.round(data.daily.temperature_2m_min[0])}°`
                    : "--",
                },
                {
                  label: "Umidità",
                  value:
                    data?.current.relative_humidity_2m != null
                      ? `${Math.round(data.current.relative_humidity_2m)}%`
                      : "--",
                },
                {
                  label: "Vento",
                  value: `${Math.round(
                    data?.current.wind_speed_10m ?? 0
                  )} km/h`,
                },
                {
                  label: "Pressione",
                  value: data?.current.surface_pressure
                    ? `${Math.round(data.current.surface_pressure)} mb`
                    : "--",
                },
              ]}
            />
          </div>

          <div id="section-ten" className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Previsioni 10 giorni</h3>
              <p className="text-sm text-gray-500">Aggiornato ora</p>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-3 min-w-max">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="min-w-[150px] h-[150px] rounded-xl bg-gray-100 animate-pulse"
                      />
                    ))
                  : days.map((d, i) => <ForecastCard key={i} day={d} />)}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="text-lg font-semibold">
              Indice di qualità dell'aria
            </h3>
            {airQuality.length > 0 ? (
              <ul className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
                {airQuality.map((m, i) => (
                  <li key={i} className="text-gray-800">
                    <strong className="mr-1">{m.parameter}</strong>
                    {m.value} {m.unit}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Dati qualità aria non disponibili.
              </p>
            )}
          </div>
        </aside>

        {/* RADAR */}
        <section id="section-radar" className="md:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Radar precipitazioni</h3>
            <p className="text-sm text-gray-500">Fonte: RainViewer</p>
          </div>
          <RadarMap center={[loc.lat, loc.lon]} zoom={6} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
