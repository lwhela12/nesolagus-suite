'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Label,
} from 'recharts';

const data = [
  { name: 'Cultural Connectors', value: 22 },
  { name: 'Creative Catalysts', value: 18 },
  { name: 'Community Builders', value: 16 },
  { name: 'Heritage Keepers', value: 15 },
];

const COLORS = ['#16a34a', '#0e7490', '#7c3aed', '#f59e0b']; // emerald / cyan / violet / amber

export default function CommunitySpectrum() {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            stroke="#fff"
            strokeWidth={2}
            isAnimationActive
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
            <Label
              position="center"
              content={({ viewBox }) => {
                if (!viewBox || typeof viewBox.cx !== 'number' || typeof viewBox.cy !== 'number') return null;
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-gray-700"
                    style={{ fontSize: 12 }}
                  >
                    Greater Hartford
                  </text>
                );
              }}
            />
          </Pie>
          <Tooltip
            formatter={(v: number, _n, { payload }) => [`${v}%`, payload.name]}
            contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
            labelStyle={{ color: '#111827' }}
          />
          <Legend
            verticalAlign="bottom"
            height={24}
            iconType="circle"
            formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
