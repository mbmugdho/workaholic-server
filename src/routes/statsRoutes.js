import { Router } from "express";
import { getPublicStats, getTopWorkers, getBuyerSummary } from "../controllers/statsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import verifyBuyer from "../middlewares/verifyBuyer.js";

const router = Router();

// Public endpoints for homepage
router.get("/top-workers", getTopWorkers);
router.get("/public", getPublicStats);

// Buyer dashboard summary
router.get("/buyer/summary", authMiddleware, verifyBuyer, getBuyerSummary);

export default router;