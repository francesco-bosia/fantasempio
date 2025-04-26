// components/players/PlayerSelector.tsx
"use client"

import { PLAYERS } from "@/lib/players"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XIcon } from "lucide-react"

interface PlayerSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  excludePlayers?: string[]
}

export default function PlayerSelector({
  value,
  onValueChange,
  placeholder = "Select player",
  disabled = false,
  excludePlayers = []
}: PlayerSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {PLAYERS.map(player => {
          const isExcluded = excludePlayers.includes(player)
          return (
            <SelectItem 
              key={player} 
              value={player}
              disabled={isExcluded}
              className="flex items-center justify-between"
            >
              <span>{player}</span>
              {isExcluded && <XIcon className="h-4 w-4 ml-2 opacity-50" />}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}