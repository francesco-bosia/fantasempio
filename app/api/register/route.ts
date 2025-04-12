import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/user"

export async function POST(req: Request) {
  try {
    const { email, password, playerName, name } = await req.json()

    if (!email || !password || !playerName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Check if player name is already taken
    const existingPlayerName = await User.findOne({ playerName })
    if (existingPlayerName) {
      return NextResponse.json({ message: "Player name already taken" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user - use playerName as name if no name is provided
    const user = await User.create({
      name: name || playerName, // Use playerName as name if no name is provided
      email,
      password: hashedPassword,
      playerName,
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          playerName: user.playerName,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Error creating user" }, { status: 500 })
  }
}
