// src/app/api/export/csv/route.ts
import { NextRequest } from "next/server";

/**
 * Simple mock CSV export: respondents + segments + trust score + timestamp.
 * Replace with real DB query/stream when ready.
 */
export async function GET(_req: NextRequest) {
  const now = new Date();
  const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const rows = [
    ["id", "respondent", "segment", "trustScore", "timestamp_utc"],
    ["1", "Amanda Roy", "Community Builders", "7.1", now.toISOString()],
    ["2", "Kai Jordan", "Creative Catalysts", "6.8", now.toISOString()],
    ["3", "Taylor Singh", "Cultural Connectors", "7.9", now.toISOString()],
    ["4", "Dev Patel", "Heritage Keepers", "6.4", now.toISOString()],
    ["5", "Casey Lee", "Community Builders", "7.3", now.toISOString()],
  ];

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ghac_export_${yyyymmdd}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
