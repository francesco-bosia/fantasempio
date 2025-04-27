import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Match from "@/models/match"
import User from "@/models/user"
import { generateMatchSchedule } from "@/lib/match-scheduler"
import { validateMatchSchedule } from "@/lib/match-validator"
import { isAdmin } from "@/lib/auth-utils"
import { PLAYERS } from "@/lib/players"

// Define a more specific type for query fields
type MatchQueryFields = {
  isActive?: boolean;
  $or?: Array<{ player1: string } | { player2: string }>;
  weekNumber?: number;
  season?: number;
}

// GET: Fetch matches (public)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const active = url.searchParams.get("active")
    const player = url.searchParams.get("player")
    const week = url.searchParams.get("week")
    const season = url.searchParams.get("season")

    await connectToDatabase()

    // Create the query object with the proper type
    const query: MatchQueryFields = {}

    if (active === "true") {
      query.isActive = true
    }

    if (player) {
      query.$or = [{ player1: player }, { player2: player }]
    }

    if (week) {
      query.weekNumber = Number.parseInt(week)
    }

    if (season) {
      query.season = Number.parseInt(season)
    }

    const matches = await Match.find(query).sort({ startDate: 1 })

    return NextResponse.json({ matches })
  } catch (error) {
    console.error("Get matches error:", error)
    return NextResponse.json({ message: "Error fetching matches" }, { status: 500 })
  }
}

// POST: Generate matches for a season (admin only)
export async function POST(req: Request) {
  try {
    // Check if user is admin
    if (!(await isAdmin(req))) {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { startDate, season = 1 } = await req.json()

    if (!startDate) {
      return NextResponse.json({ message: "Start date is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Get all registered players from the database
    const users = await User.find({}, "playerName")
    const playerNames = users.map((user) => user.playerName)

    console.log("Registered players:", playerNames)
    console.log("Actual players:", PLAYERS)

    const players2 = PLAYERS


    // Generate match schedule with players from the database
    const schedule = generateMatchSchedule(new Date(startDate), players2, season)
    console.log("Schedule:", schedule)


    // Validate the schedule
    const isValid = validateMatchSchedule(schedule, playerNames)
    if (!isValid) {
      return NextResponse.json({ message: "Failed to generate a valid match schedule" }, { status: 500 })
    }

    // Check if matches already exist for this season
    const existingMatches = await Match.find({ season })
    if (existingMatches.length > 0) {
      return NextResponse.json({ message: "Matches already exist for this season" }, { status: 400 })
    }

    // Create matches in database
    const matchesToCreate = schedule.flatMap((week) =>
      week.matches.map((match) => ({
        player1: match.player1,
        player2: match.player2,
        startDate: match.startDate,
        endDate: match.endDate,
        weekNumber: week.weekNumber,
        season: week.season,
      })),
    )

    const createdMatches = await Match.insertMany(matchesToCreate)

    console.log("Matches created:", matchesToCreate)

    return NextResponse.json(
      {
        message: "Matches generated successfully",
        matchesCreated: createdMatches.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Generate matches error:", error)
    return NextResponse.json({ message: "Error generating matches" }, { status: 500 })
  }
}