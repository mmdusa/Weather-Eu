type Stat = {
  label: string;
  value: string;
  note?: string;
  icon?: React.ReactNode;
};

export default function StatGrid({ items = [] }: { items?: Stat[] }) {
  if (!items || items.length === 0) {
    // Optional: render skeleton instead of nothing
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((s, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs text-gray-500">{s.label}</p>
          <p className="text-2xl font-semibold leading-tight">{s.value}</p>
          {s.note && <p className="text-xs text-gray-500 mt-1">{s.note}</p>}
        </div>
      ))}
    </div>
  );
}
