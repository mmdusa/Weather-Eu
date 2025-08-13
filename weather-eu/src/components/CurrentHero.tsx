import { wmoIcon } from "../lib/weather";

type Props = {
  city: string;
  nowC: number;
  feelsC: number;
  code?: number;
  sunrise?: string;
  sunset?: string;
};

function fmtTime(iso?: string) {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CurrentHero({
  city,
  nowC,
  feelsC,
  code,
  sunrise,
  sunset,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-800 to-blue-600 text-white shadow-lg">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,white,transparent_60%)]" />
      <div className="relative p-5 md:p-6 flex items-center gap-5">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-white/80">{city}</p>
          <div className="flex items-center gap-3">
            <div className="text-5xl md:text-6xl font-semibold leading-none">
              {Math.round(nowC)}°
            </div>
            <div className="text-4xl">{wmoIcon(code ?? 0)}</div>
          </div>
          <p className="mt-1 text-sm md:text-base">
            Percepiti {Math.round(feelsC)}°
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-8 text-sm">
          <div className="text-center">
            <p className="text-white/70 text-xs">Alba</p>
            <p className="font-medium">{fmtTime(sunrise)}</p>
          </div>
          <div className="text-center">
            <p className="text-white/70 text-xs">Tramonto</p>
            <p className="font-medium">{fmtTime(sunset)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
