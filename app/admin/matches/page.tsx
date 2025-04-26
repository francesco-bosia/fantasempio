// app/admin/matches/page.tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GenerateMatchesCard from "@/components/matches/GenerateMatchesCard"
import ProcessMatchesCard from "@/components/matches/ProcessMatchesCard"
import MatchScheduleCard from "@/components/matches/MatchScheduleCard"
import WeeklyMatchesGrid from "@/components/matches/WeeklyMatchesGrid"
import LeagueStandingsCard from "@/components/standings/LeagueStandingsCard"
import CreateMatchForm from "@/components/matches/CreateMatchForm"

import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

import type { Match } from "@/app/types/match"

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSeason, setCurrentSeason] = useState("1")
  const [stats, setStats] = useState({
    totalMatches: 0,
    completedMatches: 0,
    pendingMatches: 0,
    currentSeason: 1,
    uniqueSeasons: [1]
  })

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/matches")
      const data = await res.json()
      setMatches(data.matches)
      
      // Calculate stats
      const completed = data.matches.filter((m: Match) => m.isProcessed).length
      
      const uniqueSeasons = [...new Set(data.matches.map((m: Match) => m.season))].sort((a, b) => (a as number) - (b as number)) as number[]
      const currentSeason = uniqueSeasons.length > 0 ? Math.max(...uniqueSeasons) : 1
      
      setStats({
        totalMatches: data.matches.length,
        completedMatches: completed,
        pendingMatches: data.matches.length - completed,
        currentSeason,
        uniqueSeasons
      })
      
      // Set the current season for standings
      setCurrentSeason(currentSeason.toString())
      
    } catch (error) {
      toast.error("Failed to fetch matches: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }
  
  const handleUpdateScore = async (matchId: string, score1: number, score2: number) => {
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player1Points: score1, player2Points: score2 }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to update score")
      }
      
      toast.success("Score updated successfully")
      
      // Update matches in state
      setMatches(prev => 
        prev.map(match => 
          match._id === matchId 
            ? { ...match, player1Points: score1, player2Points: score2 } 
            : match
        )
      )
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update score")
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Match Management</h1>
        
        {loading ? (
          <div className="flex items-center text-muted-foreground mt-2 md:mt-0">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading match data...
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <Badge variant="outline" className="text-sm">
              Season {stats.currentSeason}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {stats.totalMatches} Matches
            </Badge>
            <Badge variant="default" className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              {stats.completedMatches} Completed
            </Badge>
            <Badge variant="outline" className="text-sm">
              {stats.pendingMatches} Pending
            </Badge>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="current">Current Week</TabsTrigger>
          <TabsTrigger value="generate">Generate Matches</TabsTrigger>
          <TabsTrigger value="process">Process Results</TabsTrigger>
          <TabsTrigger value="schedule">Full Schedule</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="create">Create Match</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <WeeklyMatchesGrid 
            matches={matches} 
            loading={loading}
            title="Current Week Matches"
            onUpdateScore={handleUpdateScore}
            editable={true}
          />
        </TabsContent>

        <TabsContent value="generate" className="mt-6">
          <GenerateMatchesCard onGenerate={fetchMatches} />
        </TabsContent>

        <TabsContent value="process" className="mt-6">
          <ProcessMatchesCard onProcess={fetchMatches} />
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <MatchScheduleCard matches={matches} loading={loading} />
        </TabsContent>
        
        <TabsContent value="standings" className="mt-6">
          <LeagueStandingsCard 
            matches={matches}
            season={currentSeason}
            onSeasonChange={setCurrentSeason}
            seasons={stats.uniqueSeasons}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <CreateMatchForm onSuccess={fetchMatches} />
        </TabsContent>
        
      </Tabs>
    </div>
  )
}