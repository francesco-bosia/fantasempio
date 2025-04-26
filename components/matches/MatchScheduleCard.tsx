"use client"

import type { Match } from "@/app/types/match"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function MatchScheduleCard({ matches, loading }: { matches: Match[], loading: boolean }) {
  if (loading) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Schedule</CardTitle>
        <CardDescription>All matches grouped by week and season</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Season</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Player 1</TableHead>
              <TableHead>Player 2</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map(match => (
              <TableRow key={match._id}>
                <TableCell>{match.season}</TableCell>
                <TableCell>{match.weekNumber}</TableCell>
                <TableCell>
                  {format(new Date(match.startDate), "PP")} - {format(new Date(match.endDate), "PP")}
                </TableCell>
                <TableCell>{match.player1}</TableCell>
                <TableCell>{match.player2}</TableCell>
                <TableCell>{match.player1Points} - {match.player2Points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
