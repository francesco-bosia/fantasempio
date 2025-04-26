// app/schedule/SchedulePageContent.tsx
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import WeeklyMatchesGrid from "@/components/matches/WeeklyMatchesGrid"
import MatchScheduleCard from "@/components/matches/MatchScheduleCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Match } from "@/app/types/match"

export default function SchedulePageContent() {
  const { data: session } = useSession()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [myMatches, setMyMatches] = useState<Match[]>([])
  
  const fetchMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/matches")
      const data = await res.json()
      setMatches(data.matches)
      
      // Filter matches for the current player if logged in
      if (session?.user?.playerName) {
        const playerName = session.user.playerName
        setMyMatches(data.matches.filter((m: Match) => 
          m.player1 === playerName || m.player2 === playerName
        ))
      }
    } catch (error) {
      toast.error("Failed to fetch matches: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchMatches()
  }, [session])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No matches have been scheduled yet.</p>
        </CardContent>
      </Card>
    )
  }
  
  const currentDate = new Date()
  
  // Find current week's matches
  const currentWeekMatches = matches.filter(match => {
    const startDate = new Date(match.startDate)
    const endDate = new Date(match.endDate)
    return currentDate >= startDate && currentDate <= endDate
  })
  
  // Find the current season and week
  let currentSeason = "1"
  let currentWeek = "1"
  
  if (currentWeekMatches.length > 0) {
    currentSeason = currentWeekMatches[0].season.toString()
    currentWeek = currentWeekMatches[0].weekNumber.toString()
  } else {
    // If no current matches, use the latest season and week
    const seasons = [...new Set(matches.map(m => m.season))].sort((a, b) => b - a)
    if (seasons.length > 0) {
      currentSeason = seasons[0].toString()
      const weeksInSeason = [...new Set(
        matches.filter(m => m.season.toString() === currentSeason)
          .map(m => m.weekNumber)
      )].sort((a, b) => a - b)
      
      if (weeksInSeason.length > 0) {
        currentWeek = weeksInSeason[0].toString()
      }
    }
  }
  
  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="current">Current Week</TabsTrigger>
        <TabsTrigger value="all">All Matches</TabsTrigger>
      </TabsList>
      
      <TabsContent value="current">
        <WeeklyMatchesGrid 
          matches={matches}
          loading={false}
          title="Current Week Matches"
          initialSeason={currentSeason}
          initialWeek={currentWeek}
        />
      </TabsContent>
      
      <TabsContent value="all">
        <MatchScheduleCard matches={matches} loading={false} />
      </TabsContent>
    </Tabs>
  )
}