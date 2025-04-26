import { NextResponse } from "next/server"
import { PLAYERS } from "@/lib/players"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/user"

export async function GET(req: Request) {
  try {
    await connectToDatabase()

    // Get all users with their player names
    const users = await User.find({}, "name email playerName")

    const takenPlayerNames = users.map((user: { playerName: string }) => user.playerName)
    const available = PLAYERS.filter((player) => !takenPlayerNames.includes(player))
    return NextResponse.json({ available })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 })
  }
}