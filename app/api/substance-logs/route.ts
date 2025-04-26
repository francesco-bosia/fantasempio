import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import SubstanceLog from "@/models/substance-log"
import User from "@/models/user"
import Substance from "@/models/substance"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(auth)
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    const { substanceId, date, quantity = 1 } = await req.json()
    
    if (!substanceId || !date) {
      return NextResponse.json({ message: "Substance ID and date are required" }, { status: 400 })
    }
    
    await connectToDatabase()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }
    
    const substance = await Substance.findById(substanceId)
    
    if (!substance) {
      return NextResponse.json({ message: "Substance not found" }, { status: 404 })
    }
    
    // Create an array to store the created logs
    const createdLogs = []
    
    // Create multiple substance log entries based on the quantity
    for (let i = 0; i < quantity; i++) {
      const newLog = new SubstanceLog({
        user: user._id,
        substance: substanceId,
        date: new Date(date),
        points: substance.points,
        // Keep quantity as 1 for each entry
        quantity: 1
      })
      
      await newLog.save()
      createdLogs.push(newLog)
    }
    
    return NextResponse.json({
      message: `${quantity} substance log(s) created successfully`,
      logs: createdLogs
    }, { status: 201 })
    
  } catch (error) {
    console.error("Error creating substance log:", error)
    return NextResponse.json({ message: "Failed to create substance log" }, { status: 500 })
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
