import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import verifyAdmin from '../middlewares/verifyAdmin.js'
import {
  approveWithdrawal,
  deleteTaskAdmin,
  deleteUser,
  getAdminSummary,
  getAllTasks,
  getAllUsers,
  getPendingWithdrawals,
  updateUserRole,
} from '../controllers/adminController.js'

const router = Router()

// Summary
router.get('/summary', authMiddleware, verifyAdmin, getAdminSummary)

// Withdrawals
router.get(
  '/withdrawals/pending',
  authMiddleware,
  verifyAdmin,
  getPendingWithdrawals
)
router.patch(
  '/withdrawals/:id/approve',
  authMiddleware,
  verifyAdmin,
  approveWithdrawal
)

// Users
router.get('/users', authMiddleware, verifyAdmin, getAllUsers)
router.patch('/users/:id/role', authMiddleware, verifyAdmin, updateUserRole)
router.delete('/users/:id', authMiddleware, verifyAdmin, deleteUser)

// Tasks
router.get('/tasks', authMiddleware, verifyAdmin, getAllTasks)
router.delete('/tasks/:id', authMiddleware, verifyAdmin, deleteTaskAdmin)

export default router
