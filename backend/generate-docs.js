import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT = path.join(__dirname, "..", "Studify_Project_Documentation.pdf");

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  bufferPages: true,
  info: {
    Title: "Studify – AI-Powered Study Platform – Project Documentation",
    Author: "Studify Development Team",
    Subject: "Full-Stack Project Documentation",
    Keywords: "Studify, MERN, React, Node.js, AI, Gemini, MongoDB",
  },
});

const stream = fs.createWriteStream(OUTPUT);
doc.pipe(stream);

const PW = doc.page.width;
const CW = PW - 110;
const LM = 55;

const C = {
  brand: "#1e3a8a",
  accent: "#2563eb",
  heading: "#0f172a",
  subheading: "#1e40af",
  body: "#334155",
  muted: "#64748b",
  light: "#94a3b8",
  bullet: "#2563eb",
  bgLight: "#f1f5f9",
  line: "#e2e8f0",
  white: "#ffffff",
};

function banner(text) {
  doc.rect(0, 0, PW, 30).fill(C.brand);
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(9).text(text, LM, 10, { characterSpacing: 1.2 });
  doc.y = 50;
}

function sectionTitle(text) {
  checkPage(40);
  doc.moveDown(0.8);
  doc.font("Helvetica-Bold").fontSize(18).fillColor(C.heading).text(text, LM, doc.y, { width: CW });
  doc.moveDown(0.15);
  doc.strokeColor(C.accent).lineWidth(2).moveTo(LM, doc.y).lineTo(LM + 120, doc.y).stroke();
  doc.moveDown(0.5);
}

function subSection(text) {
  checkPage(30);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(C.subheading).text(text, LM, doc.y, { width: CW });
  doc.moveDown(0.25);
}

function subSubSection(text) {
  checkPage(24);
  doc.moveDown(0.3);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.heading).text(text, LM, doc.y, { width: CW });
  doc.moveDown(0.15);
}

function para(text) {
  checkPage(18);
  doc.font("Helvetica").fontSize(10).fillColor(C.body).text(text, LM, doc.y, { width: CW, lineGap: 2.5 });
  doc.moveDown(0.25);
}

function bullet(text, indent = 0) {
  checkPage(16);
  const x = LM + 8 + indent * 12;
  doc.font("Helvetica").fontSize(10).fillColor(C.bullet).text("•", x, doc.y, { continued: true });
  doc.font("Helvetica").fontSize(10).fillColor(C.body).text(`  ${text}`, { width: CW - 16 - indent * 12, lineGap: 2 });
}

function boldBullet(label, value) {
  checkPage(16);
  const x = LM + 8;
  doc.font("Helvetica").fontSize(10).fillColor(C.bullet).text("•", x, doc.y, { continued: true });
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.heading).text(`  ${label}: `, { continued: true });
  doc.font("Helvetica").fillColor(C.body).text(value, { width: CW - 16, lineGap: 2 });
}

function codeBlock(lines) {
  checkPage(lines.length * 13 + 16);
  const startY = doc.y;
  doc.rect(LM + 4, startY - 2, CW - 8, lines.length * 12.5 + 10).fill("#f8fafc");
  doc.y = startY + 4;
  for (const line of lines) {
    doc.font("Courier").fontSize(8.5).fillColor("#1e293b").text(line, LM + 14, doc.y, { width: CW - 28, lineGap: 0.5 });
  }
  doc.moveDown(0.3);
}

function tableRow(cells, isHeader = false) {
  checkPage(18);
  const colWidths = cells.length === 2 ? [CW * 0.35, CW * 0.65]
    : cells.length === 3 ? [CW * 0.22, CW * 0.33, CW * 0.45]
    : cells.length === 4 ? [CW * 0.18, CW * 0.22, CW * 0.25, CW * 0.35]
    : cells.map(() => CW / cells.length);
  const y = doc.y;
  if (isHeader) doc.rect(LM, y - 2, CW, 16).fill(C.bgLight);
  let x = LM + 4;
  cells.forEach((cell, i) => {
    doc.font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor(isHeader ? C.heading : C.body)
      .text(cell, x, y, { width: colWidths[i] - 8, lineBreak: false });
    x += colWidths[i];
  });
  doc.y = y + 16;
}

function separator() {
  doc.moveDown(0.3);
  doc.strokeColor(C.line).lineWidth(0.5).moveTo(LM, doc.y).lineTo(PW - LM, doc.y).stroke();
  doc.moveDown(0.4);
}

