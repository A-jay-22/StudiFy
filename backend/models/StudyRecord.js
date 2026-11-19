import mongoose from "mongoose";

const studyRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ["topic", "exam", "material", "questions"],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subject: { type: String, default: "General", trim: true, maxlength: 80 },
    content: { type: String, default: "", maxlength: 100000 },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    file: {
      name: { type: String, maxlength: 255 },
      mimeType: { type: String, maxlength: 100 },
      data: { type: Buffer, select: false },
    },
  },
  { timestamps: true },
);

studyRecordSchema.index({ userId: 1, kind: 1, createdAt: -1 });

export const StudyRecord = mongoose.models.StudyRecord || mongoose.model("StudyRecord", studyRecordSchema);
export default StudyRecord;
