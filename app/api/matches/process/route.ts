import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Match from "@/models/match"
import User from "@/models/user"
import Substance from "@/models/substance"
import SubstanceLog from "@/models/substance-log"
import { isAdmin } from "@/lib/auth-utils"
import { endOfDay, isBefore } from "date-fns"

export async function POST(req: Request) {
  try {
    if (!(await isAdmin(req))) {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 })
    }

    await connectToDatabase()

    const { weekNumber, season = 1 } = await req.json()
    const now = new Date()

    const allSubstances = await Substance.find({})
    const cleanSheetBonus = allSubstances.find((s) => s.name === "Clean sheet")?.points ?? -1

    const harmfulSubstances = allSubstances.filter((s) => s.points > 0).map((s) => s._id.toString())

    // Get unprocessed matches
    let matchesToProcess = []
    if (weekNumber) {
      matchesToProcess = await Match.find({
        weekNumber: Number.parseInt(weekNumber),
        season: Number.parseInt(season),
        isProcessed: false,
      })
    } else {
      const allUnprocessed = await Match.find({ isProcessed: false, season: Number.parseInt(season) })
      matchesToProcess = allUnprocessed.filter((match) => isBefore(new Date(match.endDate), endOfDay(now)))
    }

    if (matchesToProcess.length === 0) {
      return NextResponse.json({ message: "No unprocessed matches found" }, { status: 200 })
    }

    const results = []

    for (const match of matchesToProcess) {
      const [player1User, player2User] = await Promise.all([
        User.findOne({ playerName: match.player1 }),
        User.findOne({ playerName: match.player2 }),
      ])

      if (!player1User || !player2User) continue

      const [player1Logs, player2Logs] = await Promise.all([
        SubstanceLog.find({ user: player1User._id, date: { $gte: match.startDate, $lte: match.endDate } }),
        SubstanceLog.find({ user: player2User._id, date: { $gte: match.startDate, $lte: match.endDate } }),
      ])

      let player1Points = player1Logs.reduce((sum, log) => sum + log.points, 0)
      let player2Points = player2Logs.reduce((sum, log) => sum + log.points, 0)

      const usedHarmful1 = player1Logs.some((log) => harmfulSubstances.includes(log.substance.toString()))
      const usedHarmful2 = player2Logs.some((log) => harmfulSubstances.includes(log.substance.toString()))

      match.cleanSheets = { player1: false, player2: false }

      if (!usedHarmful1) {
        player1Points += cleanSheetBonus
        match.cleanSheets.player1 = true
      }

      if (!usedHarmful2) {
        player2Points += cleanSheetBonus
        match.cleanSheets.player2 = true
      }

      match.player1Points = player1Points
      match.player2Points = player2Points

      match.calculateResult()
      await match.save()

      results.push({
        matchId: match._id.toString(),
        week: match.weekNumber,
        player1: match.player1,
        player2: match.player2,
        player1Points,
        player2Points,
        winner:
          match.winner === "draw"
            ? "Draw"
            : match.winner === "player1"
              ? match.player1
              : match.player2,
        cleanSheets: match.cleanSheets,
      })
    }

    return NextResponse.json({
      message: `Processed ${results.length} match(es)`,
      results,
    })
  } catch (error) {
    console.error("Process week error:", error)
    return NextResponse.json({ message: "Error processing week" }, { status: 500 })
  }
}
