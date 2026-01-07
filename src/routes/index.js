import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import statsRoutes from "./statsRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "API healthy" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// Phase 6 (public)
router.use("/stats", statsRoutes);

export default router;