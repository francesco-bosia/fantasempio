"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PLAYERS } from "@/lib/players"

export default function GenerateMatchesCard({ onGenerate }: { onGenerate: () => void }) {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [season, setSeason] = useState("1")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateMatches = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          season: Number(season),
          players: PLAYERS, // use PLAYERS directly
        }),
      })

      if (!response.ok) throw new Error("Generation failed")
      toast.success("Matches generated successfully!")
      onGenerate()
    } catch {
      toast.error("Failed to generate matches")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Season Matches</CardTitle>
        <CardDescription>Create a schedule of matches for all players</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label htmlFor="startDate">Season Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start", !startDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={startDate} onSelect={(date) => date && setStartDate(date)} />
          </PopoverContent>
        </Popover>

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

        <Button onClick={handleGenerateMatches} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Matches"}
        </Button>
      </CardContent>
    </Card>
  )
}
