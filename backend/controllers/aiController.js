import StudyRecord from "../models/StudyRecord.js";
import {
  answerQuestion,
  chatWithDocument,
  generateTopicStudyGuide,
  generatePracticeQuestions,
  generateMockExamQuestions,
  GeminiServiceError,
} from "../services/aiService.js";
import { generatePdfBuffer } from "../services/pdfService.js";

const sanitizeFilename = (str) => {
  return (str || "document")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .slice(0, 80);
};

export const generateText = async (req, res, next) => {
  const {
    action,
    prompt,
    subject = "General",
    level = "School",
    difficulty = "Medium",
    length = "Medium",
    includeQuestions = true,
    materialId,
    history = [],
    count = 10,
  } = req.body || {};

  const validActions = ["topic", "answer", "questions", "mock-exam", "chat-document"];
  if (!validActions.includes(action)) {
    return res.status(400).json({
      message: `Invalid action "${action}". Must be one of: ${validActions.join(", ")}`,
    });
  }

  if (action !== "mock-exam" && (typeof prompt !== "string" || !prompt.trim())) {
    return res.status(400).json({ message: "Please provide a valid prompt or question." });
  }

  try {
    if (action === "mock-exam") {
      let fileBuffer = null;
      let mimeType = null;
      let fileName = null;

      if (materialId) {
        const material = await StudyRecord.findOne({
          _id: materialId,
          userId: req.user.id,
          kind: "material",
        }).select("+file.data");

        if (material?.file?.data) {
          fileBuffer = material.file.data;
          mimeType = material.file.mimeType;
          fileName = material.file.name;
        }
      }

      const questionCount = Math.min(Math.max(Number(count) || 10, 3), 30);
      const examQuestions = await generateMockExamQuestions({
        topic: typeof prompt === "string" ? prompt.trim() : subject,
        subject,
        difficulty,
        count: questionCount,
        fileBuffer,
        mimeType,
        fileName,
      });

      return res.json({
        questions: examQuestions,
        subject,
        topic: prompt || subject,
        difficulty,
        totalQuestions: examQuestions.length,
      });
    }

    if (action === "answer" || action === "chat-document") {
      let answer;

      if (materialId) {
        const material = await StudyRecord.findOne({
          _id: materialId,
          userId: req.user.id,
          kind: "material",
        }).select("+file.data");

        if (material?.file?.data) {
          answer = await chatWithDocument({
            prompt: prompt.trim(),
            fileBuffer: material.file.data,
            mimeType: material.file.mimeType,
            fileName: material.file.name,
            history,
          });
          return res.json({ answer, materialTitle: material.title });
        }
      }

      answer = await answerQuestion({
        prompt: prompt.trim(),
        history,
      });

      return res.json({ answer });
    }

    if (action === "topic") {
      const studyGuide = await generateTopicStudyGuide({
        topic: prompt.trim(),
        subject,
        level,
        difficulty,
        length,
        includeQuestions,
      });

      const title = prompt.trim().slice(0, 200);

      let pdfBuffer = null;
      try {
        pdfBuffer = await generatePdfBuffer({
          title,
          subject,
          kind: "topic",
          content: studyGuide,
          details: { level, difficulty, length, includeQuestions },
        });
      } catch (pdfErr) {
        console.warn("Could not generate PDF buffer on topic creation:", pdfErr.message);
      }

      const item = await StudyRecord.create({
        userId: req.user.id,
        kind: "topic",
        title,
        subject: typeof subject === "string" ? subject.slice(0, 80) : "General",
        content: studyGuide,
        details: {
          level,
          difficulty,
          length,
          includeQuestions: Boolean(includeQuestions),
          saved: true,
          hasPdf: Boolean(pdfBuffer),
        },
        ...(pdfBuffer
          ? {
              file: {
                name: `${sanitizeFilename(title)}.pdf`,
                mimeType: "application/pdf",
                data: pdfBuffer,
              },
            }
          : {}),
      });

      const responseItem = item.toObject();
      if (responseItem.file) delete responseItem.file.data;

      return res.json({ answer: studyGuide, item: responseItem });
    }

    if (action === "questions") {
      const questionCount = Math.min(Math.max(Number(count) || 10, 3), 20);
      const text = await generatePracticeQuestions({
        topic: prompt.trim(),
        subject,
        difficulty,
        count: questionCount,
      });

      const title = prompt.trim().slice(0, 200);

      let pdfBuffer = null;
      try {
        pdfBuffer = await generatePdfBuffer({
          title: `${title} - Practice Questions`,
          subject,
          kind: "questions",
          content: text,
          details: { difficulty, count: questionCount },
        });
      } catch (pdfErr) {
        console.warn("Could not generate PDF buffer on questions creation:", pdfErr.message);
      }

      const item = await StudyRecord.create({
        userId: req.user.id,
        kind: "questions",
        title,
        subject: typeof subject === "string" ? subject.slice(0, 80) : "General",
        content: text,
        details: { difficulty, count: questionCount, hasPdf: Boolean(pdfBuffer) },
        ...(pdfBuffer
          ? {
              file: {
                name: `${sanitizeFilename(title)}_questions.pdf`,
                mimeType: "application/pdf",
                data: pdfBuffer,
              },
            }
          : {}),
      });

      const responseItem = item.toObject();
      if (responseItem.file) delete responseItem.file.data;

      return res.json({ answer: text, item: responseItem });
    }
  } catch (error) {
    console.error(`[AI Controller Error (${action})]:`, error);
    if (error instanceof GeminiServiceError) {
      return res.status(error.status || 502).json({
        message: error.message,
        details: error.details,
      });
    }
    return next(error);
  }
};

export const askAboutMaterial = async (req, res, next) => {
  const { materialId } = req.params;
  const { prompt, history = [] } = req.body || {};

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ message: "Please provide a question." });
  }

  try {
    const material = await StudyRecord.findOne({
      _id: materialId,
      userId: req.user.id,
      kind: "material",
    }).select("+file.data");

    if (!material) {
      return res.status(404).json({ message: "Study material not found." });
    }

    const answer = await chatWithDocument({
      prompt: prompt.trim(),
      fileBuffer: material.file?.data,
      mimeType: material.file?.mimeType,
      fileName: material.file?.name,
      history,
    });

    return res.json({
      answer,
      materialId,
      materialTitle: material.title,
    });
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      return res.status(error.status || 502).json({ message: error.message });
    }
    return next(error);
  }
};