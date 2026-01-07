import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import verifyBuyer from "../middlewares/verifyBuyer.js";
import verifyWorker from "../middlewares/verifyWorker.js";
import {
  createTask,
  deleteMyTask,
  getMyTasks,
  updateMyTask,
  getAvailableTasks,
  getTaskById,
} from "../controllers/taskController.js";

const router = Router();

// Worker: available tasks list
router.get("/available", authMiddleware, verifyWorker, getAvailableTasks);

// Worker: task details
router.get("/:id", authMiddleware, verifyWorker, getTaskById);

// Buyer-only task management
router.post("/", authMiddleware, verifyBuyer, createTask);
router.get("/my", authMiddleware, verifyBuyer, getMyTasks);
router.patch("/:id", authMiddleware, verifyBuyer, updateMyTask);
router.delete("/:id", authMiddleware, verifyBuyer, deleteMyTask);

export default router;