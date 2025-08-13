type Props = { values: number[] };

export default function TenDayChart({ values }: Props) {
  if (!values.length) return null;
  const w = 800,
    h = 140,
    pad = 10;
  const min = Math.min(...values),
    max = Math.max(...values);
  const xStep = (w - pad * 2) / (values.length - 1 || 1);
  const y = (v: number) => {
    if (max === min) return h / 2;
    return pad + (h - pad * 2) * (1 - (v - min) / (max - min));
  };
  const points = values.map((v, i) => `${pad + i * xStep},${y(v)}`).join(" ");

  return (
    <div className="card p-4 overflow-x-auto">
      <svg width={w} height={h} className="min-w-full">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* min/max labels */}
        <text x={w - 60} y={y(max) - 6} className="text-[10px] fill-current">
          {Math.round(max)}°
        </text>
        <text x={w - 60} y={y(min) + 12} className="text-[10px] fill-current">
          {Math.round(min)}°
        </text>
      </svg>
    </div>
  );
}
