type Day = {
  date: string;
  icon: string;
  tmin: number;
  tmax: number;
  precip: number;
  wind: number;
  code: number;
};

const wd = (s: string) =>
  new Date(s).toLocaleDateString(undefined, { weekday: "short" });
const md = (s: string) =>
  new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function ForecastCard({ day }: { day: Day }) {
  return (
    <div className="min-w-[150px] rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm">
      <p className="text-xs text-gray-500">
        {wd(day.date)}, {md(day.date)}
      </p>
      <div className="text-3xl leading-none my-1">{day.icon}</div>
      <p className="text-sm">
        <span className="font-semibold">{Math.round(day.tmax)}°</span>
        <span className="text-gray-500"> / {Math.round(day.tmin)}°</span>
      </p>
      <p className="text-[11px] text-gray-600 mt-1">
        💨 {Math.round(day.wind)} km/h
      </p>
      <p className="text-[11px] text-gray-600">🌧️ {day.precip.toFixed(1)} mm</p>
    </div>
  );
}
