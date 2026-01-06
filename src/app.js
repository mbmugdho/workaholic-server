import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { errorHandler } from './middlewares/errorHandler.js'

dotenv.config()

const app = express()

// middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
)
app.use(express.json())
app.use(morgan('dev'))

// health route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Workaholic API is running',
    time: new Date().toISOString(),
  })
})

// error handler (keep last)
app.use(errorHandler)

const port = process.env.PORT || 5000

async function start() {
  try {
    await connectDB()
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })
  } catch (err) {
    console.error('Server failed to start:', err.message)
    process.exit(1)
  }
}

start()
