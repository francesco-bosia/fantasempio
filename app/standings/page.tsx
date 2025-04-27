"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import LeagueStandingsCard from "@/components/standings/LeagueStandingsCard"
import type { Match } from "@/app/types/match"

export default function StandingsPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [season, setSeason] = useState("1")
  const [isLoading, setIsLoading] = useState(true)
  const [seasons, setSeasons] = useState<number[]>([])

  useEffect(() => {
    const fetchMatches = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/matches`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch matches")
        }

        setMatches(data.matches)

        const uniqueSeasons = [...new Set(data.matches.map((m: Match) => m.season))]
        .sort((a, b) => (a as number) - (b as number)) as number[]
        setSeasons(uniqueSeasons)
        setSeason(uniqueSeasons.length > 0 ? uniqueSeasons[0].toString() : "1")
      } catch (error) {
        toast.error("Error", {
          description: error instanceof Error ? error.message : "Failed to fetch matches",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatches()
  }, [])

  if (isLoading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">League Standings</h1>

      <LeagueStandingsCard 
        matches={matches}
        season={season}
        onSeasonChange={setSeason}
        seasons={seasons}
      />
    </div>
  )
}
