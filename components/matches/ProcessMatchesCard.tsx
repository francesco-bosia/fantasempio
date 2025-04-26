// components/matches/ProcessMatchesCard.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { RotateCw, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProcessMatchesCard({ onProcess }: { onProcess: () => void }) {
  const [weekNumber, setWeekNumber] = useState("1")
  const [season, setSeason] = useState("1")
  const [isProcessing, setIsProcessing] = useState(false)
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([])
  const [loadingWeeks, setLoadingWeeks] = useState(false)

  // Fetch available weeks for the selected season
  useEffect(() => {
    const fetchAvailableWeeks = async () => {
      setLoadingWeeks(true)
      try {
        const response = await fetch(`/api/matches/available-weeks?season=${season}`)
        const data = await response.json()
        
        if (response.ok) {
          setAvailableWeeks(data.weeks || [])
          // Set to the first available week if current selection is not available
          if (data.weeks && data.weeks.length > 0 && !data.weeks.includes(Number(weekNumber))) {
            setWeekNumber(data.weeks[0].toString())
          }
        }
      } catch (error) {
        console.error("Failed to fetch available weeks", error)
      } finally {
        setLoadingWeeks(false)
      }
    }
    
    fetchAvailableWeeks()
  }, [season, weekNumber])

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
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle>Process Match Results</CardTitle>
        <CardDescription>Calculate match outcomes based on substance usage</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Processing a week will calculate the results for all matches in that week based on player substance usage.
            This action cannot be undone.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="season">Season Number</Label>
            <Select value={season} onValueChange={setSeason} disabled={isProcessing}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Season 1</SelectItem>
                <SelectItem value="2">Season 2</SelectItem>
                <SelectItem value="3">Season 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekNumber">Week Number</Label>
            <Select 
              value={weekNumber} 
              onValueChange={setWeekNumber} 
              disabled={isProcessing || loadingWeeks || availableWeeks.length === 0}
            >
              <SelectTrigger className="w-full">
                {loadingWeeks ? (
                  <span className="flex items-center">
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  <SelectValue placeholder="Select week" />
                )}
              </SelectTrigger>
              <SelectContent>
                {availableWeeks.length > 0 ? (
                  availableWeeks.map(week => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No weeks available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/20 flex justify-end pt-4">
        <Button 
          onClick={handleProcessWeek} 
          disabled={isProcessing || availableWeeks.length === 0}
          className="w-full md:w-auto"
        >
          {isProcessing ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Week"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}