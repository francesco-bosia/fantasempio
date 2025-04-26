"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GenerateMatchesCard from "@/components/matches/GenerateMatchesCard"
import ProcessMatchesCard from "@/components/matches/ProcessMatchesCard"
import MatchScheduleCard from "@/components/matches/MatchScheduleCard"

import type { Match } from "@/app/types/match"

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/matches")
      const data = await res.json()
      setMatches(data.matches)
    } catch (error) {
      toast.error("Failed to fetch matches: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Match Management</h1>
      <Tabs defaultValue="generate">
        <TabsList className="mb-4">
          <TabsTrigger value="generate">Generate Matches</TabsTrigger>
          <TabsTrigger value="process">Process Results</TabsTrigger>
          <TabsTrigger value="view">View Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <GenerateMatchesCard onGenerate={fetchMatches} />
        </TabsContent>

        <TabsContent value="process">
          <ProcessMatchesCard onProcess={fetchMatches} />
        </TabsContent>

        <TabsContent value="view">
          <MatchScheduleCard matches={matches} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
