import express from 'express'
import { analysisRouter } from './routes/analyses.js'
import { healthRouter } from './routes/health.js'

export function buildServer() {
  const app = express()

  app.use(express.json({ limit: '5mb' }))
  app.use('/api/health', healthRouter)
  app.use('/api/analyses', analysisRouter)

  return app
}
