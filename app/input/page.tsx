"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Substance {
  _id: string
  name: string
  points: number
  category: string
  description: string
}

export default function InputPage() {
  const { status } = useSession()
  const [substanceId, setSubstanceId] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("1")
  const [date, setDate] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [substances, setSubstances] = useState<Substance[]>([])

  useEffect(() => {
    const fetchSubstances = async () => {
      try {
        const response = await fetch("/api/substances")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch substances")
        }

        setSubstances(data.substances.filter((substance: Substance) => substance.name !== "Clean sheet"))
      } catch (error) {
        toast.error("Error", {
          description: error instanceof Error ? error.message : "Failed to fetch substances"
        })
      }
    }

    if (status === "authenticated") {
      fetchSubstances()
    }
  }, [status])

  const isQuantityValid = Number.isInteger(Number(quantity)) && Number(quantity) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/substance-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          substanceId,
          date: date.toISOString(),
          quantity: Number(quantity)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      toast.success("Success", {
        description: "Substance log created successfully",
      })

      // Reset form
      setSubstanceId("")
      setQuantity(1)
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to create substance log",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Log Substance Use</CardTitle>
          <CardDescription>Record your substance consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Substance</label>
              <Select value={substanceId} onValueChange={setSubstanceId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a substance" />
                </SelectTrigger>
                <SelectContent>
                  {substances.map((substance) => (
                    <SelectItem key={substance._id} value={substance._id}>
                      {substance.name} ({substance.points > 0 ? "+" : ""}
                      {substance.points} points)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onBlur={() => {
                  const floored = Math.floor(Number(quantity));
                  if (!isNaN(floored) && floored > 0) {
                    setQuantity(String(floored));
                  } else {
                    setQuantity(""); // invalid or zero input
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !substanceId || !isQuantityValid}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}