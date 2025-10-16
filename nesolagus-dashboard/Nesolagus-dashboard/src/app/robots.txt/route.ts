import { NextResponse } from "next/server";

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Sitemap: https://example.com/sitemap.xml", // replace at deploy
    "",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
