import mongoose from "mongoose";
import StudyRecord from "../models/StudyRecord.js";
import StudySession from "../models/StudySession.js";
import { generatePdfBuffer } from "../services/pdfService.js";

export const VALID_KINDS = ["topic", "exam", "material", "questions"];

export const sanitizeFilename = (str) => {
  return (str || "document")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .slice(0, 80);
};

export const parseRecordInput = (body) => {
  const kind = typeof body.kind === "string" ? body.kind : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const subject =
    typeof body.subject === "string" ? body.subject.trim() || "General" : "General";
  const content = typeof body.content === "string" ? body.content : "";

  if (!VALID_KINDS.includes(kind)) {
    return { error: "Choose a valid study item type." };
  }
  if (!title || title.length > 200 || subject.length > 80 || content.length > 1000000) {
    return { error: "Check the title, subject, and content lengths." };
  }
  return {
    value: {
      kind,
      title,
      subject,
      content,
      details:
        body.details && typeof body.details === "object" && !Array.isArray(body.details)
          ? body.details
          : {},
    },
  };
};

export const listRecords = async (req, res, next) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.kind && VALID_KINDS.includes(req.query.kind)) {
      filter.kind = req.query.kind;
    }
    const items = await StudyRecord.find(filter)
      .select("-file.data")
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return res.json({ items });
  } catch (error) {
    return next(error);
  }
};

export const createRecord = async (req, res, next) => {
  const parsed = parseRecordInput(req.body || {});
  if (parsed.error) return res.status(400).json({ message: parsed.error });

  try {
    let pdfBuffer = null;
    const { kind, title, subject, content, details } = parsed.value;

    if (["exam", "topic", "questions"].includes(kind)) {
      let pdfContent = content;
      if (kind === "exam" && details.questions && Array.isArray(details.questions)) {
        const reviewLines = [
          `# ${title}`,
          `Score: ${details.score || 0}/${details.totalQuestions || 0} (${details.percentage || 0}%)`,
          `Difficulty: ${details.difficulty || "Medium"}`,
          "",
          "## Question Review & Explanations",
        ];
        details.questions.forEach((q, idx) => {
          reviewLines.push(`### Question ${idx + 1}: ${q.question}`);
          q.options?.forEach((opt, optIdx) => {
            const isCorrect = q.answer === optIdx;
            const isUser = q.userAnswer === optIdx;
            const prefix = isCorrect ? "[CORRECT] " : isUser ? "[YOUR CHOICE] " : "  ";
            reviewLines.push(`* ${prefix}${String.fromCharCode(65 + optIdx)}. ${opt}`);
          });
          if (q.explanation) {
            reviewLines.push(`> Explanation: ${q.explanation}`);
          }
          reviewLines.push("");
        });
        pdfContent = reviewLines.join("\n");
      }

      try {
        pdfBuffer = await generatePdfBuffer({ title, subject, kind, content: pdfContent, details });
      } catch (pdfErr) {
        console.warn("Could not generate PDF buffer for created record:", pdfErr.message);
      }
    }

    const item = await StudyRecord.create({
      userId: req.user.id,
      ...parsed.value,
      ...(pdfBuffer
        ? { file: { name: `${sanitizeFilename(title)}.pdf`, mimeType: "application/pdf", data: pdfBuffer } }
        : {}),
    });

    const createdItem = item.toObject();
    if (createdItem.file) delete createdItem.file.data;
    return res.status(201).json({ item: createdItem });
  } catch (error) {
    return next(error);
  }
};

export const uploadMaterial = async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "Choose a file to upload." });
  const title =
    typeof req.body.title === "string" && req.body.title.trim()
      ? req.body.title.trim()
      : req.file.originalname;
  const subject =
    typeof req.body.subject === "string" ? req.body.subject.trim() || "General" : "General";
  if (title.length > 200 || subject.length > 80) {
    return res.status(400).json({ message: "The title or subject is too long." });
  }

  try {
    let extractedText = "";
    if (
      req.file.mimetype === "text/plain" ||
      req.file.mimetype === "text/markdown" ||
      req.file.originalname.endsWith(".txt") ||
      req.file.originalname.endsWith(".md")
    ) {
      extractedText = req.file.buffer.toString("utf-8").slice(0, 50000);
    }

    const item = await StudyRecord.create({
      userId: req.user.id,
      kind: "material",
      title,
      subject,
      content: extractedText,
      file: { name: req.file.originalname, mimeType: req.file.mimetype, data: req.file.buffer },
    });
    const createdItem = item.toObject();
    if (createdItem.file) delete createdItem.file.data;
    return res.status(201).json({ item: createdItem });
  } catch (error) {
    return next(error);
  }
};

export const updateRecord = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid study item." });
  }
  const parsed = parseRecordInput(req.body || {});
  if (parsed.error) return res.status(400).json({ message: parsed.error });

  try {
    const item = await StudyRecord.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      parsed.value,
      { returnDocument: "after", runValidators: true },
    ).select("-file.data");
    if (!item) return res.status(404).json({ message: "Study item not found." });
    return res.json({ item });
  } catch (error) {
    return next(error);
  }
};

