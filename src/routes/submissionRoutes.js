import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import verifyBuyer from '../middlewares/verifyBuyer.js'
import {
  approveSubmission,
  getBuyerPendingSubmissions,
  rejectSubmission,
} from '../controllers/submissionController.js'

const router = Router()

// Buyer: task-to-review (pending submissions)
router.get(
  '/buyer/pending',
  authMiddleware,
  verifyBuyer,
  getBuyerPendingSubmissions
)

// Buyer: approve/reject
router.patch('/:id/approve', authMiddleware, verifyBuyer, approveSubmission)
router.patch('/:id/reject', authMiddleware, verifyBuyer, rejectSubmission)

export default router
