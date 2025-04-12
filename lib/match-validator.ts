import type { MatchSchedule } from "./match-scheduler"

export function validateMatchSchedule(schedule: MatchSchedule[], players: string[]): boolean {
  // Check each week to ensure each player plays exactly once
  for (const week of schedule) {
    const playersInWeek = new Set<string>()

    for (const match of week.matches) {
      playersInWeek.add(match.player1)
      playersInWeek.add(match.player2)
    }

    // Check if all players are included exactly once
    if (playersInWeek.size !== players.length) {
      console.error(
        `Week ${week.weekNumber}: Not all players are playing. Expected ${players.length}, got ${playersInWeek.size}`,
      )
      return false
    }

    // Check for duplicate players in the same week
    const playerCounts: Record<string, number> = {}
    for (const match of week.matches) {
      playerCounts[match.player1] = (playerCounts[match.player1] || 0) + 1
      playerCounts[match.player2] = (playerCounts[match.player2] || 0) + 1
    }

    for (const player of players) {
      if (playerCounts[player] !== 1) {
        console.error(`Week ${week.weekNumber}: Player ${player} appears ${playerCounts[player] || 0} times`)
        return false
      }
    }
  }

  return true
}
