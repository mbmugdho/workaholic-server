import { Router } from "express";
import { exchangeToken, me } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Exchange Firebase ID token for server JWT + user document
router.post("/exchange", exchangeToken);

// Get current user from server token
router.get("/me", authMiddleware, me);

export default router;