function checkPage(need = 40) {
  if (doc.y > doc.page.height - 60 - need) doc.addPage();
}

function noteBox(text) {
  checkPage(40);
  const startY = doc.y;
  doc.rect(LM, startY, CW, 30).fill("#eff6ff");
  doc.rect(LM, startY, 3, 30).fill(C.accent);
  doc.font("Helvetica").fontSize(9).fillColor(C.subheading).text(text, LM + 12, startY + 9, { width: CW - 20 });
  doc.y = startY + 36;
}

// ═══════════ COVER PAGE ═══════════
doc.rect(0, 0, PW, doc.page.height).fill("#0f172a");
doc.circle(PW - 80, 180, 200).fill("#1e3a8a");
doc.circle(80, doc.page.height - 120, 120).fill("#1e3a8a");

doc.font("Helvetica-Bold").fontSize(12).fillColor("#60a5fa")
  .text("FULL-STACK PROJECT DOCUMENTATION", LM + 10, 200, { characterSpacing: 2.5 });
doc.font("Helvetica-Bold").fontSize(42).fillColor(C.white).text("Studify", LM + 10, 240, { width: CW });
doc.font("Helvetica").fontSize(18).fillColor("#93c5fd").text("AI-Powered Smart Study Platform", LM + 10, 295, { width: CW });

doc.font("Helvetica").fontSize(12).fillColor("#94a3b8").text(
  "A comprehensive full-stack web application built with React, Node.js, Express, MongoDB, and Google Gemini AI. Studify helps students generate AI study guides, take AI mock exams, chat with uploaded documents, track progress, and download PDF reports — all from a single, beautiful dashboard.",
  LM + 10, 360, { width: CW - 20, lineGap: 4 }
);

const badges = ["React 18", "Node.js / Express 5", "MongoDB / Mongoose", "Google Gemini AI", "TailwindCSS 3", "PDFKit", "JWT Auth", "GitHub OAuth"];
let bx = LM + 10, by = 480;
for (const badge of badges) {
  const w = doc.widthOfString(badge) + 20;
  if (bx + w > PW - LM) { bx = LM + 10; by += 28; }
  doc.roundedRect(bx, by, w, 22, 6).fill("#1e3a8a");
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#93c5fd").text(badge, bx + 10, by + 6, { lineBreak: false });
  bx += w + 8;
}

