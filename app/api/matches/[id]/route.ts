import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Match from "@/models/match"
import { isAdmin } from "@/lib/auth-utils"

// GET: Fetch a specific match by ID
export async function GET(
    req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ message: "Match ID is required" }, { status: 400 })
    }
    
    await connectToDatabase()
    
    const match = await Match.findById(id)
    
    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }
    
    return NextResponse.json({ match })
  } catch (error) {
    console.error("Get match error:", error)
    return NextResponse.json({ message: "Error fetching match" }, { status: 500 })
  }
}

// PATCH: Update a specific match
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    if (!(await isAdmin(req))) {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 })
    }
    
    const { id } = await params
    const data = await req.json()
    
    await connectToDatabase()
    
    // Find the match by ID
    const match = await Match.findById(id)
    
    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }
    
    // Update allowed fields
    const allowedFields = [
      'player1Points', 'player2Points', 'isActive', 'isProcessed',
      'startDate', 'endDate', 'weekNumber'
    ]
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        match[field] = data[field]
      }
    })
    
    // If match points were updated, recalculate the result
    if (data.player1Points !== undefined || data.player2Points !== undefined) {
      // Only recalculate if both points are set
      if (match.player1Points !== null && match.player2Points !== null) {
        match.calculateResult()
      }
    }
    
    await match.save()
    
    return NextResponse.json({
      message: "Match updated successfully",
      match
    })
  } catch (error) {
    console.error("Update match error:", error)
    return NextResponse.json({ message: "Error updating match" }, { status: 500 })
  }
}

// DELETE: Delete a specific match
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    if (!(await isAdmin(req))) {
      return NextResponse.json({ message: "Unauthorized: Admin access required" }, { status: 403 })
    }
    
    const { id } = await params
    
    await connectToDatabase()
    
    const match = await Match.findByIdAndDelete(id)
    
    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      message: "Match deleted successfully"
    })
  } catch (error) {
    console.error("Delete match error:", error)
    return NextResponse.json({ message: "Error deleting match" }, { status: 500 })
  }
}