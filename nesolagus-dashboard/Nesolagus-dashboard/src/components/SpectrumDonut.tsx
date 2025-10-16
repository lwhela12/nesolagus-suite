// src/components/SpectrumDonut.tsx
"use client"

type Slice = { label: string; value: number }

export default function SpectrumDonut({ data = [] as Slice[] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-sm text-RiverRock">No spectrum data available.</p>
  }

  // Simple visual: legend + total; we can swap to Recharts later when you're ready.
  const total = data.reduce((a, b) => a + (b.value || 0), 0)

  return (
    <div className="space-y-3">
      <div className="text-sm text-RiverRock">Total: {total}</div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.map((s, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-md border p-2"
          >
            <span className="text-sm">{s.label}</span>
            <span className="text-sm font-semibold">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
