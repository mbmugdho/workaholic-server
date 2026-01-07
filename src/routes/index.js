import { Router } from 'express'
import authRoutes from './authRoutes.js'
import userRoutes from './userRoutes.js'
import statsRoutes from './statsRoutes.js'
import taskRoutes from './taskRoutes.js'
import paymentRoutes from './paymentRoutes.js'
import submissionRoutes from './submissionRoutes.js'
import withdrawalRoutes from './withdrawalRoutes.js'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API healthy' })
})

router.use('/auth', authRoutes)
router.use('/users', userRoutes)

// Phase 6 (public)
router.use('/stats', statsRoutes)

router.use('/tasks', taskRoutes)
router.use('/payments', paymentRoutes)
router.use('/submissions', submissionRoutes)
router.use('/withdrawals', withdrawalRoutes)

export default router
