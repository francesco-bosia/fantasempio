import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import SubstanceLog from "@/models/substance-log"
import User from "@/models/user"
import Substance from "@/models/substance"

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { substanceId, date } = await req.json()

    if (!substanceId || !date) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Get user ID
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get substance from database
    const substance = await Substance.findById(substanceId)
    if (!substance) {
      return NextResponse.json({ message: "Substance not found" }, { status: 404 })
    }

    // Create substance log
    const log = await SubstanceLog.create({
      user: user._id,
      substance: substance._id,
      date: new Date(date),
      points: substance.points,
    })

    return NextResponse.json(
      {
        message: "Substance log created successfully",
        log,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Substance log error:", error)
    return NextResponse.json({ message: "Error creating substance log" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    await connectToDatabase()

    const query: any = {}

    if (userId) {
      query.user = userId
    } else {
      // Get user ID
      const user = await User.findOne({ email: session.user.email })
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 })
      }
      query.user = user._id
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    // Populate the substance reference to get the substance details
    const logs = await SubstanceLog.find(query).populate("substance", "name points category").sort({ date: -1 })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Get substance logs error:", error)
    return NextResponse.json({ message: "Error fetching substance logs" }, { status: 500 })
  }
}
