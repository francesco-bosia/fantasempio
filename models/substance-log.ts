import mongoose from "mongoose"

const SubstanceLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  substance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Substance",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    description: "Points value of the substance based on predefined weights",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Add a virtual for the substance name for easier access
SubstanceLogSchema.virtual("substanceName", {
  ref: "Substance",
  localField: "substance",
  foreignField: "_id",
  justOne: true,
  options: { select: "name" },
})

export default mongoose.models.SubstanceLog || mongoose.model("SubstanceLog", SubstanceLogSchema)
