import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getMyProfile } from "../controllers/userController.js";

const router = Router();

// Logged-in user profile from server token
router.get("/me", authMiddleware, getMyProfile);

export default router;