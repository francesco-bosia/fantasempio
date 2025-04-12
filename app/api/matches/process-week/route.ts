import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Match from "@/models/match"
import User from "@/models/user"
import SubstanceLog from "@/models/substance-log"
import { isAdmin } from "@/lib/auth-utils"

export async function POST(req: Request) {
  try {
    // Check if user is admin
    if (!(await isAdmin(req))) {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { weekNumber, season = 1 } = await req.json()

    if (!weekNumber) {
      return NextResponse.json({ message: "Week number is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Find all matches for the week
    const matches = await Match.find({
      weekNumber: Number.parseInt(weekNumber),
      season: Number.parseInt(season),
      isProcessed: false,
    })

    if (matches.length === 0) {
      return NextResponse.json({ message: "No unprocessed matches found for this week" }, { status: 404 })
    }

    const processedMatches = []

    // Process each match
    for (const match of matches) {
      // Get users for both players
      const player1User = await User.findOne({ playerName: match.player1 })
      const player2User = await User.findOne({ playerName: match.player2 })

      if (!player1User || !player2User) {
        continue // Skip this match if players not found
      }

      // Get substance logs for the match period
      const player1Logs = await SubstanceLog.find({
        user: player1User._id,
        date: {
          $gte: match.startDate,
          $lte: match.endDate,
        },
      })

      const player2Logs = await SubstanceLog.find({
        user: player2User._id,
        date: {
          $gte: match.startDate,
          $lte: match.endDate,
        },
      })

      // Calculate total points
      const player1Points = player1Logs.reduce((sum, log) => sum + log.points, 0)
      const player2Points = player2Logs.reduce((sum, log) => sum + log.points, 0)

      // Update match with points
      match.player1Points = player1Points
      match.player2Points = player2Points

      // Calculate winner and league points
      match.calculateResult()

      // Save the match
      await match.save()
      processedMatches.push(match)
    }

    return NextResponse.json({
      message: "Matches processed successfully",
      matchesProcessed: processedMatches.length,
    })
  } catch (error) {
    console.error("Process week error:", error)
    return NextResponse.json({ message: "Error processing week" }, { status: 500 })
  }
}
