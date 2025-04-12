"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Standing {
  id: string
  name: string
  playerName: string
  points: number
  played: number
  wins: number
  draws: number
  losses: number
  substancePoints: number
  rank?: number
}

interface Match {
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

export default function StandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [season, setSeason] = useState("1")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch standings
        const standingsResponse = await fetch(`/api/standings?season=${season}`)
        const standingsData = await standingsResponse.json()

        if (!standingsResponse.ok) {
          throw new Error(standingsData.message || "Failed to fetch standings")
        }

        setStandings(standingsData.standings)

        // Fetch matches
        const matchesResponse = await fetch(`/api/matches?season=${season}`)
        const matchesData = await matchesResponse.json()

        if (!matchesResponse.ok) {
          throw new Error(matchesData.message || "Failed to fetch matches")
        }

        setMatches(matchesData.matches)
      } catch (error) {
        toast.error("Error", {
          description: error instanceof Error ? error.message : "Failed to fetch data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [season])

  const handleSeasonChange = (value: string) => {
    setSeason(value)
  }

  if (isLoading) {
    return <div className="text-center">Loading...</div>
  }

  // Group matches by week
  const matchesByWeek = matches.reduce(
    (acc, match) => {
      if (!acc[match.weekNumber]) {
        acc[match.weekNumber] = []
      }
      acc[match.weekNumber].push(match)
      return acc
    },
    {} as Record<number, Match[]>,
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">League Standings</h1>
        <div className="mt-4 md:mt-0">
          <Select value={season} onValueChange={handleSeasonChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Season 1</SelectItem>
              <SelectItem value="2">Season 2</SelectItem>
              <SelectItem value="3">Season 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="standings">
        <TabsList className="mb-4">
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures & Results</TabsTrigger>
        </TabsList>

        <TabsContent value="standings">
          <Card>
            <CardHeader>
              <CardTitle>Season {season} Standings</CardTitle>
              <CardDescription>Current standings based on match results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-center">Played</TableHead>
                      <TableHead className="text-center">W</TableHead>
                      <TableHead className="text-center">D</TableHead>
                      <TableHead className="text-center">L</TableHead>
                      <TableHead className="text-center">Points</TableHead>
                      <TableHead className="text-center">Substance Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No standings data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      standings.map((standing, index) => (
                        <TableRow key={standing.id}>
                          <TableCell className="font-medium">{standing.rank ?? index + 1}</TableCell>
                          <TableCell>{standing.playerName}</TableCell>
                          <TableCell className="text-center">{standing.played}</TableCell>
                          <TableCell className="text-center">{standing.wins}</TableCell>
                          <TableCell className="text-center">{standing.draws}</TableCell>
                          <TableCell className="text-center">{standing.losses}</TableCell>
                          <TableCell className="text-center font-bold">{standing.points}</TableCell>
                          <TableCell className="text-center">{standing.substancePoints}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixtures">
          <div className="space-y-6">
            {Object.keys(matchesByWeek).length === 0 ? (
              <Card>
                <CardContent className="py-6">
                  <p className="text-center">No fixtures available</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(matchesByWeek)
                .sort(([weekA], [weekB]) => Number.parseInt(weekA) - Number.parseInt(weekB))
                .map(([week, weekMatches]) => (
                  <Card key={week}>
                    <CardHeader>
                      <CardTitle>Week {week}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Home</TableHead>
                            <TableHead></TableHead>
                            <TableHead>Away</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {weekMatches.map((match) => (
                            <TableRow key={match._id}>
                              <TableCell className="font-medium">{match.player1}</TableCell>
                              <TableCell className="text-center">vs</TableCell>
                              <TableCell>{match.player2}</TableCell>
                              <TableCell>
                                {match.isProcessed ? (
                                  <span>
                                    {match.player1Points} - {match.player2Points}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">Pending</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {match.isProcessed ? (
                                  match.winner === "player1" ? (
                                    <span className="text-green-600">Home win</span>
                                  ) : match.winner === "player2" ? (
                                    <span className="text-red-600">Away win</span>
                                  ) : (
                                    <span className="text-amber-600">Draw</span>
                                  )
                                ) : (
                                  <span className="text-muted-foreground">Scheduled</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
