import type { MatchSchedule } from "./match-scheduler"

export function validateMatchSchedule(schedule: MatchSchedule[], players: string[]): boolean {
  const realPlayers = players.filter((p) => p !== "BYE")

  for (const week of schedule) {
    const playerCounts: Record<string, number> = {}

    for (const match of week.matches) {
      const { player1, player2 } = match

      if (player1 !== "BYE") playerCounts[player1] = (playerCounts[player1] || 0) + 1
      if (player2 !== "BYE") playerCounts[player2] = (playerCounts[player2] || 0) + 1
    }

    for (const player of realPlayers) {
      const count = playerCounts[player] || 0
      if (count !== 1) {
        console.error(`Week ${week.weekNumber}: Player ${player} appears ${count} times`)
        return false
      }
    }
  }

  return true
}

