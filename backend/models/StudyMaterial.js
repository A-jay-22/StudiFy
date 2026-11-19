import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, default: "General", trim: true },
    extractedText: { type: String, default: "" },
    file: {
      name: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      data: { type: Buffer, select: false },
    },
  },
  { timestamps: true }
);

export const StudyMaterial = mongoose.models.StudyMaterial || mongoose.model("StudyMaterial", studyMaterialSchema);
export default StudyMaterial;
