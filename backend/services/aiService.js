import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Fallback models in priority order:
// gemini-3.5-flash is ultra-fast and reliable
// gemini-3.5-flash-lite is high speed backup
// gemini-3.8-flash provides latest generation
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
].filter(Boolean);

export class GeminiServiceError extends Error {
  constructor(message, status = 502, details = null) {
    super(message);
    this.name = "GeminiServiceError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Call Google Generative AI API with automatic model fallback and retries
 */
export const callGeminiApi = async ({ contents, generationConfig = {}, systemInstruction = null }) => {
  if (!GEMINI_API_KEY) {
    throw new GeminiServiceError(
      "GEMINI_API_KEY is not configured. Please set GEMINI_API_KEY in backend/config/.env.",
      503
    );
  }

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const bodyPayload = {
      contents,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 4096,
        ...generationConfig,
      },
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
        signal: AbortSignal.timeout(45000),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.candidates?.[0]?.content?.parts) {
        const textParts = data.candidates[0].content.parts
          .map((part) => (typeof part?.text === "string" ? part.text : ""))
          .join("");
        if (textParts.trim()) {
          return {
            text: textParts.trim(),
            modelUsed: model,
          };
        }
      }

      // Check specific API error codes to decide retry/fallback
      const status = response.status;
      const apiErrorMessage = data?.error?.message || `HTTP ${status}`;
      console.warn(`[Gemini] Model ${model} returned ${status}: ${apiErrorMessage}`);

      // If high demand (503) or not found (404) or rate limit (429), try next model in chain
      if ([404, 429, 500, 503, 504].includes(status)) {
        lastError = new GeminiServiceError(
          `Model ${model} was unavailable (${status}): ${apiErrorMessage}`,
          status,
          apiErrorMessage
        );
        continue;
      }

      // For other client errors (e.g. 400 Bad Request), throw directly
      throw new GeminiServiceError(
        `Gemini rejected request: ${apiErrorMessage}`,
        status,
        apiErrorMessage
      );
    } catch (err) {
      if (err instanceof GeminiServiceError) {
        throw err;
      }
      console.warn(`[Gemini] Request to ${model} threw error: ${err.message}`);
      lastError = err;
    }
  }

  throw new GeminiServiceError(
    lastError?.message || "All Gemini models are temporarily unavailable. Please try again shortly.",
    lastError?.status || 503,
    lastError
  );
}

/**
 * Answer general questions or study questions
 */
export const answerQuestion = async ({ prompt, context = "", history = [] }) => {
  const contents = [];

  if (history && Array.isArray(history)) {
    for (const msg of history.slice(-6)) {
      if (msg.role && msg.text) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.text }],
        });
      }
    }
  }

  let userText = prompt;
  if (context) {
    userText = `Study Context:\n"""\n${context}\n"""\n\nStudent Question: ${prompt}`;
  }

  contents.push({
    role: "user",
    parts: [{ text: userText }],
  });

  const systemInstruction =
    "You are Studify AI, a world-class, supportive, and knowledgeable AI study mentor. Explain concepts clearly with simple language, step-by-step breakdowns, real-world examples, and helpful summaries. Format with clean markdown headers and bullet points.";

  const result = await callGeminiApi({
    contents,
    systemInstruction,
    generationConfig: { temperature: 0.6 },
  });

  return result.text;
}

/**
 * Ask questions based on an uploaded document (PDF, TXT, image)
 */
export const chatWithDocument = async ({ prompt, fileBuffer, mimeType, fileName, history = [] }) => {
  const parts = [];

  if (fileBuffer) {
    if (mimeType === "text/plain") {
      const textContent = fileBuffer.toString("utf-8");
      parts.push({
        text: `Here is the content of the student's study document "${fileName || "document.txt"}":\n\n"""\n${textContent.slice(
          0,
          60000
        )}\n"""\n`,
      });
    } else {
      // PDF or Images (PNG, JPG, etc.) passed via inline base64
      parts.push({
        inlineData: {
          mimeType: mimeType || "application/pdf",
          data: fileBuffer.toString("base64"),
        },
      });
    }
  }

  parts.push({
    text: `Student Question about this document:\n${prompt}\n\nPlease analyze the provided document thoroughly and answer the student's question accurately based on the document contents. If specific facts or formulas are mentioned, cite them clearly. If the answer cannot be found in the document, clarify that while providing general helpful guidance.`,
  });

  const contents = [{ role: "user", parts }];

  const systemInstruction =
    "You are Studify AI's Document Study Assistant. You specialize in reading study materials (PDFs, notes, textbooks, and problem sheets) and answering student queries, explaining difficult sections, creating summaries, and solving exercises based on the uploaded file.";

  const result = await callGeminiApi({
    contents,
    systemInstruction,
    generationConfig: { temperature: 0.4 },
  });

  return result.text;
}

/**
 * Generate a comprehensive topic study guide
 */
