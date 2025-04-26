"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function ProcessMatchesCard({ onProcess }: { onProcess: () => void }) {
  const [weekNumber, setWeekNumber] = useState("1")
  const [season, setSeason] = useState("1")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleProcessWeek = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/matches/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber: Number(weekNumber),
          season: Number(season),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to process week")
      }

      toast.success(`Processed week ${weekNumber}, season ${season}`)
      onProcess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process week")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Match Results</CardTitle>
        <CardDescription>Calculate match outcomes based on substance usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weekNumber">Week Number</Label>
            <Select value={weekNumber} onValueChange={setWeekNumber}>
              <SelectTrigger>
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 14 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Week {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="season">Season Number</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger>
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

        <Button onClick={handleProcessWeek} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Process Week"}
        </Button>
      </CardContent>
    </Card>
  )
}
