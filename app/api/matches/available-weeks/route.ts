import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Match from "@/models/match"

// GET: Fetch all available weeks for a given season
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const season = url.searchParams.get("season")
    
    if (!season) {
      return NextResponse.json({ message: "Season parameter is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Basic query to get all weeks for the season
    const query = { season: Number.parseInt(season) }
    
    // Find all unique week numbers for the specified season
    const results = await Match.distinct("weekNumber", query)
    
    // Find unprocessed weeks (weeks that have matches not yet processed)
    const unprocessedQuery = { 
      season: Number.parseInt(season),
      isProcessed: false
    }
    const unprocessedWeeks = await Match.distinct("weekNumber", unprocessedQuery)
    
    // Sort weeks numerically
    const weeks = results.sort((a: number, b: number) => a - b)
    
    return NextResponse.json({ 
      weeks,
      unprocessedWeeks,
      totalWeeks: weeks.length
    })
  } catch (error) {
    console.error("Get available weeks error:", error)
    return NextResponse.json({ message: "Error fetching available weeks" }, { status: 500 })
  }
}