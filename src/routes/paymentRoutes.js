import { Router } from 'express'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import verifyBuyer from '../middlewares/verifyBuyer.js'
import {
  createDummyPayment,
  getMyPayments,
} from '../controllers/paymentController.js'

const router = Router()

router.post('/dummy', authMiddleware, verifyBuyer, createDummyPayment)
router.get('/my', authMiddleware, verifyBuyer, getMyPayments)

export default router
