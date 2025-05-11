import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Match from "@/models/match";
import SubstanceLog from "@/models/substance-log";
import User from "@/models/user";
import { isValidObjectId } from "mongoose";
import Substance from "@/models/substance";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const seasonParam = url.searchParams.get("season");
    const weekParam = url.searchParams.get("week");
    const userIds = url.searchParams.getAll("userIds").filter(id => isValidObjectId(id));

    if (!seasonParam || !weekParam) {
      return NextResponse.json({ message: "Missing season or week parameter" }, { status: 400 });
    }

    const season = parseInt(seasonParam);
    const weekNumber = parseInt(weekParam);

    await connectToDatabase();

    // Get all matches for the given week
    const matches = await Match.find({ season, weekNumber }).lean();

    console.log("Matches found:", matches);
    if (matches.length === 0) {
      return NextResponse.json({ logs: {} });
    }

    const dateRanges = matches.map(m => ({
      start: new Date(m.startDate),
      end: new Date(m.endDate),
    }));
    const overallStart = new Date(Math.min(...dateRanges.map(d => d.start.getTime())));
    const overallEnd = new Date(Math.max(...dateRanges.map(d => d.end.getTime())));

    // Determine target users
    const allPlayerNames = Array.from(new Set(matches.flatMap(m => [m.player1, m.player2])));
    const users = await User.find({ playerName: { $in: allPlayerNames } }).lean();

    console.log("Users found:", users);
    const filteredUsers = userIds.length > 0
      ? users.filter(u => userIds.includes(String(u._id)))
      : users;

      console.log("Filtered users:", filteredUsers);
    await Substance.find({}).lean();
    const logs = await SubstanceLog.find({
      user: { $in: filteredUsers.map(u => u._id) },
      date: { $gte: overallStart, $lte: overallEnd }
    }).populate("substance").lean();
    console.log("Number of logs found for users:", logs.length);
    
    const result: Record<string, { date: string; substance: string; points: number }[]> = {};

    for (const log of logs) {
      const uid = log.user.toString();
      if (!result[uid]) result[uid] = [];
      result[uid].push({
        date: new Date(log.date).toISOString(),
        substance: log.substance?.name || "Unknown",
        points: log.points
      });
    }

    return NextResponse.json({ logs: result });
  } catch (err) {
    console.error("Error in weekly-all logs by userId route:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
