// lib/match-utils.ts
import { connectToDatabase } from "./mongodb";
import Match from "@/models/match";

export async function getMatchRange(season: number, weekNumber: number): Promise<{ start: Date; end: Date } | null> {
  await connectToDatabase();

  const match = await Match.findOne({ season, weekNumber }).sort({ startDate: 1 }).lean() as unknown as {startDate: Date, endDate: Date};

  if (!match) {
    return null;
  }

  return {
    start: new Date(match.startDate),
    end: new Date(match.endDate),
  };
}
