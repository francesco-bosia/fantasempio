"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface Match {
  _id: string
  player1: string
  player2: string
  startDate: string
  endDate: string
  player1Points: number
  player2Points: number
  winner: string | null
  leaguePoints: {
    player1: number
    player2: number
  }
  isActive: boolean
  weekNumber: number
  season: number
  isProcessed: boolean
}

interface User {
  _id: string
  name: string
  playerName: string
  role: string
}

export default function AdminMatchesPage() {
  const { data: session, status } = useSession()
  const [matches, setMatches] = useState<Match[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [season, setSeason] = useState("1")
  const [weekNumber, setWeekNumber] = useState("1")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/auth/check-admin")
        const data = await response.json()

        setIsAdmin(data.isAdmin)

        if (!data.isAdmin) {
          router.push("/")
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/")
      }
    }

    if (status === "authenticated") {
      checkAdminStatus()
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch matches
        const matchesResponse = await fetch("/api/matches")
        const matchesData = await matchesResponse.json()

        if (!matchesResponse.ok) {
          throw new Error(matchesData.message || "Failed to fetch matches")
        }

        setMatches(matchesData.matches)

        // Fetch users
        const usersResponse = await fetch("/api/users")
        const usersData = await usersResponse.json()

        if (!usersResponse.ok) {
          throw new Error(usersData.message || "Failed to fetch users")
        }

        setUsers(usersData.users)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to fetch data")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated" && isAdmin) {
      fetchData()
    }
  }, [status, isAdmin])

  const handleGenerateMatches = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          season: Number.parseInt(season),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate matches")
      }

      toast.success(data.message)

      // Refresh matches
      const matchesResponse = await fetch("/api/matches")
      const matchesData = await matchesResponse.json()
      setMatches(matchesData.matches)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate matches")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTestSchedule = async () => {
    setIsTesting(true)
    try {
      const playerNames = users.map((user) => user.playerName)

      const response = await fetch("/api/matches/test-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          players: playerNames,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to test schedule")
      }

      if (data.isValid) {
        toast.success("Schedule is valid! Each player plays exactly once per week.")
      } else {
        toast.error("Schedule validation failed. Check console for details.")
      }

      console.log("Schedule test results:", data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to test schedule")
    } finally {
      setIsTesting(false)
    }
  }

  const handleProcessWeek = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/matches/process-week", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekNumber,
          season,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to process week")
      }

      toast.success(data.message)

      // Refresh matches
      const matchesResponse = await fetch("/api/matches")
      const matchesData = await matchesResponse.json()
      setMatches(matchesData.matches)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process week")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProcessMatch = async (matchId: string) => {
    try {
      const response = await fetch("/api/matches/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to process match")
      }

      toast.success("Match processed successfully")

      // Refresh matches
      const matchesResponse = await fetch("/api/matches")
      const matchesData = await matchesResponse.json()
      setMatches(matchesData.matches)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process match")
    }
  }

  if (status === "loading" || isLoading) {
    return <div className="text-center">Loading...</div>
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  const hasEnoughPlayers = users.length >= 2
  const hasEvenPlayers = users.length % 2 === 0

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
          <Card>
            <CardHeader>
              <CardTitle>Generate Season Matches</CardTitle>
              <CardDescription>Create a schedule of matches for all players</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasEnoughPlayers && (
                <Alert variant="warning" className="mb-4">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Not enough players</AlertTitle>
                  <AlertDescription>
                    You need at least 2 registered players to generate matches. Currently you have {users.length}{" "}
                    player(s).
                  </AlertDescription>
                </Alert>
              )}

              {!hasEvenPlayers && users.length > 0 && (
                <Alert variant="warning" className="mb-4">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Odd number of players</AlertTitle>
                  <AlertDescription>
                    You need an even number of players to generate matches. Currently you have {users.length} player(s).
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Season Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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

              <div className="mt-2">
                <h3 className="text-sm font-medium mb-2">Registered Players ({users.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {users.map((user) => (
                    <div key={user._id} className="bg-muted px-2 py-1 rounded text-sm">
                      {user.playerName}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleGenerateMatches} disabled={isGenerating || !hasEnoughPlayers || !hasEvenPlayers}>
                  {isGenerating ? "Generating..." : "Generate Matches"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleTestSchedule}
                  disabled={isTesting || !hasEnoughPlayers || !hasEvenPlayers}
                >
                  {isTesting ? "Testing..." : "Test Schedule"}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mt-2">
                <p>
                  For 8 players, the system will generate 4 matches per week, with each player playing exactly once per
                  week.
                </p>
                <p>A full season consists of 14 weeks (7 weeks home + 7 weeks away).</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process">
          <Card>
            <CardHeader>
              <CardTitle>Process Match Results</CardTitle>
              <CardDescription>Calculate winners based on substance use</CardDescription>
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
                        <SelectItem key={i} value={(i + 1).toString()}>
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
        </TabsContent>

        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Match Schedule</CardTitle>
              <CardDescription>View all matches and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Week</TableHead>
                      <TableHead>Season</TableHead>
                      <TableHead>Player 1</TableHead>
                      <TableHead>Player 2</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>P1 Points</TableHead>
                      <TableHead>P2 Points</TableHead>
                      <TableHead>Winner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center">
                          No matches found
                        </TableCell>
                      </TableRow>
                    ) : (
                      matches.map((match) => (
                        <TableRow key={match._id}>
                          <TableCell>{match.weekNumber}</TableCell>
                          <TableCell>{match.season}</TableCell>
                          <TableCell>{match.player1}</TableCell>
                          <TableCell>{match.player2}</TableCell>
                          <TableCell>{format(new Date(match.startDate), "PP")}</TableCell>
                          <TableCell>{format(new Date(match.endDate), "PP")}</TableCell>
                          <TableCell>{match.player1Points}</TableCell>
                          <TableCell>{match.player2Points}</TableCell>
                          <TableCell>
                            {match.winner === "player1"
                              ? match.player1
                              : match.winner === "player2"
                                ? match.player2
                                : match.winner === "draw"
                                  ? "Draw"
                                  : "Not decided"}
                          </TableCell>
                          <TableCell>
                            {match.isProcessed ? (
                              <span className="text-green-600">Processed</span>
                            ) : (
                              <span className="text-amber-600">Pending</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {!match.isProcessed && (
                              <Button size="sm" onClick={() => handleProcessMatch(match._id)}>
                                Process
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
