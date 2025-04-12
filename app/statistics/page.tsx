"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface SubstanceLog {
  _id: string
  substance: {
    _id: string
    name: string
    points: number
    category: string
  }
  date: string
  points: number
}

interface Statistics {
  substanceStats: Record<string, { count: number; totalPoints: number; name: string }>
  dateStats: Record<
    string,
    { totalPoints: number; substances: Record<string, { count: number; points: number; name: string }> }
  >
  totalLogs: number
  totalPoints: number
}

export default function StatisticsPage() {
  const { data: session, status } = useSession()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [period, setPeriod] = useState("week")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/statistics?period=${period}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch statistics")
        }

        setStatistics(data)
      } catch (error) {
        toast.error("Error", {
          description: error instanceof Error ? error.message : "Failed to fetch statistics",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchStatistics()
    }
  }, [status, period])

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
  }

  if (status === "loading" || isLoading) {
    return <div className="text-center">Loading...</div>
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  // Prepare data for charts
  const substanceChartData = statistics
    ? Object.entries(statistics.substanceStats).map(([id, stats]) => ({
        substance: stats.name,
        count: stats.count,
        points: stats.totalPoints,
      }))
    : []

  const dateChartData = statistics
    ? Object.entries(statistics.dateStats)
        .map(([date, stats]) => ({
          date,
          points: stats.totalPoints,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : []

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>Analyze your substance use over time</CardDescription>
            </div>
            <div className="mt-4 sm:mt-0">
              <Select value={period} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {statistics ? (
            <Tabs defaultValue="overview">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="substances">By Substance</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{statistics.totalLogs}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{statistics.totalPoints}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="substances">
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      count: {
                        label: "Count",
                        color: "hsl(var(--chart-1))",
                      },
                      points: {
                        label: "Points",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={substanceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="substance" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="count" fill="var(--color-count)" name="Count" />
                        <Bar dataKey="points" fill="var(--color-points)" name="Points" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      points: {
                        label: "Points",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dateChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line type="monotone" dataKey="points" stroke="var(--color-points)" name="Points" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <p className="text-center">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
