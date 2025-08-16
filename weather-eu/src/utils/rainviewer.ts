import L from "leaflet";

function tileUrl(ts: number) {
  return `/api/rainviewer-tile/${ts}/256/{z}/{x}/{y}/200/1_1.png?color=3&smooth=1&snow=1`;
}

export async function addRainviewerLayer(map: L.Map) {
  const frames = await (await fetch("/api/rainviewer-frames")).json();
  const list = [
    ...(frames?.radar?.past ?? []),
    ...(frames?.radar?.nowcast ?? []),
  ];

  if (!list.length) throw new Error("No radar frames available");

  const latestPast = (frames?.radar?.past ?? []).at(-1);
  const ts = latestPast?.time ?? list.at(-1).time;

  const layer = L.tileLayer(tileUrl(ts), {
    tileSize: 256,
    crossOrigin: true,
    zIndex: 400,
  }).addTo(map);

  // optional animation:
  // let i = Math.max(0, (frames?.radar?.past ?? []).length - 3);
  // setInterval(() => {
  //   const t = list[(i++) % list.length].time;
  //   layer.setUrl(tileUrl(t));
  // }, 800);
}
