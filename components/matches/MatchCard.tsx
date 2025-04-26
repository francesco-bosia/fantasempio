// components/matches/MatchCard.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, TrophyIcon, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type PlayerName } from "@/lib/players"

interface Match {
  _id: string
  player1: PlayerName
  player2: PlayerName
  player1Points: number | null
  player2Points: number | null
  startDate: string
  endDate: string
  winner: "player1" | "player2" | "draw" | null
  cleanSheets: {
    player1: boolean
    player2: boolean
  }
  leaguePoints: {
    player1: number
    player2: number
  }
  isActive: boolean
  weekNumber: number
  season: number
  isProcessed: boolean
}

interface MatchCardProps {
  match: Match
  onUpdateScore?: (matchId: string, score1: number, score2: number) => Promise<void>
  editable?: boolean
  showLeaguePoints?: boolean
}

export default function MatchCard({ 
  match, 
  onUpdateScore, 
  editable = false,
  showLeaguePoints = true
}: MatchCardProps) {
  const [player1Score, setPlayer1Score] = useState<string>(
    match.player1Points !== null ? match.player1Points.toString() : ""
  )
  const [player2Score, setPlayer2Score] = useState<string>(
    match.player2Points !== null ? match.player2Points.toString() : ""
  )
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Compute status and results info
  const isCompleted = match.isProcessed
  const isUpcoming = !isCompleted && new Date(match.startDate) > new Date()
  const isActive = !isCompleted && match.isActive
  
  // Winner determination based on schema logic
  const player1IsWinner = isCompleted && match.winner === "player1"
  const player2IsWinner = isCompleted && match.winner === "player2"
  const isDraw = isCompleted && match.winner === "draw"
  
  // Status badge
  let statusBadge
  if (isCompleted) {
    statusBadge = <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Completed</Badge>
  } else if (isUpcoming) {
    statusBadge = <Badge variant="outline">Upcoming</Badge>
  } else if (isActive) {
    statusBadge = <Badge variant="secondary">Active</Badge>
  } else {
    statusBadge = <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
  }

  const handleUpdateScore = async () => {
    if (!onUpdateScore) return
    
    setIsUpdating(true)
    try {
      await onUpdateScore(
        match._id,
        parseInt(player1Score),
        parseInt(player2Score)
      )
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="p-4 bg-muted/30 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Week {match.weekNumber}, Season {match.season}
          </span>
        </div>
        {statusBadge}
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid grid-cols-11 items-center gap-2">
          {/* Player 1 */}
          <div className="col-span-5 text-right space-y-1">
            <div className="font-semibold">{match.player1}</div>
            <div className="flex flex-wrap justify-end gap-1">
              {player1IsWinner && (
                <Badge variant="default" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                  <TrophyIcon className="h-3 w-3 mr-1" /> Winner
                </Badge>
              )}
              {isCompleted && match.cleanSheets.player1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Clean
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Clean sheet - no substances consumed
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {showLeaguePoints && isCompleted && (
              <div className="text-xs text-muted-foreground">
                {match.leaguePoints.player1} pts
              </div>
            )}
          </div>
          
          {/* Score */}
          <div className="col-span-1 font-mono text-center">
            {editable ? (
              "vs"
            ) : (
              isCompleted ? (
                <div className="flex flex-col items-center">
                  <span className="font-bold">
                    {match.player1Points}-{match.player2Points}
                  </span>
                  {isDraw && (
                    <Badge variant="outline" className="text-xs mt-1">Draw</Badge>
                  )}
                </div>
              ) : (
                "vs"
              )
            )}
          </div>
          
          {/* Player 2 */}
          <div className="col-span-5 text-left space-y-1">
            <div className="font-semibold">{match.player2}</div>
            <div className="flex flex-wrap gap-1">
              {player2IsWinner && (
                <Badge variant="default" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                  <TrophyIcon className="h-3 w-3 mr-1" /> Winner
                </Badge>
              )}
              {isCompleted && match.cleanSheets.player2 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Clean
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Clean sheet - no substances consumed
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {showLeaguePoints && isCompleted && (
              <div className="text-xs text-muted-foreground">
                {match.leaguePoints.player2} pts
              </div>
            )}
          </div>
        </div>
        
        {editable && (
          <div className="grid grid-cols-11 gap-2 mt-6 items-center">
            <div className="col-span-5">
              <Input
                type="number"
                min="0"
                value={player1Score}
                onChange={(e) => setPlayer1Score(e.target.value)}
                placeholder="Score"
                className="text-center"
              />
            </div>
            <div className="col-span-1 text-center">-</div>
            <div className="col-span-5">
              <Input
                type="number"
                min="0"
                value={player2Score}
                onChange={(e) => setPlayer2Score(e.target.value)}
                placeholder="Score"
                className="text-center"
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/10 text-xs text-muted-foreground">
        <div className="w-full flex items-center justify-between">
          <div>
            {format(new Date(match.startDate), "MMM d")} - {format(new Date(match.endDate), "MMM d")}
          </div>
          
          {editable && onUpdateScore && (
            <Button 
              size="sm" 
              onClick={handleUpdateScore}
              disabled={isUpdating || !player1Score || !player2Score}
            >
              {isUpdating ? "Updating..." : "Update Score"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}