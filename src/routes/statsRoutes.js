import { Router } from "express";
import { getPublicStats, getTopWorkers } from "../controllers/statsController.js";

const router = Router();

// Public endpoints for homepage
router.get("/top-workers", getTopWorkers);
router.get("/public", getPublicStats);

export default router;