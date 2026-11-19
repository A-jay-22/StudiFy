import express from "express";
import multer from "multer";
import {
  createRecord,
  deleteRecord,
  downloadRecord,
  listRecords,
  progress,
  trackSession,
  updateRecord,
  uploadMaterial,
} from "../controllers/studyController.js";
import { generateText, askAboutMaterial } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, callback) => {
    const allowedTypes = new Set([
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "text/plain",
      "text/markdown",
      "text/csv",
    ]);
    if (!allowedTypes.has(file.mimetype) && !file.originalname.match(/\.(pdf|txt|md|csv|png|jpe?g|webp)$/i)) {
      const error = new Error("Please upload a PDF, TXT, MD, PNG, or JPG file.");
      error.status = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

router.use(requireAuth);
router.get("/items", listRecords);
router.post("/items", createRecord);
router.post("/items/upload", upload.single("file"), uploadMaterial);
router.put("/items/:id", updateRecord);
router.delete("/items/:id", deleteRecord);
router.get("/items/:id/download", downloadRecord);
router.post("/sessions", trackSession);
router.get("/progress", progress);
router.post("/ai", generateText);
router.post("/materials/:materialId/ask", askAboutMaterial);

export default router;
