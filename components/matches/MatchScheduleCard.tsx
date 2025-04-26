// components/matches/MatchScheduleCard.tsx
"use client"

import { useState } from "react"
import type { Match } from "@/app/types/match"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { groupBy } from "lodash"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { TrophyIcon, ShieldCheck } from "lucide-react"

export default function MatchScheduleCard({ matches, loading }: { matches: Match[], loading: boolean }) {
  const [seasonFilter, setSeasonFilter] = useState<string>("all")
  const [playerFilter, setPlayerFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Get unique seasons for filter
  const seasons = Array.from(new Set(matches.map(m => m.season))).sort((a, b) => a - b)
  
  // Apply filters
  const filteredMatches = matches.filter(match => {
    // Season filter
    if (seasonFilter !== "all" && match.season !== parseInt(seasonFilter)) {
      return false
    }
    
    // Player filter
    if (playerFilter && !match.player1.toLowerCase().includes(playerFilter.toLowerCase()) && 
        !match.player2.toLowerCase().includes(playerFilter.toLowerCase())) {
      return false
    }
    
    // Status filter
    if (statusFilter === "completed" && !match.isProcessed) {
      return false
    }
    if (statusFilter === "active" && (match.isProcessed || !match.isActive)) {
      return false
    }
    
    return true
  })
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const matchesBySeason = groupBy(filteredMatches, 'season');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Match Schedule</span>
          <span className="text-sm font-normal">
            {filteredMatches.length} matches
          </span>
        </CardTitle>
        <CardDescription>All matches grouped by season and week</CardDescription>
      </CardHeader>
      
      <div className="px-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Select value={seasonFilter} onValueChange={setSeasonFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {seasons.map(season => (
                <SelectItem key={season} value={season.toString()}>
                  Season {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Input 
            placeholder="Filter by player name"
            value={playerFilter}
            onChange={(e) => setPlayerFilter(e.target.value)}
          />
        </div>
        
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <CardContent>
        {Object.entries(matchesBySeason).length > 0 ? (
          Object.entries(matchesBySeason)
            .sort(([seasonA], [seasonB]) => parseInt(seasonA) - parseInt(seasonB))
            .map(([season, seasonMatches]) => {
              const matchesByWeek = groupBy(seasonMatches, 'weekNumber');
              
              return (
                <div key={season} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Badge variant="outline" className="mr-2">Season {season}</Badge>
                  </h3>
                  
                  {Object.entries(matchesByWeek)
                    .sort(([weekA], [weekB]) => parseInt(weekA) - parseInt(weekB))
                    .map(([week, weekMatches]) => (
                      <div key={week} className="mb-6">
                        <h4 className="text-md font-medium mb-2 text-muted-foreground">Week {week}</h4>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[180px]">Period</TableHead>
                                <TableHead>Player 1</TableHead>
                                <TableHead className="text-center w-[100px]">Score</TableHead>
                                <TableHead>Player 2</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {weekMatches.map(match => {
                                const isProcessed = match.isProcessed;
                                
                                return (
                                  <TableRow key={match._id}>
                                    <TableCell className="font-mono text-xs">
                                      {format(new Date(match.startDate), "MMM d")} - {format(new Date(match.endDate), "MMM d")}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <span className={match.winner === "player1" ? "font-bold" : ""}>
                                          {match.player1}
                                        </span>
                                        
                                        {match.winner === "player1" && (
                                          <TrophyIcon className="h-4 w-4 text-amber-500" />
                                        )}
                                        
                                        {isProcessed && match.cleanSheets.player1 && (
                                          <ShieldCheck className="h-4 w-4 text-blue-500" />
                                        )}
                                        
                                        {isProcessed && (
                                          <span className="text-xs text-muted-foreground ml-1">
                                            ({match.leaguePoints.player1})
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono">
                                      {isProcessed ? (
                                        `${match.player1Points}-${match.player2Points}`
                                      ) : (
                                        "-"
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <span className={match.winner === "player2" ? "font-bold" : ""}>
                                          {match.player2}
                                        </span>
                                        
                                        {match.winner === "player2" && (
                                          <TrophyIcon className="h-4 w-4 text-amber-500" />
                                        )}
                                        
                                        {isProcessed && match.cleanSheets.player2 && (
                                          <ShieldCheck className="h-4 w-4 text-blue-500" />
                                        )}
                                        
                                        {isProcessed && (
                                          <span className="text-xs text-muted-foreground ml-1">
                                            ({match.leaguePoints.player2})
                                          </span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {isProcessed ? (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                          Completed
                                        </Badge>
                                      ) : match.isActive ? (
                                        <Badge variant="secondary">Active</Badge>
                                      ) : (
                                        <Badge variant="outline">Inactive</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ))}
                </div>
              )
            })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No matches found matching the current filters.
          </div>
        )}
      </CardContent>
    </Card>
  )
}