import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/user"
import SubstanceLog from "@/models/substance-log"

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const period = url.searchParams.get("period") || "week"

    await connectToDatabase()

    // Get user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    if (period === "week") {
      startDate.setDate(endDate.getDate() - 7)
    } else if (period === "month") {
      startDate.setMonth(endDate.getMonth() - 1)
    } else if (period === "year") {
      startDate.setFullYear(endDate.getFullYear() - 1)
    }

    // Get substance logs with populated substance data
    const logs = await SubstanceLog.find({
      user: user._id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("substance", "name points category")
      .sort({ date: 1 })

    // Group by substance
    const substanceStats = logs.reduce(
      (acc, log) => {
        const substanceId = log.substance._id.toString()

        if (!acc[substanceId]) {
          acc[substanceId] = {
            count: 0,
            totalPoints: 0,
            name: log.substance.name,
          }
        }

        acc[substanceId].count++
        acc[substanceId].totalPoints += log.points

        return acc
      },
      {} as Record<string, { count: number; totalPoints: number; name: string }>,
    )

    // Group by date
    const dateStats = logs.reduce(
      (acc, log) => {
        const dateStr = log.date.toISOString().split("T")[0]
        const substanceId = log.substance._id.toString()

        if (!acc[dateStr]) {
          acc[dateStr] = {
            totalPoints: 0,
            substances: {},
          }
        }

        acc[dateStr].totalPoints += log.points

        if (!acc[dateStr].substances[substanceId]) {
          acc[dateStr].substances[substanceId] = {
            count: 0,
            points: 0,
            name: log.substance.name,
          }
        }

        acc[dateStr].substances[substanceId].count++
        acc[dateStr].substances[substanceId].points += log.points

        return acc
      },
      {} as Record<
        string,
        {
          totalPoints: number
          substances: Record<string, { count: number; points: number; name: string }>
        }
      >,
    )

    return NextResponse.json({
      substanceStats,
      dateStats,
      totalLogs: logs.length,
      totalPoints: logs.reduce((sum, log) => sum + log.points, 0),
    })
  } catch (error) {
    console.error("Get statistics error:", error)
    return NextResponse.json({ message: "Error fetching statistics" }, { status: 500 })
  }
}
