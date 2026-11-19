import mongoose from "mongoose";

const personalTopicSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, default: "General", trim: true },
    content: { type: String, default: "" },
    level: { type: String, default: "Class 8" },
    difficulty: { type: String, default: "Medium" },
    saved: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const PersonalTopic = mongoose.models.PersonalTopic || mongoose.model("PersonalTopic", personalTopicSchema);
export default PersonalTopic;
