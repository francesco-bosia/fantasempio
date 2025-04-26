export interface Match {
  _id: string
  player1: string
  player2: string
  startDate: string
  endDate: string
  player1Points: number
  player2Points: number
  winner: string | null
  leaguePoints: {
    player1: number
    player2: number
  }
  isActive: boolean
  weekNumber: number
  season: number
  isProcessed: boolean
}
