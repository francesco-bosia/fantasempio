// lib/players.ts
export const PLAYERS = [
    "Simo",
    "Sam",
    "Noe",
    "Marco",
    "Omar",
    "John",
    "Zeno",
    "Ogno",
  ] as const
  
  export type PlayerName = typeof PLAYERS[number]