doc.font("Helvetica").fontSize(10).fillColor("#64748b")
  .text(`Document generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, LM + 10, doc.page.height - 100);
doc.font("Helvetica").fontSize(10).fillColor("#64748b").text("Version 1.0.0", LM + 10, doc.page.height - 82);

// ═══════════ TABLE OF CONTENTS ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
doc.font("Helvetica-Bold").fontSize(22).fillColor(C.heading).text("Table of Contents", LM);
doc.moveDown(0.8);

const tocItems = [
  "1. Project Overview", "2. Technology Stack", "3. System Architecture", "4. Project Structure",
  "5. Backend Documentation", "   5.1 Server Entry Point", "   5.2 Database Models", "   5.3 Authentication System",
  "   5.4 Study API Endpoints", "   5.5 AI Service (Gemini)", "   5.6 PDF Generation Service",
  "6. Frontend Documentation", "   6.1 Application Entry", "   6.2 State Management", "   6.3 API Client Layer", "   6.4 UI Components",
  "7. Authentication Flows", "8. AI Features & Gemini Integration", "9. API Reference",
  "10. Environment Configuration", "11. Setup & Installation Guide", "12. Security Considerations", "13. Future Enhancements",
];
for (const item of tocItems) {
  const indent = item.startsWith("   ") ? 20 : 0;
  doc.font(indent ? "Helvetica" : "Helvetica-Bold").fontSize(indent ? 10 : 11).fillColor(indent ? C.body : C.heading)
    .text(item.trim(), LM + indent, doc.y, { width: CW, lineGap: 4 });
}

// ═══════════ 1. PROJECT OVERVIEW ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
sectionTitle("1. Project Overview");
para("Studify is a full-stack AI-powered educational platform designed to help students learn more effectively. It combines the power of Google's Gemini AI with a modern MERN stack to provide an intelligent, personalized study experience.");
para("The platform allows students to:");
bullet("Generate comprehensive AI study guides on any topic, automatically saved as PDFs");
bullet("Take AI-generated mock exams with real-time grading and detailed explanations");
bullet("Upload study materials (PDF, TXT, images) and chat with them using AI");
bullet("Generate targeted practice question sets");
bullet("Track study time, exam performance, and overall progress");
bullet("Download all generated content as professionally formatted PDFs");
bullet("Authenticate securely via email/password, Google OAuth, or GitHub OAuth");
doc.moveDown(0.3);
para("The project follows a clean separation of concerns with a React frontend communicating with an Express.js REST API backend, backed by MongoDB for persistent storage and Google Gemini for AI capabilities.");

// ═══════════ 2. TECHNOLOGY STACK ═══════════
sectionTitle("2. Technology Stack");
subSection("Frontend");
tableRow(["Technology", "Version", "Purpose"], true);
tableRow(["React", "18.3.1", "UI framework with hooks"]);
tableRow(["Vite", "6.0.5", "Build tool & dev server"]);
tableRow(["TailwindCSS", "3.4.16", "Utility-first CSS"]);
tableRow(["Lucide React", "0.468.0", "Icon library"]);
tableRow(["@react-oauth/google", "0.13.5", "Google sign-in"]);
doc.moveDown(0.3);
subSection("Backend");
tableRow(["Technology", "Version", "Purpose"], true);
tableRow(["Node.js", "ES Modules", "Runtime environment"]);
tableRow(["Express", "5.3.0", "HTTP framework"]);
tableRow(["Mongoose", "9.11.4", "MongoDB ODM"]);
tableRow(["@google/genai", "2.32.0", "Gemini AI SDK"]);
tableRow(["PDFKit", "0.20.2", "PDF generation"]);
tableRow(["jsonwebtoken", "9.0.3", "JWT auth tokens"]);
tableRow(["bcryptjs", "3.0.3", "Password hashing"]);
tableRow(["Multer", "2.5.0", "File upload handling"]);
doc.moveDown(0.3);
subSection("Infrastructure");
bullet("Database: MongoDB (local or Atlas)");
bullet("AI Engine: Google Gemini 3.5 Flash (with fallback chain)");
bullet("Auth Providers: Local, Google, GitHub");
bullet("Module System: ES Modules (type: \"module\") across both frontend & backend");

// ═══════════ 3. SYSTEM ARCHITECTURE ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
sectionTitle("3. System Architecture");
para("Studify follows a classic three-tier architecture with clear separation between the presentation layer, application logic, and data storage:");
doc.moveDown(0.3);

const archLines = [
  "┌──────────────────────────────────────────────────────────────┐",
  "│                   CLIENT (React + Vite)                      │",
  "│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────────┐  │",
  "│  │  Login   │ │Dashboard │ │ AskAI  │ │   MockExam       │  │",
  "│  │ (OAuth)  │ │ (Stats)  │ │ (Chat) │ │  (Quiz Engine)   │  │",
  "│  └──────────┘ └──────────┘ └────────┘ └──────────────────┘  │",
  "│          StudyContext (Global State) + API Client            │",
  "└──────────────────────────┬───────────────────────────────────┘",
  "                           │  HTTP / REST (JSON + Cookies)",
  "┌──────────────────────────▼───────────────────────────────────┐",
  "│                 SERVER (Express.js + Node)                   │",
  "│  ┌──────────┐ ┌────────────┐ ┌────────────────────────────┐ │",
  "│  │Auth Ctrl │ │Study CRUD  │ │AI Controller               │ │",
  "│  │          │ │Controller  │ │(topic, exam, questions)     │ │",
  "│  └──────────┘ └────────────┘ └────────────────────────────┘ │",
  "│  ┌──────────┐ ┌────────────┐ ┌────────────────────────────┐ │",
  "│  │JWT Auth  │ │PDF Service │ │Gemini AI Service           │ │",
  "│  │Middleware│ │(PDFKit)    │ │(API + model fallback)      │ │",
  "│  └──────────┘ └────────────┘ └────────────────────────────┘ │",
  "└──────┬─────────────────┬──────────────────┬─────────────────┘",
  "       │                 │                  │",
  "  ┌────▼─────┐    ┌──────▼──────┐   ┌──────▼───────┐",
  "  │ MongoDB  │    │ GitHub API  │   │ Gemini API   │",
  "  │ Database │    │ (OAuth)     │   │ (Google AI)  │",
  "  └──────────┘    └─────────────┘   └──────────────┘",
];
for (const line of archLines) {
  doc.font("Courier").fontSize(7).fillColor("#1e293b").text(line, LM + 4, doc.y, { width: CW, lineGap: 0 });
}
doc.moveDown(0.5);
para("Data Flow:");
bullet("Frontend sends REST requests to /api/* with JWT cookie or Bearer token");
bullet("Auth middleware validates JWT before protected routes");
bullet("AI Controller delegates to Gemini Service with automatic model fallback");
bullet("Generated content is auto-saved to MongoDB with optional PDF binary");
bullet("Files are stored as binary buffers in MongoDB (file.data with select: false)");

// ═══════════ 4. PROJECT STRUCTURE ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
sectionTitle("4. Project Structure");
codeBlock([
  "10.Studify/",
  "├── backend/",
  "│   ├── config/.env              # Environment variables",
  "│   ├── controllers/",
  "│   │   ├── aiController.js      # AI generation endpoints",
  "│   │   ├── authController.js    # Auth (register/login/OAuth)",
  "│   │   └── studyController.js   # CRUD + download + progress",
  "│   ├── middleware/",
  "│   │   └── authMiddleware.js    # JWT verification + RBAC",
  "│   ├── models/",
  "│   │   ├── User.js              # User schema (multi-auth)",
  "│   │   ├── StudyRecord.js       # Topics, exams, materials",
  "│   │   └── StudySession.js      # Time tracking records",
  "│   ├── routes/",
  "│   │   ├── authRoutes.js        # /api/auth/*",
  "│   │   └── studyRoutes.js       # /api/study/*",
  "│   ├── services/",
  "│   │   ├── aiService.js         # Gemini API integration",
  "│   │   └── pdfService.js        # PDFKit document generator",
  "│   ├── app.js                   # Express server entry",
  "│   └── package.json",
  "├── frontand/",
  "│   ├── src/",
  "│   │   ├── api/auth.js          # Auth API client",
  "│   │   ├── api/study.js         # Study API client",
  "│   │   ├── component/           # 13 React components",
  "│   │   ├── redux/               # Redux store + 9 slices",
  "│   │   ├── App.jsx              # Root component + auth",
  "│   │   ├── StudyContext.jsx     # Global study state",
  "│   │   └── index.css            # Global styles",
  "│   ├── tailwind.config.js",
  "│   ├── vite.config.js",
  "│   └── package.json",
  "└── .gitignore",
]);

// ═══════════ 5. BACKEND DOCUMENTATION ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
sectionTitle("5. Backend Documentation");

subSection("5.1 Server Entry Point (app.js)");
para("The Express application is configured in app.js with ES module syntax. It sets up CORS for the frontend origin, JSON body parsing (1MB limit), cookie parsing, and mounts two route groups:");
bullet("/api/auth – Authentication routes (register, login, social, OAuth, logout)");
bullet("/api/study – All study-related CRUD, AI generation, file upload/download");
bullet("/api/health – Simple health check endpoint");
para("The server connects to MongoDB (configurable via MONGODB_URI, defaults to localhost:27017/studify) and requires a JWT_SECRET of at least 32 characters. It runs on port 5000 by default.");
noteBox("CORS is configured to accept multiple frontend origins (comma-separated), with localhost auto-included in development.");

separator();
subSection("5.2 Database Models");
subSubSection("User Model");
para("Supports multi-provider authentication with the following schema:");
tableRow(["Field", "Type", "Description"], true);
tableRow(["name", "String", "User's display name (max 80)"]);
tableRow(["email", "String", "Unique, lowercase (max 254)"]);
tableRow(["passwordHash", "String", "Bcrypt hash (select: false)"]);
tableRow(["authProvider", "String", "local | google | github | microsoft"]);
tableRow(["providerId", "String", "OAuth provider's user ID"]);
tableRow(["avatar", "String", "Profile picture URL"]);
tableRow(["role", "String", "student | admin (default: student)"]);
tableRow(["tokenVersion", "Number", "For secure token invalidation"]);

doc.moveDown(0.3);
subSubSection("StudyRecord Model");
para("Central model for all user-generated study content:");
tableRow(["Field", "Type", "Description"], true);
tableRow(["userId", "ObjectId", "Reference to User (indexed)"]);
tableRow(["kind", "String", "topic | exam | material | questions"]);
tableRow(["title", "String", "Record title (max 200)"]);
tableRow(["subject", "String", "Academic subject (max 80)"]);
tableRow(["content", "String", "Full text content (max 100K)"]);
tableRow(["details", "Mixed", "Flexible metadata (scores, etc.)"]);
tableRow(["file", "Object", "name, mimeType, data (Buffer)"]);

doc.moveDown(0.3);
subSubSection("StudySession Model");
para("Tracks individual study time segments:");
tableRow(["Field", "Type", "Description"], true);
tableRow(["userId", "ObjectId", "Reference to User"]);
tableRow(["seconds", "Number", "Duration (1-300 seconds)"]);
tableRow(["page", "String", "Active page name (max 80)"]);

// ═══════════ 5.3 AUTH SYSTEM ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
subSection("5.3 Authentication System");
para("Studify implements a robust multi-provider authentication system with JWT session tokens stored in HTTP-only cookies. The auth middleware extracts tokens from cookies or Authorization headers and validates against the stored tokenVersion for secure logout.");

subSubSection("Local Authentication");
bullet("Registration: Name, email, password → bcrypt hash (12 rounds) → JWT cookie");
bullet("Login: Email + password → bcrypt compare → JWT cookie");
bullet("Password Requirements: 8-72 UTF-8 bytes");
bullet("Session Duration: 7 days");

subSubSection("Google OAuth");
bullet("Frontend uses @react-oauth/google for consent flow");
bullet("Backend socialLogin endpoint creates/updates user account");
bullet("Sets JWT session cookie on success");

subSubSection("GitHub OAuth (Server-Side Flow)");
para("Full server-side OAuth redirect flow:");
bullet("Step 1: Frontend redirects browser to /api/auth/github");
bullet("Step 2: Backend redirects to GitHub authorization URL");
bullet("Step 3: GitHub redirects back with authorization code");
bullet("Step 4: Backend exchanges code for access token");
bullet("Step 5: Backend fetches user profile + emails from GitHub API");
bullet("Step 6: Creates/updates user, sets cookie, redirects to frontend");

subSubSection("Token Invalidation");
para("On logout, tokenVersion is incremented. Any existing tokens with the old tokenVersion are automatically rejected, providing immediate session invalidation across all devices.");

separator();

subSection("5.4 Study Controller Endpoints");
bullet("List Records – GET /api/study/items – All user records (filtered by kind)");
bullet("Create Record – POST /api/study/items – Auto-generates PDF for topics/exams/questions");
bullet("Upload Material – POST /api/study/items/upload – File upload via Multer (15MB limit)");
bullet("Update Record – PUT /api/study/items/:id");
bullet("Delete Record – DELETE /api/study/items/:id");
bullet("Download – GET /api/study/items/:id/download – Supports PDF/TXT/MD + inline viewing");
bullet("Track Session – POST /api/study/sessions – Records study time");
bullet("Progress – GET /api/study/progress – Aggregated analytics");

separator();

subSection("5.5 AI Service (Gemini Integration)");
para("The AI service integrates with Google's Generative AI API using a direct REST approach with automatic model fallback.");

subSubSection("Model Fallback Chain");
bullet("Primary: gemini-3.5-flash (ultra-fast, reliable)");
bullet("Fallback 1: gemini-3.5-flash-lite (high-speed backup)");
bullet("Fallback 2: gemini-3.8-flash (latest generation)");

subSubSection("AI Actions");
boldBullet("answerQuestion", "General Q&A with 6-message conversation history");
boldBullet("chatWithDocument", "Upload-aware chat (PDF as base64, TXT as text)");
boldBullet("generateTopicStudyGuide", "Structured study guide with 7 sections");
boldBullet("generatePracticeQuestions", "Numbered Q&A with solutions and exam tips");
boldBullet("generateMockExamQuestions", "JSON MCQ array with explanations (responseMimeType: application/json)");

doc.moveDown(0.2);
subSubSection("Error Handling");
bullet("45-second timeout per API call");
bullet("Automatic retry across 3 models for 404/429/500/503/504");
bullet("Custom GeminiServiceError class with status codes");
bullet("JSON parsing with markdown code fence cleanup");

separator();

subSection("5.6 PDF Generation Service");
para("Uses PDFKit to create professionally formatted A4 PDFs:");
bullet("Branded header bar with 'STUDIFY AI | SMART LEARNING PLATFORM'");
bullet("Dynamic type badges: AI STUDY GUIDE, PRACTICE QUESTION SET, MOCK EXAM REPORT");
bullet("Metadata bar: Subject, Level, Difficulty, Score, Date");
bullet("Markdown-like rendering: H1/H2/H3, bullets, numbered lists, blockquotes");
bullet("Page numbers and footer on every page");

// ═══════════ 6. FRONTEND DOCUMENTATION ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
sectionTitle("6. Frontend Documentation");

subSection("6.1 Application Entry & Routing");
para("The frontend uses a single-page architecture with conditional rendering based on authentication state. The Dashboard component manages view switching through a 'page' state variable controlled by the Sidebar.");
bullet("main.jsx – ReactDOM entry, wraps App in GoogleOAuthProvider");
bullet("App.jsx – Root component managing auth state, session checking, toasts");
bullet("Dashboard.jsx – Main shell with Sidebar navigation");
para("On mount, App.jsx checks for OAuth redirect parameters from GitHub's flow, stores the token, then calls /api/auth/me to restore the session.");

separator();
subSection("6.2 State Management (StudyContext)");
para("React Context provides centralized state for all study data:");
bullet("items – Array of all user's study records");
bullet("progress – Aggregated analytics data");
bullet("CRUD Operations: createItem, saveCreatedItem, deleteItem, updateItem, uploadItem");
bullet("Automatic study time tracking (15s intervals, 30s flush threshold)");
bullet("Flushes on page hide/pagehide for accurate tracking");

separator();
subSection("6.3 API Client Layer");
para("Two API modules handle all HTTP communication:");
boldBullet("auth.js", "Token storage (localStorage), request wrapper with cookies + Bearer token, authApi methods");
boldBullet("study.js", "Full study API: CRUD, file upload (FormData), download URLs, AI generation, document Q&A");

separator();
subSection("6.4 UI Components");
subSubSection("Login.jsx (679 lines)");
bullet("Email/Password registration and login with form validation");
bullet("Google OAuth integration via @react-oauth/google");
bullet("GitHub OAuth via server redirect to /api/auth/github");
bullet("Animated floating background orbs, responsive design");

subSubSection("Dashboard.jsx – Main Application Shell");
bullet("Stat cards: Topics, Exams, Materials, Study time");
bullet("Weekly study time chart, recent exams list");
bullet("Quick action buttons for core features");

subSubSection("AskAI.jsx – AI Chat Interface");
bullet("General study Q&A and document-aware chat modes");
bullet("In-chat file upload, quick suggestion buttons");
bullet("6-message conversation history context");

subSubSection("MockExam.jsx (800 lines) – Interactive Exam Engine");
bullet("Setup View: topic/document source, difficulty, question count");
bullet("Taking View: question display, timer, navigation grid, auto-submit");
bullet("Result View: score card, question review, AI explanations, PDF download");

subSubSection("Other Components");
bullet("CreateTopic.jsx – AI study guide generator with PDF auto-save");
bullet("GenerateQuestions.jsx – Practice question set generator");
bullet("UploadMaterial.jsx – Drag-and-drop file upload with management");
bullet("MyTopics.jsx – Browse generated topics");
bullet("MyExams.jsx – Exam history with scores and PDFs");
bullet("ProgressReport.jsx – Detailed analytics dashboard");
bullet("Downloads.jsx – Central download manager");

// ═══════════ 7. AUTH FLOWS ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
sectionTitle("7. Authentication Flows");

subSection("7.1 Email/Password Flow");
codeBlock([
  "User fills form → POST /api/auth/register or /login",
  "  → Server validates email + password (8-72 bytes)",
  "  → bcrypt.hash(password, 12) for registration",
  "  → bcrypt.compare(password, hash) for login",
  "  → JWT signed with { sub: userId, tokenVersion }",
  "  → Set HTTP-only cookie 'studify_session' (7 days)",
  "  → Return { user, token }",
  "  → Frontend stores token in localStorage",
]);

subSection("7.2 Google OAuth Flow");
codeBlock([
  "User clicks 'Continue with Google'",
  "  → @react-oauth/google opens consent popup",
  "  → Google returns credential",
  "  → Frontend decodes credential → extracts email/name",
  "  → POST /api/auth/social-login { provider: 'google' }",
  "  → Server finds/creates user → Sets session cookie",
  "  → Frontend loads Dashboard",
]);

subSection("7.3 GitHub OAuth Flow (Server-Side)");
codeBlock([
  "User clicks 'Continue with GitHub'",
  "  → Browser redirects to /api/auth/github",
  "  → Server redirects to github.com/login/oauth/authorize",
  "  → User authorizes → GitHub redirects to callback",
  "  → GET /api/auth/github/callback?code=XXXXXX",
  "  → Server exchanges code for access_token",
  "  → Fetches /user profile + /user/emails (parallel)",
  "  → Resolves primary verified email",
  "  → Finds/creates user in MongoDB",
  "  → Sets cookie → Redirects to frontend with token",
  "  → Frontend detects auth_success → /api/auth/me",
]);

// ═══════════ 8. AI FEATURES ═══════════
sectionTitle("8. AI Features & Gemini Integration");
para("Studify leverages Google Gemini AI for five distinct educational features:");
doc.moveDown(0.2);
tableRow(["Feature", "Action", "Output"], true);
tableRow(["Study Guide", "topic", "Structured guide (auto-PDF)"]);
tableRow(["AI Chat", "answer", "Conversational answer"]);
tableRow(["Document Chat", "chat-document", "File-aware answer"]);
tableRow(["Practice Qs", "questions", "Q&A set (auto-PDF)"]);
tableRow(["Mock Exam", "mock-exam", "JSON MCQ array"]);

doc.moveDown(0.3);
subSubSection("Error Handling & Resilience");
bullet("45-second timeout per API call with AbortSignal.timeout()");
bullet("Automatic retry across 3 model variants");
bullet("Custom GeminiServiceError class");
bullet("JSON cleanup and question validation for mock exams");

// ═══════════ 9. API REFERENCE ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
sectionTitle("9. API Reference");

subSection("Authentication Endpoints");
tableRow(["Method", "Endpoint", "Auth", "Description"], true);
tableRow(["POST", "/api/auth/register", "No", "Create account"]);
tableRow(["POST", "/api/auth/login", "No", "Email/password login"]);
tableRow(["POST", "/api/auth/social-login", "No", "Google/GitHub social"]);
tableRow(["POST", "/api/auth/logout", "Yes", "Logout & invalidate"]);
tableRow(["GET", "/api/auth/me", "Yes", "Current user profile"]);
tableRow(["GET", "/api/auth/github", "No", "GitHub OAuth redirect"]);
tableRow(["GET", "/api/auth/github/callback", "No", "GitHub callback"]);
tableRow(["GET", "/api/auth/admin", "Admin", "Admin-only route"]);

doc.moveDown(0.3);
subSection("Study Endpoints");
tableRow(["Method", "Endpoint", "Description"], true);
tableRow(["GET", "/api/study/items", "List all user records"]);
tableRow(["POST", "/api/study/items", "Create a study record"]);
tableRow(["POST", "/api/study/items/upload", "Upload file"]);
tableRow(["PUT", "/api/study/items/:id", "Update record"]);
tableRow(["DELETE", "/api/study/items/:id", "Delete record"]);
tableRow(["GET", "/api/study/items/:id/download", "Download (PDF/TXT/MD)"]);
tableRow(["POST", "/api/study/sessions", "Track study time"]);
tableRow(["GET", "/api/study/progress", "Get analytics/progress"]);
tableRow(["POST", "/api/study/ai", "AI generation"]);
tableRow(["POST", "/api/study/materials/:id/ask", "Ask about material"]);

// ═══════════ 10. ENVIRONMENT CONFIG ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
sectionTitle("10. Environment Configuration");

subSection("Backend (backend/config/.env)");
tableRow(["Variable", "Required", "Description"], true);
tableRow(["MONGODB_URI", "Yes", "MongoDB connection string"]);
tableRow(["JWT_SECRET", "Yes", "JWT key (min 32 chars)"]);
tableRow(["GEMINI_API_KEY", "Yes", "Google AI API key"]);
tableRow(["PORT", "No", "Server port (default: 5000)"]);
tableRow(["NODE_ENV", "No", "production or development"]);
tableRow(["FRONTEND_ORIGIN", "No", "Frontend URLs (comma-sep)"]);
tableRow(["GITHUB_CLIENT_ID", "Opt", "GitHub OAuth client ID"]);
tableRow(["GITHUB_CLIENT_SECRET", "Opt", "GitHub OAuth secret"]);
tableRow(["GITHUB_REDIRECT_URI", "No", "GitHub callback URL"]);
tableRow(["GEMINI_MODEL", "No", "Override primary AI model"]);

doc.moveDown(0.3);
subSection("Frontend (frontand/.env)");
tableRow(["Variable", "Required", "Description"], true);
tableRow(["VITE_API_URL", "No", "Backend API base URL"]);
tableRow(["VITE_GOOGLE_CLIENT_ID", "Opt", "Google OAuth client ID"]);

// ═══════════ 11. SETUP ═══════════
sectionTitle("11. Setup & Installation Guide");

subSection("Prerequisites");
bullet("Node.js 18+ installed");
bullet("MongoDB running locally or Atlas connection string");
bullet("Google Generative AI API key for Gemini");
bullet("(Optional) GitHub OAuth App for GitHub login");
bullet("(Optional) Google Cloud OAuth for Google login");

subSection("Installation Steps");
codeBlock([
  "# 1. Install dependencies",
  "cd backend && npm install",
  "cd ../frontand && npm install",
  "",
  "# 2. Configure environment (see section 10)",
  "# Edit backend/config/.env and frontand/.env",
  "",
  "# 3. Start development servers",
  "cd backend && npm run dev     # Port 5000",
  "cd ../frontand && npm run dev # Port 5173",
  "",
  "# 4. Build for production",
  "cd frontand && npm run build  # Creates dist/",
]);

// ═══════════ 12. SECURITY ═══════════
doc.addPage();
banner("STUDIFY AI  |  PROJECT DOCUMENTATION");
sectionTitle("12. Security Considerations");
bullet("Passwords hashed with bcrypt (12 salt rounds) – never stored in plaintext");
bullet("JWT tokens stored in HTTP-only cookies (not accessible via JavaScript)");
bullet("Token versioning enables instant logout across all devices");
bullet("CORS restricted to configured frontend origins only");
bullet("File upload size limited to 15MB with MIME type validation");
bullet("Input validation and sanitization on all endpoints");
bullet("Password hash excluded from queries by default (select: false)");
bullet("File binary data excluded from list queries (select: false)");
bullet("Secure cookie flag enabled in production (HTTPS only)");
bullet("SameSite: 'lax' prevents CSRF for cross-origin POST requests");
bullet("MongoDB injection prevention via Mongoose schema validation");
bullet("API key sent only to Google's servers, never exposed to frontend");
bullet("GitHub OAuth uses server-side code exchange (secret never leaves backend)");

// ═══════════ 13. FUTURE ═══════════
sectionTitle("13. Future Enhancements");
bullet("Real-time collaborative study rooms with WebSocket support");
bullet("Spaced repetition system (SRS) for intelligent review scheduling");
bullet("Flashcard generation from AI study guides");
bullet("Teacher/admin dashboard for class management");
bullet("Multi-language support for international students");
bullet("Mobile app (React Native) for on-the-go studying");
bullet("Study group creation and shared materials");
bullet("Integration with LMS platforms (Google Classroom, Canvas)");
bullet("Voice-based AI tutoring with speech-to-text");
bullet("Advanced analytics with learning pattern detection");
bullet("Offline mode with service worker caching");
bullet("Cloud file storage migration (S3 / GCS) for scalability");

doc.moveDown(1);
separator();
doc.moveDown(0.5);
doc.font("Helvetica-Bold").fontSize(14).fillColor(C.heading).text("End of Documentation", LM, doc.y, { width: CW, align: "center" });
doc.moveDown(0.3);
doc.font("Helvetica").fontSize(10).fillColor(C.muted).text(
  "This documentation was generated for the Studify project. For questions or contributions, refer to the project repository.",
  LM, doc.y, { width: CW, align: "center" }
);

// ═══════════ PAGE NUMBERS ═══════════
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  if (i === 0) continue;
  doc.strokeColor("#cbd5e1").lineWidth(0.5).moveTo(LM, doc.page.height - 38).lineTo(PW - LM, doc.page.height - 38).stroke();
  doc.font("Helvetica").fontSize(8).fillColor(C.light).text("Studify AI  •  Project Documentation", LM, doc.page.height - 28, { lineBreak: false });
  doc.font("Helvetica").fontSize(8).fillColor(C.light).text(`Page ${i} of ${range.count - 1}`, PW - LM - 80, doc.page.height - 28, { width: 80, align: "right", lineBreak: false });
}

doc.end();

stream.on("finish", () => {
  console.log(`\n✅ Documentation PDF generated successfully!`);
  console.log(`📄 File: ${OUTPUT}`);
  console.log(`📊 Total Pages: ${range.count}`);
});
