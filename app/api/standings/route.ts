import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/user"
import Match from "@/models/match"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const season = url.searchParams.get("season") || "1"

    await connectToDatabase()

    // Get all users
    const users = await User.find({}, "name playerName")

    // Get all processed matches for the season
    const matches = await Match.find({
      season: Number(season),
      isProcessed: true,
    })

    // Calculate standings
    const standings = users.map((user) => {
      const playerMatches = matches.filter(
        (match) => match.player1 === user.playerName || match.player2 === user.playerName,
      )

      let points = 0
      let wins = 0
      let draws = 0
      let losses = 0
      let substancePoints = 0

      playerMatches.forEach((match) => {
        if (user.playerName === match.player1) {
          points += match.leaguePoints.player1
          substancePoints += match.player1Points
          if (match.winner === "player1") wins++
          else if (match.winner === "player2") losses++
          else if (match.winner === "draw") draws++
        } else {
          points += match.leaguePoints.player2
          substancePoints += match.player2Points
          if (match.winner === "player2") wins++
          else if (match.winner === "player1") losses++
          else if (match.winner === "draw") draws++
        }
      })

      return {
        id: user._id,
        name: user.name,
        playerName: user.playerName,
        points,
        played: wins + draws + losses,
        wins,
        draws,
        losses,
        substancePoints,
      }
    })

    // Sort by points (descending) and then by substance points (ascending)
    standings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points
      }
      return a.substancePoints - b.substancePoints
    })
    
    const rankedStandings = standings.map((player, index) => ({
      ...player,
      rank: index + 1,
    }))
    
    return NextResponse.json({ standings: rankedStandings })

  } catch (error) {
    console.error("Get standings error:", error)
    return NextResponse.json({ message: "Error fetching standings" }, { status: 500 })
  }
}
