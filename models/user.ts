import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
  provider: {
    type: String,
    default: "credentials",
  },
  playerName: {
    type: String,
    enum: ["Simo", "Sam", "Noe", "Marco", "Omar", "John", "Zeno", "Ogno"],
    required: [true, "Please select a player name"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Add a pre-save hook to set admin role for Ogno
UserSchema.pre("save", function (next) {
  if (this.playerName === "Ogno") {
    this.role = "admin"
  }
  next()
})

export default mongoose.models.User || mongoose.model("User", UserSchema)
