import { addWeeks, addDays, startOfWeek } from "date-fns"

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

export function generateMatchSchedule(startDate: Date, players: string[], season = 1): MatchSchedule[] {
  const teams = [...players]

  if (teams.length % 2 !== 0) {
    teams.push("BYE") // Add dummy team for odd number of players
  }

  const schedule: MatchSchedule[] = []
  const numDays = teams.length - 1
  const numMatchesPerDay = teams.length / 2

  const rotate = (arr: string[]) => {
    return [arr[0], ...arr.slice(-1), ...arr.slice(1, -1)]
  }

  let rotated = [...teams]

  for (let week = 0; week < numDays; week++) {
    const weekStartDate = addWeeks(startOfWeek(startDate, { weekStartsOn: 1 }), week)
    const weekEndDate = addDays(weekStartDate, 6)

    const matches: Match[] = []

    for (let match = 0; match < numMatchesPerDay; match++) {
      const home = rotated[match]
      const away = rotated[rotated.length - 1 - match]

      if (home !== "BYE" && away !== "BYE") {
        matches.push({
          player1: home,
          player2: away,
          startDate: weekStartDate,
          endDate: weekEndDate,
        })
      }
    }

    schedule.push({
      weekNumber: week + 1,
      startDate: weekStartDate,
      endDate: weekEndDate,
      matches,
      season,
    })

    rotated = rotate(rotated)
  }

  // Second half: reverse home/away
  for (let i = 0; i < numDays; i++) {
    const baseWeek = schedule[i]
    const returnWeekStartDate = addWeeks(baseWeek.startDate, numDays)
    const returnWeekEndDate = addWeeks(baseWeek.endDate, numDays)

    const returnMatches = baseWeek.matches.map((m) => ({
      player1: m.player2,
      player2: m.player1,
      startDate: returnWeekStartDate,
      endDate: returnWeekEndDate,
    }))

    schedule.push({
      weekNumber: numDays + i + 1,
      startDate: returnWeekStartDate,
      endDate: returnWeekEndDate,
      matches: returnMatches,
      season,
    })
  }

  return schedule
}
