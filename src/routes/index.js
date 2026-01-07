import { Router } from "express";

const router = Router();

// Phase 2: aggregator placeholder.
// In Phase 3+ we will mount: authRoutes, userRoutes, taskRoutes, etc.
router.get("/health", (req, res) => {
  res.json({ success: true, message: "API healthy" });
});

export default router;