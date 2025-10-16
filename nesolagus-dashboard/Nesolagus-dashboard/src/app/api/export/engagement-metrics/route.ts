// src/app/api/export/engagement/route.ts
import { NextRequest } from "next/server";

/**
 * Mock Engagement Metrics export.
 * Align columns/names with whatever schema you’ll use in production.
 */
export async function GET(_req: NextRequest) {
  const now = new Date();
  const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const rows = [
    ["metric", "value", "as_of_utc"],
    ["total_respondents", "1250", now.toISOString()],
    ["completed_surveys", "950", now.toISOString()],
    ["avg_completion_rate_pct", "76", now.toISOString()],
    ["opt_in_rate_pct", "68", now.toISOString()],
    ["avg_completion_time_min", "18.5", now.toISOString()],
  ];

  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ghac_engagement_${yyyymmdd}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
