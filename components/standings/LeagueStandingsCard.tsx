// components/standings/LeagueStandingsCard.tsx
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrophyIcon } from "lucide-react"
import type { Match } from "@/app/types/match"
import { PLAYERS } from "@/lib/players"

interface LeagueStandingsCardProps {
  matches: Match[]
  season: string
  onSeasonChange: (season: string) => void
  seasons: number[]
}

interface PlayerStanding {
  playerName: string
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  cleanSheets: number
}

export default function LeagueStandingsCard({ 
  matches, 
  season, 
  onSeasonChange,
  seasons
}: LeagueStandingsCardProps) {
  // Filter matches by season and only completed matches
  const seasonMatches = useMemo(() => {
    return matches.filter(match => 
      match.season.toString() === season && 
      match.isProcessed
    );
  }, [matches, season]);

  const standings = useMemo(() => {
    const playerMap = new Map<string, PlayerStanding>();
  
    // Initialize EVERY player with 0 stats
    PLAYERS.forEach(playerName => {
      playerMap.set(playerName, {
        playerName,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        cleanSheets: 0,
      });
    });
  
    // Then update the players based on played matches
    seasonMatches.forEach(match => {
      const player1 = playerMap.get(match.player1)!;
      const player2 = playerMap.get(match.player2)!;
  
      // Update matches played
      player1.matchesPlayed++;
      player2.matchesPlayed++;
  
      // Update points and win/draw/loss records
      if (match.winner === "player1") {
        player1.wins++;
        player2.losses++;
        player1.points += match.leaguePoints.player1;
        player2.points += match.leaguePoints.player2;
      } else if (match.winner === "player2") {
        player2.wins++;
        player1.losses++;
        player1.points += match.leaguePoints.player1;
        player2.points += match.leaguePoints.player2;
      } else if (match.winner === "draw") {
        player1.draws++;
        player2.draws++;
        player1.points += match.leaguePoints.player1;
        player2.points += match.leaguePoints.player2;
      }
  
      // Update goals
      if (match.player1Points !== null && match.player2Points !== null) {
        player1.goalsFor += match.player2Points;
        player1.goalsAgainst += match.player1Points;
        player2.goalsFor += match.player1Points;
        player2.goalsAgainst += match.player2Points;
      }
  
      // Update clean sheets
      if (match.cleanSheets.player1) {
        player1.cleanSheets++;
      }
      if (match.cleanSheets.player2) {
        player2.cleanSheets++;
      }
    });
  
    // Calculate goal differences
    playerMap.forEach(player => {
      player.goalDifference = player.goalsFor - player.goalsAgainst;
    });
  
    // Convert to array and sort
    return Array.from(playerMap.values()).sort((a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points;
      }
      if (a.goalDifference !== b.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      if (a.goalsFor !== b.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }
      return a.playerName.localeCompare(b.playerName);
    });
  }, [seasonMatches]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>League Standings</CardTitle>
            <CardDescription>Current standings for season {season}</CardDescription>
          </div>
          
          <Select value={season} onValueChange={onSeasonChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map(s => (
                <SelectItem key={s} value={s.toString()}>Season {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">Pos</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Played</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-center">GF</TableHead>
                <TableHead className="text-center">GA</TableHead>
                <TableHead className="text-center">GD</TableHead>
                <TableHead className="text-center">CS</TableHead>
                <TableHead className="text-center">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((player, index) => (
                <TableRow key={player.playerName} className={index < 3 ? "bg-muted/30" : ""}>
                  <TableCell className="text-center font-medium">
                    {index + 1}
                    {index === 0 && <TrophyIcon className="h-4 w-4 inline ml-1 text-amber-500" />}
                  </TableCell>
                  <TableCell className="font-medium">{player.playerName}</TableCell>
                  <TableCell className="text-center">{player.matchesPlayed}</TableCell>
                  <TableCell className="text-center">{player.wins}</TableCell>
                  <TableCell className="text-center">{player.draws}</TableCell>
                  <TableCell className="text-center">{player.losses}</TableCell>
                  <TableCell className="text-center">{player.goalsFor}</TableCell>
                  <TableCell className="text-center">{player.goalsAgainst}</TableCell>
                  <TableCell className="text-center">
                    <span className={
                      player.goalDifference > 0 
                        ? "text-green-600 dark:text-green-400" 
                        : player.goalDifference < 0 
                          ? "text-red-600 dark:text-red-400" 
                          : ""
                    }>
                      {player.goalDifference > 0 ? "+" : ""}{player.goalDifference}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{player.cleanSheets}</TableCell>
                  <TableCell className="text-center font-bold">{player.points}</TableCell>
                </TableRow>
              ))}
              
              {standings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                    No standings data available for this season
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>GF = Goals For, GA = Goals Against, GD = Goal Difference, CS = Clean Sheets</p>
        </div>
      </CardContent>
    </Card>
  )
}