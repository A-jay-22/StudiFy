import PDFDocument from "pdfkit";

/**
 * Generate a clean, beautifully formatted PDF buffer for a study topic, questions, or exam.
 *
 * @param {Object} options
 * @param {string} options.title - The title of the document
 * @param {string} options.subject - Subject (e.g. Physics, Biology)
 * @param {string} [options.kind] - "topic", "questions", "exam", "material"
 * @param {string} [options.subtitle] - Extra detail (e.g. Class 10 · Medium)
 * @param {string} options.content - The text / markdown content
 * @param {Object} [options.details] - Metadata details
 * @returns {Promise<Buffer>}
 */
export const generatePdfBuffer = ({
  title,
  subject = "General",
  kind = "topic",
  subtitle = "",
  content = "",
  details = {},
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 45, bottom: 45, left: 50, right: 50 },
        bufferPages: true,
        info: {
          Title: title,
          Author: "Studify AI",
          Subject: subject,
          Keywords: "Study Guide, AI, Notes, Studify",
        },
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - 100;

      // 1. BRANDING BANNER
      doc
        .rect(0, 0, pageWidth, 28)
        .fill("#1e3a8a");

      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("STUDIFY AI  |  SMART LEARNING PLATFORM", 50, 9, {
          characterSpacing: 1,
        });

      doc.y = 48;

      // 2. METADATA BADGES
      const kindLabel =
        kind === "topic"
          ? "AI STUDY GUIDE"
          : kind === "questions"
          ? "PRACTICE QUESTION SET"
          : kind === "exam"
          ? "MOCK EXAM REPORT"
          : "STUDY MATERIAL";

      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("#2563eb")
        .text(kindLabel, { characterSpacing: 0.5 });

      doc.moveDown(0.3);

      // 3. TITLE
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor("#0f172a")
        .text(title, { width: contentWidth, lineGap: 2 });

      doc.moveDown(0.4);

      // 4. SUBTITLE & METADATA BAR
      const metaParts = [`Subject: ${subject}`];
      if (details.level) metaParts.push(`Level: ${details.level}`);
      if (details.difficulty) metaParts.push(`Difficulty: ${details.difficulty}`);
      if (details.score !== undefined && details.totalQuestions !== undefined) {
        metaParts.push(
          `Score: ${details.score}/${details.totalQuestions} (${
            details.percentage ||
            Math.round((details.score / Math.max(1, details.totalQuestions)) * 100)
          }%)`
        );
      }
      if (subtitle) metaParts.push(subtitle);
      metaParts.push(`Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#64748b")
        .text(metaParts.join("   •   "), { width: contentWidth });

      doc.moveDown(0.6);

      // Horizontal separator line
      doc
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(pageWidth - 50, doc.y)
        .stroke();

      doc.moveDown(0.8);

      // 5. PARSE & RENDER CONTENT
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trimEnd();

        // Check page overflow headroom
        if (doc.y > doc.page.height - 70) {
          doc.addPage();
        }

        if (!line.trim()) {
          doc.moveDown(0.4);
          continue;
        }

        // Heading 1: # Title
        if (line.startsWith("# ")) {
          const text = line.replace(/^#\s+/, "").replace(/\*\*/g, "");
          doc.moveDown(0.6);
          doc
            .font("Helvetica-Bold")
            .fontSize(16)
            .fillColor("#0f172a")
            .text(text, { width: contentWidth });
          doc.moveDown(0.3);
          continue;
        }

        // Heading 2: ## Subtitle
        if (line.startsWith("## ")) {
          const text = line.replace(/^##\s+/, "").replace(/\*\*/g, "");
          doc.moveDown(0.6);
          doc
            .font("Helvetica-Bold")
            .fontSize(13)
            .fillColor("#1e40af")
            .text(text, { width: contentWidth });

          doc.moveDown(0.2);
          doc
            .strokeColor("#dbeafe")
            .lineWidth(0.8)
            .moveTo(50, doc.y)
            .lineTo(pageWidth - 50, doc.y)
            .stroke();

          doc.moveDown(0.3);
          continue;
        }

        // Heading 3: ### Sub-section
        if (line.startsWith("### ")) {
          const text = line.replace(/^###\s+/, "").replace(/\*\*/g, "");
          doc.moveDown(0.4);
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor("#334155")
            .text(text, { width: contentWidth });
          doc.moveDown(0.2);
          continue;
        }

        // Blockquotes or Callouts: > text
        if (line.startsWith(">")) {
          const quoteText = line.replace(/^>\s*/, "").replace(/\*\*/g, "");
          doc.moveDown(0.2);
          const startY = doc.y;

          doc
            .font("Helvetica-Oblique")
            .fontSize(9.5)
            .fillColor("#1e3a8a")
            .text(quoteText, 62, startY, { width: contentWidth - 20, lineGap: 2 });

          const endY = doc.y;
          doc
            .strokeColor("#3b82f6")
            .lineWidth(2.5)
            .moveTo(53, startY)
            .lineTo(53, endY)
            .stroke();

          doc.x = 50;
          doc.moveDown(0.3);
          continue;
        }

        // Bullet points: * or - or •
        if (line.match(/^[\*\-•]\s+/)) {
          const bulletText = line.replace(/^[\*\-•]\s+/, "");
          const cleanText = bulletText.replace(/\*\*(.*?)\*\*/g, "$1");

          doc
            .font("Helvetica")
            .fontSize(9.5)
            .fillColor("#2563eb")
            .text("•", 52, doc.y, { continued: true });

          doc
            .font("Helvetica")
            .fontSize(9.5)
            .fillColor("#334155")
            .text(`  ${cleanText}`, { width: contentWidth - 10, lineGap: 1.5 });

          doc.x = 50;
          continue;
        }

        // Numbered list: 1. 2. etc.
        const numMatch = line.match(/^(\d+[\.\)])\s+(.*)/);
        if (numMatch) {
          const numPrefix = numMatch[1];
          const rest = numMatch[2].replace(/\*\*(.*?)\*\*/g, "$1");

          doc
            .font("Helvetica-Bold")
            .fontSize(9.5)
            .fillColor("#1e40af")
            .text(numPrefix, 50, doc.y, { continued: true });

          doc
            .font("Helvetica")
            .fontSize(9.5)
            .fillColor("#334155")
            .text(`  ${rest}`, { width: contentWidth - 15, lineGap: 1.5 });

          doc.x = 50;
          continue;
        }

        // Regular paragraph text
        const cleanParagraph = line.replace(/\*\*(.*?)\*\*/g, "$1");
        doc
          .font("Helvetica")
          .fontSize(9.5)
          .fillColor("#334155")
          .text(cleanParagraph, 50, doc.y, {
            width: contentWidth,
            lineGap: 2,
            align: "left",
          });
      }

      // 6. ADD PAGE NUMBERS & FOOTER TO ALL PAGES
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        // Thin separator line above footer
        doc
          .strokeColor("#cbd5e1")
          .lineWidth(0.5)
          .moveTo(50, doc.page.height - 35)
          .lineTo(pageWidth - 50, doc.page.height - 35)
          .stroke();

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#94a3b8")
          .text("Studify AI  •  Personalized Study Material", 50, doc.page.height - 27, {
            lineBreak: false,
          });

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#94a3b8")
          .text(
            `Page ${i + 1} of ${range.count}`,
            pageWidth - 120,
            doc.page.height - 27,
            { width: 70, align: "right", lineBreak: false }
          );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

