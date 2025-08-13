import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L, { TileLayer as LeafletTileLayer } from "leaflet";

const RW_INDEX = "https://api.rainviewer.com/public/weather-maps.json";
type Frame = { time: number };

function useRainviewer(opacity: number) {
  const map = useMap();
  const layerRef = useRef<LeafletTileLayer | null>(null);

  const setFrame = (frame: Frame | null) => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (!frame) return;

    const url = `https://tilecache.rainviewer.com/v2/radar/${frame.time}/256/{z}/{x}/{y}/2/1_1.png?color=3&smooth=1&snow=1`;
    const tl = L.tileLayer(url, {
      opacity,
      zIndex: 300,
      updateInterval: 60000,
      crossOrigin: true,
    });
    layerRef.current = tl;
    tl.addTo(map);
  };

  // Ensure Leaflet lays out tiles after mount
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  useEffect(() => {
    if (layerRef.current) layerRef.current.setOpacity(opacity);
  }, [opacity]);

  return { setFrame };
}

function RadarLayer({
  frames,
  index,
  opacity = 0.65,
}: {
  frames: Frame[];
  index: number;
  opacity?: number;
}) {
  const { setFrame } = useRainviewer(opacity);
  useEffect(() => {
    setFrame(frames[index] ?? null);
    return () => setFrame(null);
  }, [index, frames, setFrame]);
  return null;
}

export default function RadarMap({
  center = [45.07, 7.69],
  zoom = 6,
}: {
  center?: [number, number];
  zoom?: number;
}) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [opacity, setOpacity] = useState(0.65);
  const [error, setError] = useState<string | null>(null);

  // Load frames
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        const res = await fetch(RW_INDEX, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const past: Frame[] = json?.radar?.past ?? [];
        const now: Frame[] = json?.radar?.nowcast ?? [];
        const all = [...past.slice(-12), ...now]; // show a bit more history
        if (alive) {
          setFrames(all);
          setIdx(Math.max(all.length - 1, 0));
        }
      } catch (e: any) {
        if (alive)
          setError("Impossibile caricare RainViewer (bloccato o offline).");
        console.error("RainViewer fetch error:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Animate
  useEffect(() => {
    if (!playing || frames.length === 0) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % frames.length), 600);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  const inertia = useMemo(() => ({ inertia: true }), []);
  const ts = frames[idx]?.time ? new Date(frames[idx].time * 1000) : null;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
            onClick={() => setPlaying((p) => !p)}
            disabled={frames.length === 0}
          >
            {playing ? "⏸ Pausa" : "▶ Play"}
          </button>

          <input
            type="range"
            min={0}
            max={Math.max(frames.length - 1, 0)}
            value={idx}
            onChange={(e) => setIdx(parseInt(e.target.value, 10))}
            className="w-44"
            disabled={frames.length === 0}
          />

          <label className="text-xs text-gray-600 ml-3">
            Opacità
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={Math.round(opacity * 100)}
              onChange={(e) => setOpacity(parseInt(e.target.value, 10) / 100)}
              className="ml-2 align-middle"
            />
          </label>

          <span className="text-xs text-gray-500 ml-3">
            {frames.length
              ? `${frames.length} frames`
              : error ?? "Caricamento…"}
          </span>
        </div>

        <div className="text-xs text-gray-500">
          {ts ? ts.toLocaleTimeString() : "—"}
        </div>
      </div>

      <div className="h-[460px]">
        <MapContainer
          key={`${center[0].toFixed(2)},${center[1].toFixed(2)}`}
          center={center as any}
          zoom={zoom}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
          {...inertia}
        >
          <TileLayer
            zIndex={100}
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {frames.length > 0 && (
            <RadarLayer frames={frames} index={idx} opacity={opacity} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
