import express from "express";
import authController, { upload } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// Protected routes
router.post("/logout", protect, authController.logout);
router.post("/change-password", protect, authController.changePassword);
router.get("/profile", protect, authController.getProfile);
router.patch("/profile", protect, authController.updateProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), authController.uploadAvatar);

router.get("/sessions", protect, authController.getSessions);
router.delete("/sessions/:sessionId", protect, authController.revokeSession);
router.delete("/sessions/all", protect, authController.revokeAllSessions);

router.delete("/user/account", protect, authController.deleteAccount);

export default router;
