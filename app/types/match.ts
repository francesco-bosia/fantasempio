// app/types/match.ts
import { type PlayerName } from "@/lib/players"

export interface Match {
  _id: string
  player1: PlayerName
  player2: PlayerName
  startDate: string
  endDate: string
  player1Points: number | null
  player2Points: number | null
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

export interface MatchCreationParams {
  player1: PlayerName
  player2: PlayerName
  startDate: string
  endDate: string
  weekNumber: number
  season: number
}