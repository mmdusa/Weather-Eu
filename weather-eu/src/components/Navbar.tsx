import { useMemo } from "react";

export type Suggest = { label: string; lat: number; lon: number };
export type TabKey = "dashboard" | "today" | "ten" | "radar";

export default function Navbar({
  q,
  setQ,
  suggests,
  onPick,
  current,
  onTabChange,
}: {
  q: string;
  setQ: (v: string) => void;
  suggests: Suggest[];
  onPick: (s: Suggest) => void;
  current: TabKey;
  onTabChange: (t: TabKey) => void;
}) {
  const tabBtn = (key: TabKey, label: string) => (
    <button
      onClick={() => onTabChange(key)}
      className={"tab " + (current === key ? "tab-active" : "")}
    >
      {label}
    </button>
  );

  // close dropdown when empty
  const hasSuggests = useMemo(() => suggests.length > 0, [suggests.length]);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container h-16 flex items-center gap-4">
        <span className="text-2xl">🌤️</span>
        <h1 className="font-bold text-lg">EU Weather</h1>

        <nav className="hidden md:flex gap-1 ml-6">
          {tabBtn("dashboard", "La mia dashboard")}
          {tabBtn("today", "Oggi")}
          {tabBtn("ten", "10 giorni")}
          {tabBtn("radar", "Radar")}
        </nav>

        <div className="ml-auto relative w-full max-w-md">
          <input
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cerca città o CAP…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {hasSuggests && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
              {suggests.map((s, i) => (
                <button
                  key={i}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => onPick(s)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
