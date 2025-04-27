import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/user"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get all users with their player names
    const users = await User.find({}, "name email playerName")

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 })
  }
}