export const generateTopicStudyGuide = async ({
  topic,
  subject = "General",
  level = "School",
  difficulty = "Medium",
  length = "Medium",
  includeQuestions = true,
}) => {
  const prompt = `Create a comprehensive, beautifully structured study guide for a student.
Topic: "${topic}"
Subject: "${subject}"
Education Level: "${level}"
Difficulty: "${difficulty}"
Desired Length: "${length}"

Format the guide with the following sections:
# ${topic}
## Overview & Core Concepts
(Clear summary explaining what this topic is and why it matters)

## Key Principles & Step-by-Step Breakdown
(Detailed explanation with definitions, concepts, and real-world analogies)

## Important Formulas / Key Facts / Rules
(List the most critical points students must remember for exams)

## Real-World Applications & Examples
(Practical examples connecting theory to practice)

## Common Mistakes & Pro Tips
(What students often get wrong on exams and how to avoid it)

${
  includeQuestions
    ? `## Quick Practice Questions & Answers
(5 high-quality practice questions with concise explanations)`
    : ""
}

## Summary & Key Takeaways
(Quick 3-bullet recap for quick revision)
`;

  const result = await callGeminiApi({
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction:
      "You are Studify AI, an expert educational author. Produce engaging, crystal-clear, structured study guides tailored to students.",
    generationConfig: { temperature: 0.5, maxOutputTokens: 4096 },
  });

  return result.text;
}

/**
 * Generate practice questions set
 */
export const generatePracticeQuestions = async ({
  topic,
  subject = "General",
  difficulty = "Medium",
  count = 10,
}) => {
  const prompt = `Create ${count} practice questions for the subject "${subject}" on the topic: "${topic}".
Difficulty level: ${difficulty}.

For each question:
1. Provide the question clearly with number (e.g. Q1, Q2...).
2. Provide the step-by-step solution / answer.
3. Provide a clear explanation of the concept tested and tips for exams.`;

  const result = await callGeminiApi({
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction:
      "You are Studify AI's practice test specialist. Produce clear, high-yield practice questions.",
    generationConfig: { temperature: 0.6 },
  });

  return result.text;
}

/**
 * Generate AI Mock Exam (structured JSON)
 */
export const generateMockExamQuestions = async ({
  topic,
  subject = "General",
  difficulty = "Medium",
  count = 10,
  fileBuffer = null,
  mimeType = null,
  fileName = null,
}) => {
  const parts = [];

  if (fileBuffer) {
    if (mimeType === "text/plain") {
      parts.push({
        text: `Based on this uploaded study document "${fileName || "document.txt"}":\n"""\n${fileBuffer
          .toString("utf-8")
          .slice(0, 50000)}\n"""\n`,
      });
    } else {
      parts.push({
        inlineData: {
          mimeType: mimeType || "application/pdf",
          data: fileBuffer.toString("base64"),
        },
      });
    }
  }

  const prompt = `Generate exactly ${count} multiple-choice questions (MCQs) for an interactive student mock exam.
Subject: "${subject}"
Topic / Syllabus: "${topic || "General revision for this subject"}"
Difficulty: "${difficulty}"

Each question MUST have:
1. "question": string - The question prompt.
2. "options": array of exactly 4 plausible answer string choices.
3. "answer": integer 0, 1, 2, or 3 - The zero-based index of the single correct option.
4. "explanation": string - Detailed explanation explaining why that option is correct and why other options are incorrect.

You MUST respond with ONLY a valid JSON array of question objects. Do not include markdown code fences, do not include introductory text.`;

  parts.push({ text: prompt });

  const result = await callGeminiApi({
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: "application/json",
    },
  });

  let raw = result.text.trim();
  // Strip potential backticks if returned
  if (raw.startsWith("```json")) {
    raw = raw.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (raw.startsWith("```")) {
    raw = raw.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  try {
    const questions = JSON.parse(raw);
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Gemini response is not a list of questions.");
    }
    // Validate and sanitize questions
    const sanitized = questions.map((q, idx) => {
      const options = Array.isArray(q.options) && q.options.length >= 2
        ? q.options.slice(0, 4).map((opt) => String(opt))
        : ["Option A", "Option B", "Option C", "Option D"];

      let answer = Number(q.answer);
      if (!Number.isInteger(answer) || answer < 0 || answer >= options.length) {
        answer = 0;
      }

      return {
        id: idx + 1,
        question: typeof q.question === "string" ? q.question : `Question ${idx + 1}`,
        options,
        answer,
        explanation: typeof q.explanation === "string" ? q.explanation : "No explanation provided.",
      };
    });

    return sanitized;
  } catch (parseError) {
    console.error("Failed to parse Gemini mock exam JSON:", raw);
    throw new GeminiServiceError(
      "Could not parse the AI-generated mock exam questions. Please try again.",
      502,
      raw
    );
  }
};

