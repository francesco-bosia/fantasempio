// components/matches/CreateMatchForm.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import PlayerSelector from "@/components/players/PlayerSelector"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PLAYERS } from "@/lib/players"

const formSchema = z.object({
  player1: z.enum(PLAYERS as unknown as [string, ...string[]]),
  player2: z.enum(PLAYERS as unknown as [string, ...string[]]),
  startDate: z.date(),
  weekNumber: z.coerce.number().int().positive(),
  season: z.coerce.number().int().positive(),
}).refine(data => data.player1 !== data.player2, {
  message: "Players must be different",
  path: ["player2"],
});

export default function CreateMatchForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      player1: PLAYERS[0],
      player2: PLAYERS[1],
      startDate: new Date(),
      weekNumber: 1,
      season: 1,
    },
  })
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Calculate endDate (7 days from startDate)
      const endDate = addDays(values.startDate, 6)
      
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          startDate: values.startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create match")
      }
      
      toast.success("Match created successfully")
      form.reset()
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create match")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Match</CardTitle>
        <CardDescription>Create a single match between two players</CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="player1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player 1</FormLabel>
                    <FormControl>
                      <PlayerSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        excludePlayers={[form.watch("player2")]}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="player2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player 2</FormLabel>
                    <FormControl>
                      <PlayerSelector
                        value={field.value}
                        onValueChange={field.onChange}
                        excludePlayers={[form.watch("player1")]}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Match Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weekNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Match"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}