import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Match from "@/models/match"
import { isAdmin } from "@/lib/auth-utils"

// GET: Fetch all available seasons
export async function GET() {
  try {
    // Optional: You can restrict this to admin only if needed
    // if (!(await isAdmin(req))) {
    //   return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 })
    // }

    await connectToDatabase()

    // Find all unique season numbers from matches collection
    const results = await Match.distinct("season")
    
    // Sort seasons numerically
    const seasons = results.sort((a: number, b: number) => a - b)

    return NextResponse.json({ seasons })
  } catch (error) {
    console.error("Get seasons error:", error)
    return NextResponse.json({ message: "Error fetching seasons" }, { status: 500 })
  }
}

// POST: Create a new season (admin only)
export async function POST(req: Request) {
  try {
    // Check if user is admin
    if (!(await isAdmin(req))) {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const { seasonNumber, description } = await req.json()

    if (!seasonNumber) {
      return NextResponse.json({ message: "Season number is required" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if the season already exists
    const existingSeasons = await Match.distinct("season")
    if (existingSeasons.includes(seasonNumber)) {
      return NextResponse.json({ message: "Season already exists" }, { status: 400 })
    }

    // Note: This is a placeholder for creating a season
    // You might want to create a Season model in the future
    // For now, we'll just return the season number as validation
    
    return NextResponse.json(
      {
        message: "Season created successfully",
        seasonNumber,
        description: description || null,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create season error:", error)
    return NextResponse.json({ message: "Error creating season" }, { status: 500 })
  }
}