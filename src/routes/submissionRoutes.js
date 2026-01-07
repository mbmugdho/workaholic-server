import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import verifyBuyer from '../middlewares/verifyBuyer.js'
import verifyWorker from '../middlewares/verifyWorker.js'
import {
  approveSubmission,
  getBuyerPendingSubmissions,
  rejectSubmission,
  createWorkerSubmission,
  getWorkerMySubmissions,
  getWorkerApprovedSubmissions,
} from '../controllers/submissionController.js'

const router = Router()

// Worker
router.post('/', authMiddleware, verifyWorker, createWorkerSubmission)
router.get('/worker/my', authMiddleware, verifyWorker, getWorkerMySubmissions)
router.get(
  '/worker/approved',
  authMiddleware,
  verifyWorker,
  getWorkerApprovedSubmissions
)

// Buyer
router.get(
  '/buyer/pending',
  authMiddleware,
  verifyBuyer,
  getBuyerPendingSubmissions
)
router.patch('/:id/approve', authMiddleware, verifyBuyer, approveSubmission)
router.patch('/:id/reject', authMiddleware, verifyBuyer, rejectSubmission)

export default router
