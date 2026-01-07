import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import verifyBuyer from '../middlewares/verifyBuyer.js'
import {
  createTask,
  deleteMyTask,
  getMyTasks,
  updateMyTask,
} from '../controllers/taskController.js'

const router = Router()

// Buyer-only task management
router.post('/', authMiddleware, verifyBuyer, createTask)
router.get('/my', authMiddleware, verifyBuyer, getMyTasks)
router.patch('/:id', authMiddleware, verifyBuyer, updateMyTask)
router.delete('/:id', authMiddleware, verifyBuyer, deleteMyTask)

export default router
