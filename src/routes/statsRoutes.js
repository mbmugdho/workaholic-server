import { Router } from 'express'
import {
  getPublicStats,
  getTopWorkers,
  getBuyerSummary,
  getWorkerSummary,
} from '../controllers/statsController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import verifyBuyer from '../middlewares/verifyBuyer.js'
import verifyWorker from '../middlewares/verifyWorker.js'

const router = Router()

// Public
router.get('/top-workers', getTopWorkers)
router.get('/public', getPublicStats)

// Buyer
router.get('/buyer/summary', authMiddleware, verifyBuyer, getBuyerSummary)

// Worker
router.get('/worker/summary', authMiddleware, verifyWorker, getWorkerSummary)

export default router
