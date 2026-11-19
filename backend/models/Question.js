import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, default: "General", trim: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    question: { type: String, required: true },
    options: [{ type: String }],
    answer: { type: Number, default: 0 },
    explanation: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);
export default Question;
