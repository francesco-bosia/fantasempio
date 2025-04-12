import mongoose from "mongoose"

const SubstanceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    enum: ["Alcohol", "Tobacco", "Drugs", "Food", "Other"],
    default: "Other",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
})

export default mongoose.models.Substance || mongoose.model("Substance", SubstanceSchema)
