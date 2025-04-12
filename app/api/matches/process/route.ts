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

    const { matchId } = await req.json()

    if (!matchId) {
      return NextResponse.json({ message: "Match ID is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Find the match
    const match = await Match.findById(matchId)
    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }

    if (match.isProcessed) {
      return NextResponse.json({ message: "Match already processed" }, { status: 400 })
    }

    // Get users for both players
    const player1User = await User.findOne({ playerName: match.player1 })
    const player2User = await User.findOne({ playerName: match.player2 })

    if (!player1User || !player2User) {
      return NextResponse.json({ message: "One or both players not found" }, { status: 404 })
    }

    // Get substance logs for the match period
    const player1Logs = await SubstanceLog.find({
      user: player1User._id,
      date: {
        $gte: match.startDate,
        $lte: match.endDate,
      },
    }).populate("substance")

    const player2Logs = await SubstanceLog.find({
      user: player2User._id,
      date: {
        $gte: match.startDate,
        $lte: match.endDate,
      },
    }).populate("substance")

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

    return NextResponse.json({
      message: "Match processed successfully",
      match,
    })
  } catch (error) {
    console.error("Process match error:", error)
    return NextResponse.json({ message: "Error processing match" }, { status: 500 })
  }
}
