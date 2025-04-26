// components/matches/GenerateMatchesCard.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, InfoIcon, Users } from "lucide-react"
import { format, addDays } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PLAYERS } from "@/lib/players"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function GenerateMatchesCard({ onGenerate }: { onGenerate: () => void }) {
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [season, setSeason] = useState("1")
  const [isGenerating, setIsGenerating] = useState(false)
  const [existingSeasons, setExistingSeasons] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Fetch existing seasons to prevent duplicates
  useEffect(() => {
    const fetchExistingSeasons = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/seasons")
        if (response.ok) {
          const data = await response.json()
          setExistingSeasons(data.seasons || [])
          
          // Set default season to the next available one
          if (data.seasons?.length) {
            const nextSeason = Math.max(...data.seasons) + 1
            setSeason(nextSeason.toString())
          }
        }
      } catch (error) {
        console.error("Failed to fetch existing seasons", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchExistingSeasons()
  }, [])

  const handleGenerateMatches = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          season: Number(season),
          players: PLAYERS,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Generation failed")
      }
      
      toast.success("Matches generated successfully!")
      onGenerate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate matches")
    } finally {
      setIsGenerating(false)
    }
  }

  // Calculate preview dates for matches
  // We need (PLAYERS.length - 1) weeks since each player plays against every other player
  const numberOfWeeks = PLAYERS.length - 1
  const previewDates = Array.from({ length: numberOfWeeks }, (_, i) => {
    const weekStart = addDays(startDate, i * 7)
    const weekEnd = addDays(weekStart, 6)
    return {
      week: i + 1,
      start: format(weekStart, "MMM d"),
      end: format(weekEnd, "MMM d")
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Generate Season Matches
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
        <CardDescription>Create a schedule of matches for all {PLAYERS.length} players</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="season" className="mr-2">Season Number</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Each season consists of {numberOfWeeks} match weeks</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={season} onValueChange={setSeason} disabled={isGenerating || isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(num => (
                  <SelectItem 
                    key={num} 
                    value={num.toString()}
                    disabled={existingSeasons.includes(num)}
                  >
                    Season {num} {existingSeasons.includes(num) ? "(Already exists)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Season Start Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  disabled={isGenerating}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  <span className="sr-only">Open calendar</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar 
                  mode="single" 
                  selected={startDate} 
                  onSelect={(date) => {
                    if (date) {
                      setStartDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="schedule-preview">
            <AccordionTrigger className="text-sm font-medium">
              View Schedule Preview
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-muted/30 p-4 rounded-md">
                <div className="flex items-center mb-3 gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Players ({PLAYERS.length})</h4>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                  {PLAYERS.map(player => (
                    <div key={player} className="bg-background p-2 rounded border text-sm text-center">
                      {player}
                    </div>
                  ))}
                </div>
                
                <h4 className="text-sm font-medium mb-2">Weekly Schedule Preview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {previewDates.map(week => (
                    <div key={week.week} className="bg-background p-3 rounded border text-sm">
                      <span className="font-semibold">Week {week.week}:</span> {week.start} - {week.end}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Note: This will create {Math.floor(PLAYERS.length / 2)} matches per week for {PLAYERS.length - 1} weeks
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      <CardFooter className="bg-muted/20 pt-4">
        <Button 
          onClick={handleGenerateMatches} 
          disabled={isGenerating || isLoading}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Season Matches"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}