import { startOfWeek, addWeeks, addDays } from "date-fns"

export function generateMatchSchedule(startDate: Date, players: string[], season = 1): MatchSchedule[] {
  // Ensure we have an even number of players
  if (players.length % 2 !== 0) {
    throw new Error("Number of players must be even")
  }

  const numPlayers = players.length
  const numRounds = numPlayers - 1
  const matchesPerRound = numPlayers / 2
  const schedule: MatchSchedule[] = []

  // Create a copy of players to manipulate
  const playersCopy = [...players]

  // Generate rounds using the round-robin algorithm
  for (let round = 0; round < numRounds; round++) {
    const weekStartDate = addWeeks(startOfWeek(startDate, { weekStartsOn: 1 }), round)
    const weekEndDate = addDays(weekStartDate, 6)

    const roundMatches: Match[] = []

    // First player stays fixed, others rotate
    const firstPlayer = playersCopy[0]

    // For each match in this round
    for (let match = 0; match < matchesPerRound; match++) {
      // Match first player with last player, second with second-to-last, etc.
      if (match === 0) {
        roundMatches.push({
          player1: firstPlayer,
          player2: playersCopy[round + 1], // Rotate who plays against first player
          startDate: weekStartDate,
          endDate: weekEndDate,
        })
      } else {
        // For other matches, pair players in order from both ends of the array
        const player1Index = 1 + match
        const player2Index = numPlayers - match

        roundMatches.push({
          player1: playersCopy[player1Index],
          player2: playersCopy[player2Index],
          startDate: weekStartDate,
          endDate: weekEndDate,
        })
      }
    }

    schedule.push({
      weekNumber: round + 1,
      startDate: weekStartDate,
      endDate: weekEndDate,
      matches: roundMatches,
      season,
    })

    // Rotate players for next round (keep first player fixed)
    // Move the second player to the end, and shift everyone else up
    const secondPlayer = playersCopy[1]
    for (let i = 1; i < numPlayers - 1; i++) {
      playersCopy[i] = playersCopy[i + 1]
    }
    playersCopy[numPlayers - 1] = secondPlayer
  }

  // Generate the return matches (second half of the season)
  const firstHalfSchedule = [...schedule]
  for (let i = 0; i < firstHalfSchedule.length; i++) {
    const round = firstHalfSchedule[i]
    const returnRoundNumber = numRounds + i + 1
    const returnWeekStartDate = addWeeks(round.startDate, numRounds)
    const returnWeekEndDate = addWeeks(round.endDate, numRounds)

    const returnMatches = round.matches.map((match) => ({
      player1: match.player2, // Swap home and away
      player2: match.player1,
      startDate: returnWeekStartDate,
      endDate: returnWeekEndDate,
    }))

    schedule.push({
      weekNumber: returnRoundNumber,
      startDate: returnWeekStartDate,
      endDate: returnWeekEndDate,
      matches: returnMatches,
      season,
    })
  }

  return schedule
}

// Types
export interface Match {
  player1: string
  player2: string
  startDate: Date
  endDate: Date
}

export interface MatchSchedule {
  weekNumber: number
  startDate: Date
  endDate: Date
  matches: Match[]
  season: number
}
