import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/user"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return NextResponse.json({ isAdmin: false })
    }

    await connectToDatabase()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ isAdmin: false })
    }

    return NextResponse.json({ isAdmin: user.role === "admin" })
  } catch (error) {
    console.error("Check admin error:", error)
    return NextResponse.json({ isAdmin: false })
  }
}
