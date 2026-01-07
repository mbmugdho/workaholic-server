import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import verifyWorker from '../middlewares/verifyWorker.js'
import {
  createWithdrawalRequest,
  getMyWithdrawals,
} from '../controllers/withdrawalController.js'

const router = Router()

// Worker withdrawals
router.post('/', authMiddleware, verifyWorker, createWithdrawalRequest)
router.get('/my', authMiddleware, verifyWorker, getMyWithdrawals)

export default router
