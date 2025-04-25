import mongoose from "mongoose"

const MatchSchema = new mongoose.Schema({
  player1: {
    type: String,
    required: true,
  },
  player2: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  player1Points: {
    type: Number,
    default: 0,
  },
  player2Points: {
    type: Number,
    default: 0,
  },
  winner: {
    type: String,
    enum: ["player1", "player2", "draw", null],
    default: null,
  },
  cleanSheets: {
    player1: { type: Boolean, default: false },
    player2: { type: Boolean, default: false },
  },
  leaguePoints: {
    player1: {
      type: Number,
      default: 0,
    },
    player2: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  weekNumber: {
    type: Number,
    required: true,
  },
  season: {
    type: Number,
    required: true,
    default: 1,
  },
  isProcessed: {
    type: Boolean,
    default: false,
  },
})

// Add a method to calculate the winner based on substance points
MatchSchema.methods.calculateResult = function () {
  if (this.player1Points < this.player2Points) {
    this.winner = "player1"
    this.leaguePoints.player1 = 3
    this.leaguePoints.player2 = 0
  } else if (this.player1Points > this.player2Points) {
    this.winner = "player2"
    this.leaguePoints.player1 = 0
    this.leaguePoints.player2 = 3
  } else {
    this.winner = "draw"
    this.leaguePoints.player1 = 1
    this.leaguePoints.player2 = 1
  }
  this.isProcessed = true
  return this
}

export default mongoose.models.Match || mongoose.model("Match", MatchSchema)
