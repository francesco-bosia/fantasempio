// app/admin/special-matches/page.tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import CreateMatchForm from "@/components/matches/CreateMatchForm"
import WeeklyMatchesGrid from "@/components/matches/WeeklyMatchesGrid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import type { Match } from "@/app/types/match"

export default function SpecialMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/matches/special")
      const data = await res.json()
      setMatches(data.matches)
    } catch (error) {
      toast.error("Failed to fetch special matches: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Special Matches</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <CreateMatchForm onSuccess={fetchMatches} />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recently Created Matches</CardTitle>
            <CardDescription>
              View and manage manually created matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map(match => (
                  <div key={match._id} className="border rounded-md p-3">
                    <div className="font-medium">
                      {match.player1} vs {match.player2}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Week {match.weekNumber}, Season {match.season}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No special matches found. Create your first match using the form.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Separator className="my-8" />
      
      <WeeklyMatchesGrid 
        matches={matches}
        loading={loading}
        title="All Special Matches"
        editable={true}
        onUpdateScore={async (matchId, score1, score2) => {
          // Handle score update
          try {
            const res = await fetch(`/api/matches/${matchId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ player1Points: score1, player2Points: score2 }),
            })
            
            if (!res.ok) throw new Error("Failed to update score")
            
            toast.success("Score updated successfully")
            fetchMatches()
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update score")
          }
        }}
      />
    </div>
  )
}