// components/matches/CurrentWeekMatches.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, TrophyIcon, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import type { Match } from "@/app/types/match"

export default function CurrentWeekMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrentMatches = async () => {
      try {
        // Get the current date
        const today = new Date()
        
        // Fetch all active matches
        const response = await fetch(`/api/matches?active=true`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch matches")
        }
        
        const data = await response.json()
        
        // Filter to matches that include the current date
        const currentMatches = data.matches.filter((match: Match) => {
          const startDate = new Date(match.startDate)
          const endDate = new Date(match.endDate)
          return today >= startDate && today <= endDate
        })
        
        setMatches(currentMatches)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching matches")
        console.error("Error fetching current matches:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCurrentMatches()
  }, [])
  
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Current Matches</h2>
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground">
              Unable to load matches: {error}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (matches.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Current Matches</h2>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No matches are currently active.
            </p>
            <Link href="/schedule" className="block mt-4 text-primary hover:underline">
              View full schedule
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Current Matches</h2>
        <Link href="/schedule" className="text-primary hover:underline text-sm flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Full Schedule
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {matches.map(match => (
          <Card key={match._id} className="overflow-hidden">
            <CardHeader className="p-4 bg-muted/30 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Week {match.weekNumber}, Season {match.season}
                </span>
              </div>
              {match.isProcessed ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Completed
                </Badge>
              ) : (
                <Badge variant="secondary">Active</Badge>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-11 items-center gap-2">
                {/* Player 1 */}
                <div className="col-span-5 text-right space-y-1">
                  <div className="font-semibold">{match.player1}</div>
                  <div className="flex flex-wrap justify-end gap-1">
                    {match.isProcessed && match.winner === "player1" && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                        <TrophyIcon className="h-3 w-3 mr-1" /> Winner
                      </Badge>
                    )}
                    {match.isProcessed && match.cleanSheets.player1 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Clean
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Score */}
                <div className="col-span-1 font-mono text-center">
                  {match.isProcessed ? (
                    <div className="flex flex-col items-center">
                      <span className="font-bold">
                        {match.player1Points}-{match.player2Points}
                      </span>
                      {match.winner === "draw" && (
                        <Badge variant="outline" className="text-xs mt-1">Draw</Badge>
                      )}
                    </div>
                  ) : (
                    "vs"
                  )}
                </div>
                
                {/* Player 2 */}
                <div className="col-span-5 text-left space-y-1">
                  <div className="font-semibold">{match.player2}</div>
                  <div className="flex flex-wrap gap-1">
                    {match.isProcessed && match.winner === "player2" && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                        <TrophyIcon className="h-3 w-3 mr-1" /> Winner
                      </Badge>
                    )}
                    {match.isProcessed && match.cleanSheets.player2 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Clean
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground text-center">
                {format(new Date(match.startDate), "MMM d")} - {format(new Date(match.endDate), "MMM d")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}