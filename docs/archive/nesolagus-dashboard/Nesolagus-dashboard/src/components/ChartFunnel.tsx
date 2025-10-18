// src/components/ChartFunnel.tsx
"use client"

type Item = { label: string; value: number }
export default function ChartFunnel({ data = [] as Item[] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-sm text-RiverRock">No data available.</p>
  }

  // normalize widths for a nice funnel look
  const max = Math.max(...data.map(d => d.value || 0), 1)

  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-40 text-sm text-DeepestSea shrink-0">{d.label}</div>
          <div className="flex-1">
            <div
              className="h-4 rounded-md"
              style={{
                width: `${(d.value / max) * 100}%`,
                background:
                  "linear-gradient(90deg, #64B37A 0%, #2F6D49 100%)"
              }}
              title={`${d.value}`}
            />
          </div>
          <div className="w-10 text-right text-sm">{d.value}</div>
        </div>
      ))}
    </div>
  )
}