export const deleteRecord = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid study item." });
  }
  try {
    const item = await StudyRecord.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: "Study item not found." });
    return res.json({ message: "Study item deleted." });
  } catch (error) {
    return next(error);
  }
};

export const downloadRecord = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid study item." });
  }
  try {
    const item = await StudyRecord.findOne({ _id: req.params.id, userId: req.user.id }).select("+file.data");
    if (!item) return res.status(404).json({ message: "Study item not found." });

    const format = (req.query.format || "pdf").toLowerCase();
    const isInline = req.query.inline === "true" || req.query.inline === "1";
    const dispositionType = isInline ? "inline" : "attachment";

    if (format === "txt") {
      res.type("text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `${dispositionType}; filename*=UTF-8''${encodeURIComponent(`${item.title}.txt`)}`);
      return res.send(`${item.title}\nSubject: ${item.subject}\n\n${item.content}`);
    }

    if (format === "md" || format === "markdown") {
      res.type("text/markdown; charset=utf-8");
      res.setHeader("Content-Disposition", `${dispositionType}; filename*=UTF-8''${encodeURIComponent(`${item.title}.md`)}`);
      return res.send(`# ${item.title}\n**Subject:** ${item.subject}\n\n${item.content}`);
    }

    if (item.kind === "material" && item.file?.data && format !== "pdf") {
      res.type(item.file.mimeType || "application/octet-stream");
      res.setHeader("Content-Disposition", `${dispositionType}; filename*=UTF-8''${encodeURIComponent(item.file.name)}`);
      return res.send(item.file.data);
    }

    if (item.file?.data && item.file.mimeType === "application/pdf") {
      res.type("application/pdf");
      const filename = item.file.name.endsWith(".pdf") ? item.file.name : `${sanitizeFilename(item.title)}.pdf`;
      res.setHeader("Content-Disposition", `${dispositionType}; filename*=UTF-8''${encodeURIComponent(filename)}`);
      return res.send(item.file.data);
    }

    const pdfBuffer = await generatePdfBuffer({
      title: item.title,
      subject: item.subject,
      kind: item.kind,
      content: item.content,
      details: item.details || {},
    });

    res.type("application/pdf");
    res.setHeader("Content-Disposition", `${dispositionType}; filename*=UTF-8''${encodeURIComponent(`${sanitizeFilename(item.title)}.pdf`)}`);
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
};

export const trackSession = async (req, res, next) => {
  const seconds = Number(req.body?.seconds);
  const page = typeof req.body?.page === "string" ? req.body.page.slice(0, 80) : "Dashboard";
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > 300) {
    return res.status(400).json({ message: "Session duration must be between 1 and 300 seconds." });
  }
  try {
    await StudySession.create({ userId: req.user.id, seconds, page });
    return res.status(201).json({ message: "Study session recorded." });
  } catch (error) {
    return next(error);
  }
};

export const progress = async (req, res, next) => {
  try {
    const weekStart = new Date();
    weekStart.setUTCDate(weekStart.getUTCDate() - 6);
    weekStart.setUTCHours(0, 0, 0, 0);

    const [counts, sessions, weeklySessions, exams, savedTopicsCount] = await Promise.all([
      StudyRecord.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: "$kind", count: { $sum: 1 } } },
      ]),
      StudySession.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: null, seconds: { $sum: "$seconds" }, visits: { $sum: 1 } } },
      ]),
      StudySession.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user.id), createdAt: { $gte: weekStart } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, seconds: { $sum: "$seconds" } } },
        { $sort: { _id: 1 } },
      ]),
      StudyRecord.find({ userId: req.user.id, kind: "exam" })
        .select("title subject details createdAt")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      StudyRecord.countDocuments({ userId: req.user.id, kind: "topic", "details.saved": true }),
    ]);

    const totals = Object.fromEntries(counts.map(({ _id, count }) => [_id, count]));
    const completedExams = exams.filter((exam) => exam.details?.completed);
    const totalQuestions = completedExams.reduce((sum, exam) => sum + (Number(exam.details?.totalQuestions) || 0), 0);
    const correctAnswers = completedExams.reduce((sum, exam) => sum + (Number(exam.details?.score) || 0), 0);
    const sessionsSummary = sessions[0] || { seconds: 0, visits: 0 };
    const highestScore = completedExams.length
      ? Math.max(...completedExams.map((e) => Number(e.details?.percentage) || Math.round(((Number(e.details?.score) || 0) / Math.max(1, Number(e.details?.totalQuestions) || 1)) * 100)))
      : 0;

    return res.json({
      topics: totals.topic || 0,
      savedTopics: savedTopicsCount,
      materials: totals.material || 0,
      questionSets: totals.questions || 0,
      exams: exams.length,
      completedExams: completedExams.length,
      studySeconds: sessionsSummary.seconds,
      visits: sessionsSummary.visits,
      weeklyStudy: weeklySessions,
      averageScore: totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      highestScore,
      recentExams: exams.slice(0, 10),
    });
  } catch (error) {
    return next(error);
  }
};
