import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/models/user"

export async function isAdmin(req?: Request) {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return false
    }

    await connectToDatabase()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return false
    }

    return user.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function getUserRole() {
  try {
    const session = await getServerSession()

    if (!session || !session.user) {
      return null
    }

    await connectToDatabase()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return null
    }

    return user.role
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}
