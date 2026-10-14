import { Router } from "express"
import { authRouter } from "../auth/routes.ts"
import { usersRouter } from "../users/routes.ts"
import { healthRouter } from "./health.ts"

export const apiRouter = Router()

apiRouter.get("/", (_req, res) => {
  res.json({ message: "API is running" })
})

apiRouter.use(healthRouter)
apiRouter.use("/auth", authRouter)
apiRouter.use("/users", usersRouter)
