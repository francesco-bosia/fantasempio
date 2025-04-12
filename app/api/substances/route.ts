import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import Substance from "@/models/substance"

export async function GET(req: Request) {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get all active substances
    const substances = await Substance.find({ isActive: true }).sort({ category: 1, name: 1 })

    return NextResponse.json({ substances })
  } catch (error) {
    console.error("Get substances error:", error)
    return NextResponse.json({ message: "Error fetching substances" }, { status: 500 })
  }
}
