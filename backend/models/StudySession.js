import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    seconds: { type: Number, required: true, min: 1, max: 300 },
    page: { type: String, default: "Dashboard", maxlength: 80 },
  },
  { timestamps: true },
);

studySessionSchema.index({ userId: 1, createdAt: -1 });

export const StudySession = mongoose.models.StudySession || mongoose.model("StudySession", studySessionSchema);
export default StudySession;
