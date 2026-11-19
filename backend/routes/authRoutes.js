import express from "express";
import {
  adminOnly,
  currentUser,
  login,
  logout,
  register,
  socialLogin,
  githubOAuthRedirect,
  githubOAuthCallback,
} from "../controllers/authController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/social-login", socialLogin);
router.post("/logout", logout);
router.get("/me", requireAuth, currentUser);
router.get("/admin", requireAuth, requireRole("admin"), adminOnly);

// GitHub OAuth – browser-redirect flow
router.get("/github", githubOAuthRedirect);
router.get("/github/callback", githubOAuthCallback);

export default router;
