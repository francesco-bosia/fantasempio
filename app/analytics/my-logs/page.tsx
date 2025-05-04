import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import Match from "@/models/match";
import SubstanceLog from "@/models/substance-log";
import SubstanceLogWeekView from "@/components/analytics/SubstanceLogWeekView";
import { PlayerName, PLAYERS } from "@/lib/players";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function MyLogsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <p className="text-center mt-10">Please sign in to view your substance logs.</p>;
  }

  const playerName = session.user?.name as PlayerName;
  if (!playerName || !PLAYERS.includes(playerName)) {
    return <p className="text-center mt-10">Your user is not assigned to a player.</p>;
  }

  await connectToDatabase();

  // ---- Fetch all matches for this user ----
  const allMatches = await Match.find({
    $or: [{ player1: playerName }, { player2: playerName }]
  }).sort({ season: 1, weekNumber: 1 }).lean();

  if (!allMatches.length) {
    return <p className="text-center mt-10">No matches found. Cannot determine available weeks.</p>;
  }

  // Group weeks by season
  const seasons = [...new Set(allMatches.map((m) => m.season))];
  const weeksBySeason: { [season: number]: number[] } = {};
  allMatches.forEach((m) => {
    if (!weeksBySeason[m.season]) weeksBySeason[m.season] = [];
    if (!weeksBySeason[m.season].includes(m.weekNumber)) {
      weeksBySeason[m.season].push(m.weekNumber);
    }
  });


  let currentSeason = seasons[seasons.length - 1];
  let currentWeek = Math.max(...weeksBySeason[currentSeason]);
  // Find the first match where today falls between start and end date
for (const match of allMatches) {
    const start = new Date(match.startDate);
    const end = new Date(match.endDate);
    const today = new Date();
    if (today >= start && today <= end) {
      currentSeason = match.season;
      currentWeek = match.weekNumber;
      break;
    }
  }
  // ---- Fetch logs for all weeks ----
  const allLogs = await SubstanceLog.find({
    user: session.user?.id
  }).populate("substance").lean();
  // Prepare the logs mapped by week and season
  const logsBySeasonWeek: {
    [season: number]: {
      [week: number]: {
        [name: string]: {
          date: string,
          substance: string,
          points: number
        }[]
      }
    }
  } = {};

  for (const match of allMatches) {
    const weekStart = new Date(match.startDate);
    const weekEnd = new Date(match.endDate);

    const weekLogs = allLogs.filter(
      (log) => new Date(log.date) >= weekStart && new Date(log.date) <= weekEnd
    ).map(log => ({
      date: log.date.toISOString(),
      substance: log.substance?.name || "Unknown",
      points: log.points
    }));

    if (!logsBySeasonWeek[match.season]) logsBySeasonWeek[match.season] = {};
    logsBySeasonWeek[match.season][match.weekNumber] = {
      [playerName]: weekLogs
    };
  }

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Your Substance Logs</h1>

      <SubstanceLogWeekView 
        logsBySeasonWeek={logsBySeasonWeek} 
        seasons={seasons} 
        weeksBySeason={weeksBySeason} 
        playerName={playerName}
        defaultSeason={currentSeason}
        defaultWeek={currentWeek}
      />
    </div>
  );
}
