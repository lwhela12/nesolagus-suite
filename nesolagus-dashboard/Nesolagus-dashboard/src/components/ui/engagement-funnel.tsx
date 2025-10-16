'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const data = [
  { name: 'Started', value: 82 },
  { name: 'Halfway', value: 74 },
  { name: 'Completed', value: 61 },
  { name: 'Share OK', value: 45 },
];

export default function EngagementFunnel() {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          barSize={14}            // slimmer bars
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          {/* subtle grid */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* percentage axis */}
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* category axis */}
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* gradient fill */}
          <defs>
            <linearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22c55e" />   {/* emerald-500 */}
              <stop offset="100%" stopColor="#166534" /> {/* emerald-800 */}
            </linearGradient>
          </defs>

          <Tooltip
            formatter={(v: number) => [`${v}%`, '']}
            contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
            labelStyle={{ color: '#111827' }}
          />

          <Bar
            dataKey="value"
            fill="url(#funnelGradient)"
            radius={[6, 6, 6, 6]}   // rounded corners
            isAnimationActive
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
