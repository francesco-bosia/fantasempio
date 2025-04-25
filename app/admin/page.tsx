"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function AdminPage() {
  const [seedKey, setSeedKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSeedDatabase = async () => {
    if (!seedKey) {
      toast.error("Please enter the seed key")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/seed?key=${seedKey}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to seed database")
      }

      toast.success(data.message)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to seed database")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seed Database</CardTitle>
            <CardDescription>
              Initialize the database with predefined substances and their point values.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seedKey">Seed Key</Label>
              <Input
                id="seedKey"
                value={seedKey}
                onChange={(e) => setSeedKey(e.target.value)}
                placeholder="Enter the seed key"
              />
            </div>
            <Button onClick={handleSeedDatabase} disabled={isLoading}>
              {isLoading ? "Seeding..." : "Seed Database"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Match Management</CardTitle>
            <CardDescription>Generate and process matches for the league.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Create match schedules and process match results based on substance use.</p>
            <Link href="/admin/matches">
              <Button>Manage Matches</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
