// app/api/match-range/route.ts
import { NextResponse } from "next/server";
import { getMatchRange } from "@/lib/match-utils";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const season = parseInt(url.searchParams.get("season") || "");
  const week = parseInt(url.searchParams.get("week") || "");

  if (isNaN(season) || isNaN(week)) {
    return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
  }

  const range = await getMatchRange(season, week);

  if (!range) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json({
    start: range.start.toISOString(),
    end: range.end.toISOString()
  });
}
