"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface Match {
  _id: string
  player1: string
  player2: string
  startDate: string
  endDate: string
  player1Points: number
  player2Points: number
  weekNumber: number
  season: number
  isProcessed: boolean
}

export default function PublicMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)



  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches")
        const data = await res.json()
        setMatches(data.matches)
      } catch (error) {
        console.error("Failed to fetch matches", error)
      } finally {
        setIsLoading(false)
      }
    }

      fetchMatches()
  }, [])

  const groupedMatches = matches.reduce<Record<string, Match[]>>((groups, match) => {
    const key = `Season ${match.season} - Week ${match.weekNumber}`
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(match)
    return groups
  }, {})

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Match Schedule</h1>

      {Object.entries(groupedMatches).map(([groupKey, groupMatches]) => (
        <Card key={groupKey} className="mb-6">
          <CardHeader>
            <CardTitle>{groupKey}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player 1</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Player 2</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupMatches.map((match) => (
                  <TableRow key={match._id}>
                    <TableCell>{match.player1}</TableCell>
                    <TableCell className="text-center">
                      {match.isProcessed
                        ? `${match.player1Points} - ${match.player2Points}`
                        : "-"}
                    </TableCell>
                    <TableCell>{match.player2}</TableCell>
                    <TableCell>{format(new Date(match.startDate), "PPP")}</TableCell>
                    <TableCell>{format(new Date(match.endDate), "PPP")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
