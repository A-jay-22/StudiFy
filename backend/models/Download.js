import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: "StudyRecord" },
    fileName: { type: String, required: true },
    format: { type: String, default: "txt" },
    downloadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Download = mongoose.models.Download || mongoose.model("Download", downloadSchema);
export default Download;
