import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, default: "General", trim: true },
    topic: { type: String, default: "", trim: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    totalQuestions: { type: Number, default: 10 },
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeSpentSeconds: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    questions: [
      {
        id: Number,
        question: String,
        options: [String],
        answer: Number,
        userAnswer: Number,
        explanation: String,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

export const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);
export default Exam;
