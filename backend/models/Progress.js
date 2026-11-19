import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    studySeconds: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    topicsCreated: { type: Number, default: 0 },
    topicsSaved: { type: Number, default: 0 },
    examsCompleted: { type: Number, default: 0 },
    averageExamScore: { type: Number, default: 0 },
    highestExamScore: { type: Number, default: 0 },
    materialsUploaded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Progress = mongoose.models.Progress || mongoose.model("Progress", progressSchema);
export default Progress;
