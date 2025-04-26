// app/schedule/page.tsx
import { Suspense } from "react"
import SchedulePageContent from "./SchedulePageContent"

export const metadata = {
  title: "Match Schedule | FantaSalute",
  description: "View your upcoming and past matches in the FantaSalute league",
}

export default function SchedulePage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Match Schedule</h1>
      
      <Suspense fallback={<div>Loading matches...</div>}>
        <SchedulePageContent />
      </Suspense>
    </div>
  )
}