import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import verifyBuyer from '../middlewares/verifyBuyer.js'
import verifyWorker from '../middlewares/verifyWorker.js'
import {
  createTask,
  deleteMyTask,
  getMyTasks,
  updateMyTask,
  getAvailableTasks,
  getTaskById,
} from '../controllers/taskController.js'

const router = Router()

// Buyer-only task management (keep these BEFORE any :id route)
router.post('/', authMiddleware, verifyBuyer, createTask)
router.get('/my', authMiddleware, verifyBuyer, getMyTasks)
router.patch('/:id', authMiddleware, verifyBuyer, updateMyTask)
router.delete('/:id', authMiddleware, verifyBuyer, deleteMyTask)

// Worker: available tasks list
router.get('/available', authMiddleware, verifyWorker, getAvailableTasks)

// Worker: task details (avoid /my collision)
router.get('/details/:id', authMiddleware, verifyWorker, getTaskById)

export default router
