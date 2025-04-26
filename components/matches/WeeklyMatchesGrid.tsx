// components/matches/WeeklyMatchesGrid.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MatchCard from "./MatchCard"
import { Skeleton } from "@/components/ui/skeleton"
import type { Match } from "@/app/types/match"

interface WeeklyMatchesGridProps {
  matches: Match[]
  loading?: boolean
  title?: string
  onUpdateScore?: (matchId: string, score1: number, score2: number) => Promise<void>
  editable?: boolean
  initialSeason?: string
  initialWeek?: string
}

export default function WeeklyMatchesGrid({ 
  matches,
  loading = false,
  title = "Weekly Matches",
  onUpdateScore,
  editable = false,
  initialSeason,
  initialWeek
}: WeeklyMatchesGridProps) {
  // Get unique seasons and weeks
  const seasons = Array.from(new Set(matches.map(m => m.season))).sort((a, b) => a - b)
  
  const [selectedSeason, setSelectedSeason] = useState<string>(
    initialSeason || (seasons.length > 0 ? seasons[seasons.length - 1].toString() : "1")
  )
  
  // Get weeks for the selected season
  const weeksInSeason = Array.from(
    new Set(
      matches
        .filter(m => m.season.toString() === selectedSeason)
        .map(m => m.weekNumber)
    )
  ).sort((a, b) => a - b)

  const [selectedWeek, setSelectedWeek] = useState<string>(
    initialWeek || "1"
  )
  
  // Filter matches by selected season and week
  const filteredMatches = matches.filter(
    m => m.season.toString() === selectedSeason && m.weekNumber.toString() === selectedWeek
  )
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <CardTitle>{title}</CardTitle>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map(season => (
                <SelectItem key={season} value={season.toString()}>Season {season}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue placeholder="Week" />
            </SelectTrigger>
            <SelectContent>
              {weeksInSeason.map(week => (
                <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMatches.map(match => (
              <MatchCard 
                key={match._id}
                match={match}
                onUpdateScore={onUpdateScore}
                editable={editable}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            No matches found for Week {selectedWeek}, Season {selectedSeason}
          </div>
        )}
      </CardContent>
    </Card>
  )
}