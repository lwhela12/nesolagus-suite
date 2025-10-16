// src/app/api/export/[type]/route.ts
import { NextResponse } from 'next/server';

function toCSV(rows: (string | number)[][]) {
  return rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export async function GET(_req: Request, { params }: { params: { type: string } }) {
  const { type } = params;

  let filename = 'export.csv';
  let rows: (string | number)[][] = [];

  switch (type) {
    case 'full':
      filename = 'full_dataset.csv';
      rows = [
        ['id', 'date', 'channel', 'engaged', 'donation'],
        ['1', '2025-08-01', 'Newsletter', 1, 0],
        ['2', '2025-08-03', 'Event', 1, 1],
        ['3', '2025-08-07', 'Social', 0, 0],
      ];
      break;

    case 'engagement':
      filename = 'engagement_metrics.csv';
      rows = [
        ['stage', 'count'],
        ['Started', 1250],
        ['Halfway', 1120],
        ['Completed', 950],
        ['Share OK', 560],
      ];
      break;

    case 'demographics':
      filename = 'demographics.csv';
      rows = [
        ['metric', 'value'],
        ['Age 18-34', '28%'],
        ['Age 35-54', '39%'],
        ['Age 55+', '33%'],
        ['ZIP 06103', 156],
      ];
      break;

    default:
      return NextResponse.json({ error: 'Unknown export type' }, { status: 400 });
  }

  const csv = toCSV(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
