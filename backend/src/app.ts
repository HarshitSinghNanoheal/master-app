import express from "express"
import { corsMiddleware } from "./middleware/cors.ts"
import { errorHandler } from "./middleware/error-handler.ts"
import { apiRouter } from "./routes/index.ts"

export function createApp() {
  const app = express()

  app.use(corsMiddleware)
  app.use(express.json())
  app.use(apiRouter)
  app.use(errorHandler)

  return app
}
