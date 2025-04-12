import { NextResponse } from "next/server"
import { generateMatchSchedule } from "@/lib/match-scheduler"
import { validateMatchSchedule } from "@/lib/match-validator"
import { isAdmin } from "@/lib/auth-utils"

export async function POST(req: Request) {
  try {
    // Check if user is admin
    if (!(await isAdmin(req))) {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { startDate, players } = await req.json()

    if (!startDate || !players || !Array.isArray(players)) {
      return NextResponse.json({ message: "Start date and players array are required" }, { status: 400 })
    }

    // Generate match schedule
    const schedule = generateMatchSchedule(new Date(startDate), players)

    // Validate the schedule
    const isValid = validateMatchSchedule(schedule, players)

    // Analyze the schedule
    const analysis = analyzeSchedule(schedule, players)

    return NextResponse.json({
      isValid,
      schedule,
      analysis,
    })
  } catch (error) {
    console.error("Test schedule error:", error)
    return NextResponse.json({ message: "Error testing schedule", error: String(error) }, { status: 500 })
  }
}

function analyzeSchedule(schedule: any[], players: string[]) {
  // Count how many times each player plays against each other player
  const matchups: Record<string, Record<string, number>> = {}

  // Initialize matchups
  for (const player1 of players) {
    matchups[player1] = {}
    for (const player2 of players) {
      if (player1 !== player2) {
        matchups[player1][player2] = 0
      }
    }
  }

  // Count matchups
  for (const week of schedule) {
    for (const match of week.matches) {
      matchups[match.player1][match.player2] = (matchups[match.player1][match.player2] || 0) + 1
      matchups[match.player2][match.player1] = (matchups[match.player2][match.player1] || 0) + 1
    }
  }

  // Check if each player plays against every other player
  const missingMatchups: string[] = []
  for (const player1 of players) {
    for (const player2 of players) {
      if (player1 !== player2 && matchups[player1][player2] === 0) {
        missingMatchups.push(`${player1} vs ${player2}`)
      }
    }
  }

  return {
    matchups,
    missingMatchups,
    totalWeeks: schedule.length,
    matchesPerWeek: schedule[0]?.matches.length || 0,
  }
}
