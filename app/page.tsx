// app/page.tsx
import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import CurrentWeekMatches from "@/components/matches/CurrentWeekMatches"

function DashboardCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Card className="h-full flex flex-col justify-between shadow-md rounded-2xl p-4 transition hover:shadow-xl hover:scale-[1.01] duration-200">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={href}>
          <Button className="w-full hover:bg-primary/90 transition-colors">
            Go
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default async function Home() {
  const session = await getServerSession()

  return (
    <div className="px-4 py-12 flex flex-col items-center justify-center space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Welcome to FantaSalute!
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A gamification platform to help reduce substance use
        </p>
      </div>

      {session ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 w-full max-w-4xl">
            <DashboardCard
              title="Log Substance Use"
              description="Record your daily substance consumption"
              href="/input"
            />
            <DashboardCard
              title="View Schedule"
              description="Check your upcoming matches"
              href="/schedule"
            />
            <DashboardCard
              title="View Standings"
              description="Check the current league standings"
              href="/standings"
            />
          </div>
          
          {/* Current Matches Section */}
          <CurrentWeekMatches />
        </>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-lg">Sign in to get started</p>
          <Link href="/auth/signin">
            <Button size="lg">Sign In</Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="underline">
              Sign up
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}